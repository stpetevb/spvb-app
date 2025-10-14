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

  // Sort teams by finish for display
  const sortedTeams = [...registrations].sort((a, b) => {
    const finishA = editedFinishes[a.id] !== undefined ? editedFinishes[a.id] : a.finish;
    const finishB = editedFinishes[b.id] !== undefined ? editedFinishes[b.id] : b.finish;
    if (finishA == null && finishB == null) return 0;
    if (finishA == null) return 1;
    if (finishB == null) return -1;
    return finishA - finishB;
  });

  return (
    <div className={styles.panel}>
      <h2>Final Placements</h2>
      {registrations.length === 0 ? (
        <p>No teams registered yet.</p>
      ) : (
        <table className={styles.teamTable}>
          <thead>
            <tr>
              <th>Team</th>
              <th>Players</th>
              <th>Finish</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, idx) => {
              const currentFinish = editedFinishes[team.id] !== undefined
                ? editedFinishes[team.id]
                : team.finish;
              return (
                <tr key={team.id}>
                  <td className={styles.teamCell}>
                    <div className={styles.teamIconWrapper}>
                      <div
                        className={styles.teamIcon}
                        style={{ backgroundColor: `hsl(${(idx * 45) % 360}, 70%, 50%)` }}
                      ></div>
                      <span className={styles.seedNumber}>
                        {currentFinish ?? "—"}
                      </span>
                    </div>
                    <strong>{team.teamName}</strong>
                  </td>
                  <td>
                    {team.players?.length > 0
                      ? team.players.join(" / ")
                      : "—"}
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={currentFinish ?? ""}
                      onChange={(e) => handleFinishChange(team.id, e.target.value)}
                      className={styles.seedInput}
                      placeholder="—"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {Object.keys(editedFinishes).length > 0 && (
        <div className={styles.generator}>
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}