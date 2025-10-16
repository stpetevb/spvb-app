// src/components/AdminPoolsPanel.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { TEAM_COLORS } from "../services/standingsService";
import styles from "./AdminPoolsPanel.module.css";

export default function AdminPoolsPanel({ tournamentId, divisionId }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState([]);
  const [matches, setMatches] = useState([]);
  const [numPools, setNumPools] = useState(2);
  const [matchesPerTeam, setMatchesPerTeam] = useState(3);

  // Fetch registrations
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
          snap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      } catch (err) {
        console.error("❌ Error fetching registrations:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId && divisionId) fetchRegistrations();
  }, [tournamentId, divisionId]);

  // Fetch pools + matches
  useEffect(() => {
    const fetchPoolsAndMatches = async () => {
      try {
        const poolsRef = collection(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "pools"
        );
        const poolsSnap = await getDocs(poolsRef);
        setPools(poolsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const matchesRef = collection(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "matches"
        );
        const matchesSnap = await getDocs(matchesRef);
        setMatches(matchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("❌ Error fetching pools/matches:", err);
      }
    };

    if (tournamentId && divisionId) fetchPoolsAndMatches();
  }, [tournamentId, divisionId]);

  // --- Update seed for a team ---
  const handleSeedChange = async (teamId, seed) => {
    try {
      const teamRef = doc(
        db,
        "tournaments",
        tournamentId,
        "divisions",
        divisionId,
        "registrations",
        teamId
      );
      await updateDoc(teamRef, { seed: parseInt(seed) || null });
      setRegistrations((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, seed: parseInt(seed) || null } : t
        )
      );
    } catch (err) {
      console.error("❌ Error updating seed:", err);
    }
  };

  // --- Reset pools & matches ---
  const handleReset = async () => {
    try {
      const poolDocs = await getDocs(
        collection(db, "tournaments", tournamentId, "divisions", divisionId, "pools")
      );
      poolDocs.forEach(async (d) => {
        await deleteDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "pools", d.id)
        );
      });

      const matchDocs = await getDocs(
        collection(db, "tournaments", tournamentId, "divisions", divisionId, "matches")
      );
      matchDocs.forEach(async (d) => {
        await deleteDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "matches", d.id)
        );
      });

      setPools([]);
      setMatches([]);
      alert("Pools & matches reset!");
    } catch (err) {
      console.error("❌ Error resetting pools/matches:", err);
    }
  };

  // --- Generate pools & matches ---
  const handleGeneratePools = async () => {
    if (!registrations.length) {
      alert("No teams registered yet!");
      return;
    }

    try {
      // Sort by seed
      const seededTeams = [...registrations].sort((a, b) => {
        if (a.seed == null && b.seed == null) return 0;
        if (a.seed == null) return 1;
        if (b.seed == null) return -1;
        return a.seed - b.seed;
      });

      // Snake draft distribution
      const newPools = Array.from({ length: numPools }, () => []);
      let direction = 1;
      let poolIndex = 0;

      for (const team of seededTeams) {
        newPools[poolIndex].push(team);
        poolIndex += direction;
        if (poolIndex === numPools) {
          direction = -1;
          poolIndex = numPools - 1;
        } else if (poolIndex < 0) {
          direction = 1;
          poolIndex = 0;
        }
      }

      // Save pools with players
      for (let i = 0; i < newPools.length; i++) {
        const poolId = `pool_${i + 1}`;
        await setDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "pools", poolId),
          {
            name: `Pool ${String.fromCharCode(65 + i)}`,
            teams: newPools[i].map((t) => ({
              teamName: t.teamName,
              players: t.players || [],
            })),
          }
        );
      }

      // Generate matches with players
      for (let i = 0; i < newPools.length; i++) {
        const poolTeams = newPools[i];
        const poolName = `Pool ${String.fromCharCode(65 + i)}`;
        for (let a = 0; a < poolTeams.length; a++) {
          for (let b = a + 1; b < poolTeams.length; b++) {
            const teamA = poolTeams[a];
            const teamB = poolTeams[b];
            await addDoc(
              collection(db, "tournaments", tournamentId, "divisions", divisionId, "matches"),
              {
                pool: poolName,
                teamA: teamA.teamName,
                teamB: teamB.teamName,
                teamAPlayers: teamA.players || [],
                teamBPlayers: teamB.players || [],
                scoreA: null,
                scoreB: null,
                playerScoreA: null,
                playerScoreB: null,
                adminLocked: false,
                status: "pending",
              }
            );
          }
        }
      }

      alert("Pools and matches generated successfully!");
    } catch (err) {
      console.error("❌ Error generating pools:", err);
    }
  };

  if (loading) return <p>Loading registrations...</p>;

  // Sort teams by seed for display
  const sortedTeams = [...registrations].sort((a, b) => {
    if (a.seed == null && b.seed == null) return 0;
    if (a.seed == null) return 1;
    if (b.seed == null) return -1;
    return a.seed - b.seed;
  });

  return (
    <div className={styles.panel}>
      <h2>Registered Teams</h2>
      {registrations.length === 0 ? (
        <p>No teams registered yet.</p>
      ) : (
        <table className={styles.teamTable}>
          <thead>
            <tr>
              <th>Team</th>
              <th>Players</th>
              <th>Seed</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, idx) => (
              <tr key={team.id}>
                <td className={styles.teamCell}>
                  <div className={styles.teamIconWrapper}>
                    <div
                      className={styles.teamIcon}
                      style={{ backgroundColor: TEAM_COLORS[idx % TEAM_COLORS.length] }}
                    ></div>
                    <span className={styles.seedNumber}>
                      {team.seed ?? "—"}
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
                    value={team.seed ?? ""}
                    onChange={(e) => handleSeedChange(team.id, e.target.value)}
                    className={styles.seedInput}
                    placeholder="—"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.generator}>
        <h3>Generate Pools</h3>
        <label>
          Number of Pools:{" "}
          <input
            type="number"
            min="1"
            value={numPools}
            onChange={(e) => setNumPools(parseInt(e.target.value))}
          />
        </label>
        <label>
          Matches per Team:{" "}
          <input
            type="number"
            min="1"
            value={matchesPerTeam}
            onChange={(e) => setMatchesPerTeam(parseInt(e.target.value))}
          />
        </label>
        <button onClick={handleGeneratePools}>Generate Pools & Matches</button>
        <button onClick={handleReset} className={styles.resetButton}>
          Reset All
        </button>
      </div>
    </div>
  );
}