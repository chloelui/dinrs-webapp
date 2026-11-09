import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoUpload from "../components/PhotoUpload";
import FoodChipInput from "../components/FoodChipInput";
import { buildUserFormData, createUser } from "../api/users";
import { DINING_HALLS } from "../data/diningHalls";
import DiningHallCheckboxes from "../components/DiningHallCheckboxes";

const EMPTY_VALUES = {
  name: "",
  email: "",
  graduationYear: "",
  major: "",
  bio: "",
};

// Returns object like { name: "Enter your first and last name." }
// Empty object means form is valid.
function validate(values, image) {
  const errors = {};

  if (values.name.trim().split(/\s+/).length < 2) {
    errors.name = "Enter your first and last name.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^\d{4}$/.test(values.graduationYear.trim())) {
    errors.graduationYear = "Enter a 4-digit year, like 2028.";
  }
  if (values.major.trim() === "") {
    errors.major = "Enter your major.";
  }
  if (values.bio.trim() === "") {
    errors.bio = "Write a short bio.";
  }
  if (!image) {
    errors.image = "Please upload a profile photo.";
  }

  return errors;
}

function CreateProfile({ onSaveProfile }) {
    const navigate = useNavigate();

    const [values, setValues] = useState(EMPTY_VALUES);
    const [image, setImage] = useState(null);
    const [halls, setHalls] = useState([]);
    const [foods, setFoods] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState("");

    function handleChange(event) {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
        setErrors({ ...errors, [name]: undefined }); // clear this field's error as they type
    }

    function handleImageChange(file) {
        setImage(file);
        setErrors({ ...errors, image: undefined });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const newErrors = validate(values, image);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setIsSaving(true);
        setSubmitError("");

        try {
            const formData = buildUserFormData({ ...values, image, halls, foods });
            const newUser = await createUser(formData);
            onSaveProfile(newUser);
            navigate("/profile");
        } catch (err) {
            console.error(err);
            setSubmitError(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    function handleCancel() {
        navigate("/");
    }

    return (
        <main className="form-page">
            <div className="form-card">
                <h1 className="form-title">Create your profile</h1>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-field">
                        <label className="form-label" htmlFor="name">Name</label>
                        <input 
                            className="form-input"
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your full name"
                            value={values.name}
                            onChange={handleChange}
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            className="form-input"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@u.northwestern.edu"
                            value={values.email}
                            onChange={handleChange} 
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="graduationYear">Graduation year</label>
                        <input 
                            className="form-input"
                            id="graduationYear"
                            name="graduationYear"
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="e.g., 2028"
                            value={values.graduationYear}
                            onChange={handleChange}
                        />
                        {errors.graduationYear && <p className="form-error">{errors.graduationYear}</p>}
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="major">Major</label>
                        <input
                            className="form-input"
                            id="major"
                            name="major"
                            type="text"
                            placeholder="e.g., Biology"
                            value={values.major}
                            onChange={handleChange}
                        />
                        {errors.major && <p className="form-error">{errors.major}</p>}
                    </div>

                    <div className="form-field">
                        <label className="form-label" htmlFor="bio">Bio</label>
                        <textarea
                            className="form-input form-input-wide"
                            id="bio"
                            name="bio"
                            placeholder="Tell people a little about yourself and what you like to eat."
                            value={values.bio}
                            onChange={handleChange}
                        />
                        {errors.bio && <p className="form-error">{errors.bio}</p>}
                    </div>

                    <div className="form-field">
                        <PhotoUpload file={image} onFileChange={handleImageChange} error={errors.image} />
                    </div>

                    <fieldset className="form-field">
                        <legend className="form-label">Dining halls you visit</legend>
                        <DiningHallCheckboxes selected={halls} onChange={setHalls} />
                    </fieldset>

                    <div className="form-field">
                        <span className="form-label">Favorite foods</span>
                        <FoodChipInput foods={foods} onFoodsChange={setFoods} />
                    </div>

                    {submitError && <p className="form-error">{submitError}</p>}
                    <div className="form-actions">
                        <button type="submit" className="btn-primary" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Profile"}
                        </button>
                        <button type="button" className="btn-outline" onClick={handleCancel}>Cancel</button>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default CreateProfile;