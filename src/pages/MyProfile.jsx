import { useState } from "react";
import { Link } from "react-router-dom";
import ProfilePhotoEditor from "../components/ProfilePhotoEditor";
import EditableText from "../components/EditableText";
import EditActions from "../components/EditActions";
import DiningHallCheckboxes from "../components/DiningHallCheckboxes";
import FoodChipList from "../components/FoodChipList";
import FoodAddInput from "../components/FoodAddInput";
import StudentCard from "../components/StudentCard";
import { PlusIcon } from "../components/Icons";
import { students } from "../data/students";

const validators = {
  name: (v) => (v.split(/\s+/).filter(Boolean).length < 2 ? "Enter your first and last name." : ""),
  graduationYear: (v) => (/^\d{4}$/.test(v) ? "" : "Enter a 4-digit year, like 2028."),
  major: (v) => (v === "" ? "Enter your major." : ""),
  bio: (v) => (v === "" ? "Write a short bio." : ""),
};

const foodSuggestions = [...new Set(students.flatMap((s) => s.foods))].sort();

// 3 mock students sharing most dining halls + foods
function findSimilarStudents(profile) {
  const myFoods = profile.foods.map((f) => f.toLowerCase());

  return students
    .map((student) => {
      const sharedHalls = student.halls.filter((h) => profile.halls.includes(h)).length;
      const sharedFoods = student.foods.filter((f) => myFoods.includes(f.toLowerCase())).length;
      return { student, score: sharedHalls + sharedFoods };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.student);
}

function MyProfile({ profile, isLoading, onUpdateProfile, onDeleteProfile }) {
    const [connectedIds, setConnectedIds] = useState([]);
    const [isEditingHalls, setIsEditingHalls] = useState(false);
    const [draftHalls, setDraftHalls] = useState([]);
    const [isEditingFoods, setIsEditingFoods] = useState(false);
    const [draftFoods, setDraftFoods] = useState([]);

    if (isLoading) {
        return (
            <main className="page">
                <div className="loading">
                    <div className="spinner" aria-hidden="true"></div>
                    <p>Loading your profile…</p>
                </div>
            </main>
        );
    }

    // show friendly prompt if nothing saved or page refreshed
    if (!profile) {
        return (
            <main className="page">
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">You haven't created a profile yet.</p>
                <Link to="/create-profile" className="btn-primary">Create your profile</Link>
            </main>
        );
    }

    /* ----- photo ----- */
    function handleChangePhoto(file) {
        onUpdateProfile({ photoFile: file });
    }

    function handleRemovePhoto() {
        onUpdateProfile({ photoFile: null });
    }

    /* ----- dining halls ----- */
    function startEditingHalls() {
        setDraftHalls(profile.halls);
        setIsEditingHalls(true);
    }
    function saveHalls() {
        onUpdateProfile({ halls: draftHalls });
        setIsEditingHalls(false);
    }
    function cancelHalls() {
        setIsEditingHalls(false);
    }

    /* ----- favorite foods ----- */
    function startEditingFoods() {
        setDraftFoods(profile.foods);
        setIsEditingFoods(true);
    }
    function saveFoods() {
        onUpdateProfile({ foods: draftFoods });
        setIsEditingFoods(false);
    }
    function cancelFoods() {
        setIsEditingFoods(false);
    }

    /* ----- similar students ----- */
    function handleToggleConnect(id) {
        if (connectedIds.includes(id)) {
            setConnectedIds(connectedIds.filter((existingId) => existingId !== id));
        } else {
            setConnectedIds([...connectedIds, id]);
        }
    }

    const similarStudents = findSimilarStudents(profile);

    return (
        <main className="page">
            <div className="profile-layout">
                {/* ---------- LEFT COLUMN ---------- */}
                <aside className="profile-sidebar">
                    <ProfilePhotoEditor
                        photoUrl={profile.photoUrl}
                        name={profile.name}
                        onChangePhoto={handleChangePhoto}
                        onRemovePhoto={handleRemovePhoto}
                    />

                    <div className="profile-name-row">
                        <EditableText
                            label="name"
                            value={profile.name}
                            validate={validators.name}
                            onSave={(name) => onUpdateProfile({ name })}
                        >
                            <h1 className="profile-name">{profile.name}</h1>
                        </EditableText>
                    </div>

                    <div className="profile-meta-row">
                        <EditableText
                            label="graduation year"
                            value={profile.graduationYear}
                            validate={validators.graduationYear}
                            inputMode="numeric"
                            maxLength={4}
                            onSave={(graduationYear) => onUpdateProfile({ graduationYear })}
                        >
                            <span className="profile-meta">Class of {profile.graduationYear}</span>
                        </EditableText>

                        <span className="meta-dot" aria-hidden="true">·</span>

                        <EditableText
                            label="major"
                            value={profile.major}
                            validate={validators.major}
                            onSave={(major) => onUpdateProfile({ major })}
                        >
                            <span className="profile-meta">{profile.major}</span>
                        </EditableText>
                    </div>

                    <button
                        type="button"
                        className="btn-danger btn-small profile-delete"
                        onClick={() => {
                            if (window.confirm("Delete your profile? This can't be undone.")) {
                                onDeleteProfile();
                            }
                        }}
                    >
                        Delete profile
                    </button>
                </aside>

                {/* ---------- RIGHT COLUMN ---------- */}
                <div className="profile-main">
                    <section className="profile-section">
                        <h2 className="profile-section-title">About me</h2>
                        <EditableText
                            label="about me"
                            value={profile.bio}
                            validate={validators.bio}
                            multiline
                            alignTop
                            onSave={(bio) => onUpdateProfile({ bio })}
                        >
                            <p className="profile-bio">{profile.bio}</p>
                        </EditableText>
                    </section>

                    <section className="profile-section">
                        <h2 className="profile-section-title">My usual dining spots</h2>
                        <div className="inline-row">
                            <p className="profile-bio">
                                {profile.halls.length > 0
                                ? profile.halls.join(" · ")
                                : "No dining halls selected yet."}
                            </p>
                            {!isEditingHalls && (
                                <button
                                    type="button"
                                    className="btn-outline btn-circle"
                                    onClick={startEditingHalls}
                                    aria-label="Edit dining halls"
                                >
                                    <PlusIcon />
                                </button>
                            )}
                        </div>

                        {isEditingHalls && (
                            <div className="edit-panel">
                                <DiningHallCheckboxes selected={draftHalls} onChange={setDraftHalls} />
                                <EditAction onSave={saveHalls} onCancel={cancelHalls} />
                            </div>
                        )}
                    </section>

                    <section className="profile-section">
                        <h2 className="profile-section-title">Favorite foods</h2>
                        <FoodChipList
                            foods={isEditingFoods ? draftFoods : profile.foods}
                            onRemove={
                                isEditingFoods
                                ? (food) => setDraftFoods(draftFoods.filter((f) => f !== food))
                                : undefined
                            }
                        >
                            {!isEditingFoods && (
                                <button
                                    type="button"
                                    className="btn-outline btn-circle"
                                    onClick={startEditingFoods}
                                    aria-label="Add favorite foods"
                                >
                                    <PlusIcon />
                                </button>
                            )}
                        </FoodChipList>

                        {isEditingFoods && (
                            <div className="edit-panel">
                                <FoodAddInput
                                    existingFoods={draftFoods}
                                    onAddFood={(food) => setDraftFoods([...draftFoods, food])}
                                    suggestions={foodSuggestions}
                                    autoFocus
                                />
                                <EditActions onSave={saveFoods} onCancel={cancelFoods} />
                            </div>
                        )}
                    </section>

                    <section className="profile-section">
                        <h2 className="profile-section-title">Students with similar tastes</h2>
                        {similarStudents.length === 0 ? (
                            <p className="profile-bio">
                                Add dining halls or favorite foods to see students with similar tastes.
                            </p>
                        ) : (
                            <div className="similar-grid">
                                {similarStudents.map((student) => (
                                    <StudentCard
                                        key={student.id}
                                        student={student}
                                        isConnected={connectedIds.includes(student.id)}
                                        onToggleConnect={handleToggleConnect}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default MyProfile;