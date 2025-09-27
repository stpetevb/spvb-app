import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import styles from "./HomePage.module.css";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/spvb_logo_transparent.png"; // NEW import

export default function HomePage() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const { isAdmin } = useAuth();

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

  const renderTournamentRow = (t) => {
    const deadline = t.registrationDeadline?.toDate
      ? t.registrationDeadline.toDate()
      : t.registrationDeadline
      ? new Date(t.registrationDeadline)
      : null;

    const now = new Date();
    const isClosed = deadline && now > deadline;

    return (
      <li key={t.id} className={styles.tournamentRow}>
        <div className={styles.tournamentInfo}>
          <Link to={`/t/${t.id}`}>
            <strong>{t.name}</strong> — {t.location} —{" "}
            {t.eventDate.toLocaleDateString()}{" "}
            {t.status === "active" && (
              <span className={styles.activeLabel}>Active Now</span>
            )}
          </Link>
        </div>
        <div className={styles.actions}>
          {deadline && (
            <span className={styles.deadline}>
              Closes: {deadline.toLocaleDateString()}
            </span>
          )}
          {(!isClosed || isAdmin) ? (
            <Link to={`/t/${t.id}/register`} className={styles.registerBtn}>
              Register
            </Link>
          ) : (
            <span className={styles.closed}>Closed</span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className={styles.home}>
      <div className={styles.header}>
        {/* NEW logo above heading */}
        <img src={logo} alt="SPVB Logo" />
        <h1>St. Pete Volleyball</h1>
        <p>Welcome to our tournament platform!</p>
      </div>

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

      {activeTab === "upcoming" && (
        <ul className={styles.tournamentList}>
          {upcomingTournaments.length === 0 ? (
            <p>No upcoming tournaments.</p>
          ) : (
            upcomingTournaments.map(renderTournamentRow)
          )}
        </ul>
      )}

      {activeTab === "completed" && (
        <ul className={styles.tournamentList}>
          {completedTournaments.length === 0 ? (
            <p>No completed tournaments yet.</p>
          ) : (
            completedTournaments.map((t) => (
              <li key={t.id} className={styles.tournamentRow}>
                <Link to={`/t/${t.id}`}>
                  <strong>{t.name}</strong> — {t.location} —{" "}
                  {t.eventDate.toLocaleDateString()}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}