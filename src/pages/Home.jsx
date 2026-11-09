import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import { getAllUsers } from "../api/users";

const steps = [
  { number: 1, title: "Create a profile", text: "Add your name, year, and major." },
  { number: 2, title: "Pick your dining halls and foods", text: "Choose where and what you love to eat." },
  { number: 3, title: "Connect with people who match", text: "Send a request to someone who shares your tastes." },
];

// Convert API user into the shape StudentCard expects
function toCardShape(user) {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    year: `Class of ${user.graduationYear}`,
    major: user.major,
    bio: user.bio,
    profilePicture: user.profilePicture || "",
    halls: user.diningHalls,
    foods: user.favoriteFoods,
  };
}

function Home() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [connectedIds, setConnectedIds] = useState([]);

    useEffect(() => {
        let ignore = false;

        async function loadUsers() {
            try {
                const data = await getAllUsers();
                console.log("Users from API:", data);
                if (!ignore) setUsers(data);
            } catch (err) {
                console.error(err);
                if (!ignore) setError("Couldn't load students. Please try again in a moment.");
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        loadUsers();

        return () => {
            ignore = true;
        };
    }, []);

    function handleToggleConnect(id) {
        if (connectedIds.includes(id)) {
            setConnectedIds(connectedIds.filter((existingId) => existingId !== id));
        } else {
            setConnectedIds([...connectedIds, id]);
        }
    }

    const featuredUsers = users.slice(0, 4);

    return (
        <main>
            {/* HERO */}
            <section className="section hero">
                <div className="hero-text">
                    <h1 className="hero-title">Everyone is a diner</h1>
                    <p className="hero-subtitle">Meet students who eat where you eat.</p>
                    <div className="hero-buttons">
                        <Link to="/discover" className="btn-primary">Get Started</Link>
                        <Link to="/discover" className="btn-outline">Browse Students</Link>
                    </div>
                </div>
                <img className="hero-image" src="/hero.jpg" alt="Friends sharing a meal around a table" />
            </section>

            {/* HOW IT WORKS */}
            <section className="how-it-works">
                <div className="section">
                    <h2 className="section-title">How it works.</h2>
                    <div className="steps-grid">
                        {steps.map((step) => (
                            <div key={step.number} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-text">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED STUDENTS */}
            <section className="section">
                <h2 className="section-title">Featured students</h2>

                {isLoading && (
                    <div className="loading">
                        <div className="spinner" aria-hidden="true"></div>
                        <p>Loading students…</p>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {!isLoading && !error && (
                    <div className="featured-grid">
                        {featuredUsers.map((user) => (
                            <StudentCard 
                                key={user.id}
                                student={toCardShape(user)}
                                isConnected={connectedIds.includes(user.id)}
                                onToggleConnect={handleToggleConnect}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;