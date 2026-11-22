import { useState, useEffect, useMemo } from "react";
import StudentCard from "../components/StudentCard";
import { getAllUsers } from "../api/users";
import useConnections from "../hooks/useConnections";
import { toCardShape } from "../utils/students";

const yearOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

const PAGE_SIZE = 8;

function Discover({ isLoggedIn, myProfile }) {
  const meId = myProfile?.id;

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ diningHall: "", foodType: "", year: "" });
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { connectedIds, toggleConnect } = useConnections(meId);

  // Load all students from server once when page opens
  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        const data = await getAllUsers();
        if (!ignore) setUsers(data);
      } catch (err) {
        console.error(err);
        if (!ignore) setError("Couldn't load students. Please try again in a moment.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {ignore = true;};
  }, []);

  useEffect(() => {
    document.title = connectedIds.length > 0 ? `dinrs (${connectedIds.length} connected)` : "dinrs";
  }, [connectedIds]);

  // Users (except me) shown in card shape
  const students = useMemo(
    () => users.map(toCardShape).filter((s) => s.id !== meId),
    [users, meId]
  );

  const diningHallOptions = useMemo(
    () => [...new Set(students.flatMap((s) => s.halls))].sort(),
    [students]
  );
  const foodOptions = useMemo(
    () => [...new Set(students.flatMap((s) => s.foods))].sort(),
    [students]
  );

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
    setVisibleCount(PAGE_SIZE);
  }

  function handleLoadMore() {
    setVisibleCount(visibleCount + 4);
  }

  const search = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      search === "" ||
      s.name.toLowerCase().includes(search) ||
      s.major.toLowerCase().includes(search) ||
      s.foods.some((food) => food.toLowerCase().includes(search)) ||
      s.halls.some((hall) => hall.toLowerCase().includes(search));
    const matchesHall = filters.diningHall === "" || s.halls.includes(filters.diningHall);
    const matchesFood = filters.foodType === "" || s.foods.includes(filters.foodType);
    const matchesYear = filters.year === "" || s.standing === filters.year;
    return matchesSearch && matchesHall && matchesFood && matchesYear;
  });

  const visibleStudents = filteredStudents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStudents.length;

    return (
    <main className="page">
      <h1 className="page-title">Discover students</h1>
      <p className="page-subtitle">
        {isLoggedIn
          ? `Find people who eat where you eat. You have ${connectedIds.length} connection${connectedIds.length === 1 ? "" : "s"}.`
          : "Find people who eat where you eat."}
      </p>

      <div className="filter-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select className="filter-pill" name="diningHall" value={filters.diningHall} onChange={handleFilterChange}>
          <option value="">Dining Hall</option>
          {diningHallOptions.map((hall) => (
            <option key={hall} value={hall}>{hall}</option>
          ))}
        </select>

        <select className="filter-pill" name="foodType" value={filters.foodType} onChange={handleFilterChange}>
          <option value="">Food Type</option>
          {foodOptions.map((food) => (
            <option key={food} value={food}>{food}</option>
          ))}
        </select>

        <select className="filter-pill" name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">Year</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="loading">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading students…</p>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && visibleStudents.length === 0 && (
        <p className="empty-message">No students match those filters. Try clearing one.</p>
      )}

      {!isLoading && !error && visibleStudents.length > 0 && (
        <div className="card-grid">
          {visibleStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isConnected={connectedIds.includes(student.id)}
              onToggleConnect={toggleConnect}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="load-more-wrap">
          <button className="btn-outline" onClick={handleLoadMore}>Load more</button>
        </div>
      )}
    </main>
  );
}

export default Discover;