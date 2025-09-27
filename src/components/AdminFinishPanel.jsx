import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "./AdminPoolsPanel.module.css"; // reuse styling

export default function AdminFinishPanel({ tournamentId, divisionId }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedFinishes, setEditedFinishes] = useState({}); // track edits
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const regsRef = collection(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "registrations"
        );
        const snap = await getDocs(regsRef);
        setRegistrations(
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("❌ Error fetching registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId && divisionId) fetchRegistrations();
  }, [tournamentId, divisionId]);

  const handleFinishChange = (teamId, finish) => {
    setEditedFinishes((prev) => ({
      ...prev,
      [teamId]: finish,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [teamId, finish] of Object.entries(editedFinishes)) {
        const teamRef = doc(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "registrations",
          teamId
        );
        await updateDoc(teamRef, { finish: parseInt(finish) || null });
      }

      // Update local state
      setRegistrations((prev) =>
        prev.map((t) =>
          editedFinishes[t.id] !== undefined
            ? { ...t, finish: parseInt(editedFinishes[t.id]) || null }
            : t
        )
      );

      setEditedFinishes({});
      alert("Final placements saved!");
    } catch (err) {
      console.error("❌ Error saving finishes:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading teams...</p>;

  return (
    <div className={styles.panel}>
      <h2>Final Placements</h2>
      <ul className={styles.teamList}>
        {registrations.map((team) => (
          <li key={team.id} className={styles.teamItem}>
            <strong>{team.players?.join(" / ") || team.teamName}</strong>
            <br />
            Finish:{" "}
            <input
              type="number"
              min="1"
              value={
                editedFinishes[team.id] !== undefined
                  ? editedFinishes[team.id]
                  : team.finish ?? ""
              }
              onChange={(e) => handleFinishChange(team.id, e.target.value)}
              style={{ width: "60px", marginLeft: "8px" }}
            />
          </li>
        ))}
      </ul>
      {Object.keys(editedFinishes).length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: "16px",
            padding: "8px 16px",
            background: "var(--color-accent, #e10600)",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
}