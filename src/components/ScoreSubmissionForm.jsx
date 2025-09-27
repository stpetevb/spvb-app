import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "./ScoreSubmissionForm.module.css";

export default function ScoreSubmissionForm({ tournamentId, matchId }) {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const matchRef = doc(db, "tournaments", tournamentId, "matches", matchId);
      const winnerId =
        scoreA > scoreB ? "teamA" : scoreB > scoreA ? "teamB" : null;

      await updateDoc(matchRef, {
        scoreA: parseInt(scoreA, 10),
        scoreB: parseInt(scoreB, 10),
        status: "final",
        winnerId,
      });

      setMessage("Score submitted!");
      setScoreA("");
      setScoreB("");
    } catch (err) {
      console.error("Error submitting score:", err);
      setMessage("Failed to submit score. Try again.");
    }

    setLoading(false);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputs}>
        <input
          type="number"
          placeholder="Team A Score"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Team B Score"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading} className={styles.button}>
        {loading ? "Submitting..." : "Submit Score"}
      </button>
      {message && <p className={styles.message}>{message}</p>}
    </form>
  );
}