import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { FaRegEdit, FaTrash } from "react-icons/fa"; // NEW import
import styles from "./AdminPage.module.css";

// Helper to parse "YYYY-MM-DD" as local date
function parseLocalDate(str) {
  if (!str) return null;
  const [year, month, day] = str.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export default function AdminPage() {
  const [tournaments, setTournaments] = useState([]);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [divisions, setDivisions] = useState("AA,A,BB,B");
  const [teamSizes, setTeamSizes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Fetch tournaments on load
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tournaments"));
        const data = querySnapshot.docs.map((docSnap) => {
          const t = { id: docSnap.id, ...docSnap.data() };

          // Compute status dynamically
          const today = new Date();
          const eventDate = t.date?.toDate ? t.date.toDate() : new Date(t.date);

          let status = "upcoming";
          if (today.toDateString() === eventDate.toDateString()) {
            status = "active";
          } else if (today > eventDate) {
            status = "completed";
          }

          return { ...t, status, eventDate };
        });

        setTournaments(data);
      } catch (err) {
        console.error("Error fetching tournaments:", err);
      }
    };

    fetchTournaments();
  }, []);

  // Handle team size input
  const handleTeamSizeChange = (divisionId, value) => {
    setTeamSizes((prev) => ({
      ...prev,
      [divisionId]: parseInt(value, 10) || 0,
    }));
  };

  // Create new tournament
  const handleCreateTournament = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const divisionsArray = divisions
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const divisionsWithIds = divisionsArray.map((d) => ({
        id: d.toLowerCase().replace(/\s+/g, "-"),
        name: d,
      }));

      const teamSizesById = {};
      divisionsWithIds.forEach((div) => {
        teamSizesById[div.id] = teamSizes[div.id] || 2;
      });

      await addDoc(collection(db, "tournaments"), {
        name,
        location,
        date: parseLocalDate(date),
        registrationDeadline: registrationDeadline
          ? parseLocalDate(registrationDeadline)
          : parseLocalDate(date),
        divisions: divisionsWithIds,
        teamSizes: teamSizesById,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setName("");
      setLocation("");
      setDate("");
      setRegistrationDeadline("");
      setDivisions("AA,A,BB,B");
      setTeamSizes({});

      alert("Tournament created!");
    } catch (err) {
      console.error("Error creating tournament:", err);
      setError("Failed to create tournament. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Edit tournament
  const handleEditTournament = async (id, updates) => {
    try {
      const ref = doc(db, "tournaments", id);

      const safeUpdates = { ...updates };
      if (safeUpdates.date && typeof safeUpdates.date === "string") {
        safeUpdates.date = parseLocalDate(safeUpdates.date);
      }
      if (
        safeUpdates.registrationDeadline &&
        typeof safeUpdates.registrationDeadline === "string"
      ) {
        safeUpdates.registrationDeadline = parseLocalDate(
          safeUpdates.registrationDeadline
        );
      }

      await updateDoc(ref, {
        ...safeUpdates,
        updatedAt: serverTimestamp(),
      });

      setTournaments((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                ...safeUpdates,
                eventDate: safeUpdates.date || t.eventDate,
              }
            : t
        )
      );

      alert("Tournament updated!");
      setEditingId(null);
    } catch (err) {
      console.error("Error updating tournament:", err);
      setError("Failed to update tournament.");
    }
  };

  // Delete tournament
  const handleDeleteTournament = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) {
      return;
    }
    try {
      await deleteDoc(doc(db, "tournaments", id));
      alert("Tournament deleted!");
      setTournaments(tournaments.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting tournament:", err);
      setError("Failed to delete tournament.");
    }
  };

  const upcomingTournaments = tournaments
    .filter((t) => t.status === "upcoming" || t.status === "active")
    .sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return a.eventDate - b.eventDate;
    });

  const completedTournaments = tournaments
    .filter((t) => t.status === "completed")
    .sort((a, b) => b.eventDate - a.eventDate);

  const currentDivisionIds = divisions
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => d.toLowerCase().replace(/\s+/g, "-"));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      {/* Create Tournament Form */}
      <form className={styles.form} onSubmit={handleCreateTournament}>
        <h2 className={styles.formTitle}>Create Tournament</h2>

        <label className={styles.label}>Tournament Name</label>
        <input
          type="text"
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label className={styles.label}>Location</label>
        <input
          type="text"
          className={styles.input}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <label className={styles.label}>Date</label>
        <input
          type="date"
          className={styles.input}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label className={styles.label}>Registration Deadline</label>
        <input
          type="date"
          className={styles.input}
          value={registrationDeadline}
          onChange={(e) => setRegistrationDeadline(e.target.value)}
        />

        <label className={styles.label}>Divisions (comma separated)</label>
        <input
          type="text"
          className={styles.input}
          value={divisions}
          onChange={(e) => setDivisions(e.target.value)}
        />

        {currentDivisionIds.map((id, idx) => {
          const name = divisions.split(",")[idx]?.trim() || "";
          return (
            <div key={id} className={styles.divisionSizeRow}>
              <label className={styles.label}>
                {name} Team Size
                <input
                  type="number"
                  className={styles.inputSmall}
                  value={teamSizes[id] || ""}
                  onChange={(e) => handleTeamSizeChange(id, e.target.value)}
                  min="1"
                />
              </label>
            </div>
          );
        })}

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create Tournament"}
        </button>
      </form>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "upcoming" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "completed" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {/* Tournament Lists */}
      {activeTab === "upcoming" && (
        <ul className={styles.list}>
          {upcomingTournaments.length === 0 ? (
            <p>No upcoming tournaments.</p>
          ) : (
            upcomingTournaments.map((t) => (
              <li key={t.id} className={styles.listItem}>
                {editingId === t.id ? (
                  <form
                    className={styles.inlineForm}
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleEditTournament(t.id, {
                        name: e.target.name.value,
                        location: e.target.location.value,
                        date: e.target.date.value,
                        registrationDeadline: e.target.registrationDeadline.value,
                      });
                    }}
                  >
                    <input
                      type="text"
                      name="name"
                      defaultValue={t.name}
                      className={styles.inputSmall}
                      required
                    />
                    <input
                      type="text"
                      name="location"
                      defaultValue={t.location}
                      className={styles.inputSmall}
                      required
                    />
                    <input
                      type="date"
                      name="date"
                      defaultValue={
                        t.date?.toDate
                          ? t.date.toDate().toISOString().substring(0, 10)
                          : new Date(t.date).toISOString().substring(0, 10)
                      }
                      className={styles.inputSmall}
                      required
                    />
                    <input
                      type="date"
                      name="registrationDeadline"
                      defaultValue={
                        t.registrationDeadline?.toDate
                          ? t.registrationDeadline
                              .toDate()
                              .toISOString()
                              .substring(0, 10)
                          : t.registrationDeadline
                          ? new Date(t.registrationDeadline)
                              .toISOString()
                              .substring(0, 10)
                          : ""
                      }
                      className={styles.inputSmall}
                    />
                    <button type="submit" className={styles.buttonSmall}>
                      ✔
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className={styles.buttonSmallAlt}
                    >
                      ✖
                    </button>
                  </form>
                ) : (
                  <div className={styles.tournamentRow}>
                    <span>
                      <Link to={`/admin/tournament/${t.id}`}>
                        <strong>{t.name}</strong> — {t.location} —{" "}
                        {t.eventDate.toLocaleDateString()} ({t.status})
                      </Link>
                    </span>
                    <div className={styles.actions}>
                      <button
                        onClick={() => setEditingId(t.id)}
                        className={styles.buttonSmall}
                        aria-label="Edit"
                      >
                        <FaRegEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        className={styles.buttonSmallAlt}
                        aria-label="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      )}

      {activeTab === "completed" && (
        <ul className={styles.list}>
          {completedTournaments.length === 0 ? (
            <p>No completed tournaments.</p>
          ) : (
            completedTournaments.map((t) => (
              <li key={t.id} className={styles.listItem}>
                <div className={styles.tournamentRow}>
                  <span>
                    <Link to={`/admin/tournament/${t.id}`}>
                      <strong>{t.name}</strong> — {t.location} —{" "}
                      {t.eventDate.toLocaleDateString()} ({t.status})
                    </Link>
                  </span>
                  <div className={styles.actions}>
                    <button
                      onClick={() => setEditingId(t.id)}
                      className={styles.buttonSmall}
                      aria-label="Edit"
                    >
                      <FaRegEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteTournament(t.id)}
                      className={styles.buttonSmallAlt}
                      aria-label="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}