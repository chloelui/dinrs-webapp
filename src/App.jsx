import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import CreateProfile from "./pages/CreateProfile";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";
import {
  getUserById,
  updateUser,
  deleteUser,
  buildUpdateFormData,
  userToProfile,
} from "./api/users";

const MY_ID_KEY = "dinrs-my-user-id";

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const [isRestoring, setIsRestoring] = useState(() => localStorage.getItem(MY_ID_KEY) !== null);

  // On page load: if this browser remembers a profile id, fetch that profile.
  useEffect(() => {
    const savedId = localStorage.getItem(MY_ID_KEY);
    if (!savedId) return;

    let ignore = false;
    getUserById(savedId)
      .then((user) => {
        if (!ignore) setMyProfile(userToProfile(user));
      })
      .catch((err) => {
        console.error(err);
        if (err.status === 404) localStorage.removeItem(MY_ID_KEY); // that user was deleted
      })
      .finally(() => {
        if (!ignore) setIsRestoring(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    setIsLoggedIn(false);
  }

  // Called by CreateProfile with the user object the API just created.
  function handleSaveProfile(user) {
    setMyProfile(userToProfile(user));
    localStorage.setItem(MY_ID_KEY, String(user.id));
    setIsLoggedIn(true);
  }

  async function handleUpdateProfile(changes) {
    try {
      const updated = await updateUser(myProfile.id, buildUpdateFormData(changes));
      setMyProfile(userToProfile(updated));
    } catch (err) {
      console.error(err);
      alert(`Couldn't save your change: ${err.message}`);
    }
  }

  async function handleDeleteProfile() {
    try {
      await deleteUser(myProfile.id);
      localStorage.removeItem(MY_ID_KEY);
      setMyProfile(null);
      setIsLoggedIn(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert(`Couldn't delete your profile: ${err.message}`);
    }
  }

  return (
    <div className="app">
      <NavBar
        isLoggedIn={isLoggedIn}
        hasProfile={myProfile !== null}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<Discover isLoggedIn={isLoggedIn} />} />
        <Route path="/create-profile" element={<CreateProfile onSaveProfile={handleSaveProfile} />} />
        <Route
          path="/profile"
          element={
            <MyProfile
              profile={myProfile}
              isLoading={isRestoring}
              onUpdateProfile={handleUpdateProfile}
              onDeleteProfile={handleDeleteProfile}
            />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;