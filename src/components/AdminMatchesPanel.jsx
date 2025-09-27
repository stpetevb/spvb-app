// src/components/AdminMatchesPanel.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "./AdminMatchesPanel.module.css";

export default function AdminMatchesPanel({ tournamentId, divisionId }) {
  const [matches, setMatches] = useState([]);
  const [pools, setPools] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingMatch, setEditingMatch] = useState(null);
  const [newMatch, setNewMatch] = useState({ pool: "", teamA: "", teamB: "" });

  // Fetch pools, matches, registrations
  useEffect(() => {
    const fetchData = async () => {
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

        const regsRef = collection(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "registrations"
        );
        const regsSnap = await getDocs(regsRef);
        setRegistrations(regsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("❌ Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId && divisionId) fetchData();
  }, [tournamentId, divisionId]);

  // Save score
  const handleSave = async () => {
    if (!editingMatch) return;
    try {
      const matchDoc = doc(
        db,
        "tournaments",
        tournamentId,
        "divisions",
        divisionId,
        "matches",
        editingMatch.id
      );

      const scoreA = editingMatch.scoreA ?? null;
      const scoreB = editingMatch.scoreB ?? null;

      await updateDoc(matchDoc, {
        scoreA,
        scoreB,
        status: scoreA != null && scoreB != null ? "final" : "pending",
        adminLocked: true,
      });

      setMatches((prev) =>
        prev.map((m) =>
          m.id === editingMatch.id
            ? {
                ...editingMatch,
                scoreA,
                scoreB,
                adminLocked: true,
                status: scoreA != null && scoreB != null ? "final" : "pending",
              }
            : m
        )
      );
      setEditingMatch(null);
    } catch (err) {
      console.error("❌ Error saving match:", err);
    }
  };

  // Delete match
  const handleDelete = async (matchId) => {
    try {
      await deleteDoc(
        doc(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "matches",
          matchId
        )
      );
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
    } catch (err) {
      console.error("❌ Error deleting match:", err);
    }
  };

  // Add custom match
  const handleAdd = async () => {
    if (!newMatch.pool || !newMatch.teamA || !newMatch.teamB) {
      alert("Fill all fields");
      return;
    }

    const teamAData = registrations.find((r) => r.teamName === newMatch.teamA);
    const teamBData = registrations.find((r) => r.teamName === newMatch.teamB);

    try {
      const newMatchDoc = {
        pool: newMatch.pool,
        teamA: teamAData?.teamName || newMatch.teamA,
        teamB: teamBData?.teamName || newMatch.teamB,
        teamAPlayers: teamAData?.players || [],
        teamBPlayers: teamBData?.players || [],
        scoreA: null,
        scoreB: null,
        playerScoreA: null,
        playerScoreB: null,
        adminLocked: false,
        status: "pending",
      };

      const newDocRef = await addDoc(
        collection(
          db,
          "tournaments",
          tournamentId,
          "divisions",
          divisionId,
          "matches"
        ),
        newMatchDoc
      );

      setMatches((prev) => [...prev, { id: newDocRef.id, ...newMatchDoc }]);
      setNewMatch({ pool: "", teamA: "", teamB: "" });
    } catch (err) {
      console.error("❌ Error adding match:", err);
    }
  };

  if (loading) return <p>Loading matches...</p>;

  // Group matches by pool
  const matchesByPool = pools.reduce((acc, pool) => {
    acc[pool.name] = matches.filter((m) => m.pool === pool.name);
    return acc;
  }, {});

  // Display helper
  const displayTeam = (match, side) => {
    const players = match[`${side}Players`];
    return players?.length ? players.join(" / ") : match[side];
  };

  return (
    <div className={styles.panel}>
      <h2>Manage Matches</h2>

      {Object.keys(matchesByPool).map((poolName) => (
        <div key={poolName} className={styles.poolCard}>
          <h3>{poolName}</h3>
          <ul>
            {matchesByPool[poolName].map((match) => (
              <li key={match.id}>
                {editingMatch?.id === match.id ? (
                  <>
                    <strong>{displayTeam(match, "teamA")}</strong>
                    <input
                      type="number"
                      value={editingMatch.scoreA ?? ""}
                      onChange={(e) =>
                        setEditingMatch((prev) => ({
                          ...prev,
                          scoreA: e.target.value === "" ? null : parseInt(e.target.value, 10),
                        }))
                      }
                    />
                    vs
                    <input
                      type="number"
                      value={editingMatch.scoreB ?? ""}
                      onChange={(e) =>
                        setEditingMatch((prev) => ({
                          ...prev,
                          scoreB: e.target.value === "" ? null : parseInt(e.target.value, 10),
                        }))
                      }
                    />
                    <strong>{displayTeam(match, "teamB")}</strong>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setEditingMatch(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span>
                      <strong>{displayTeam(match, "teamA")}</strong>{" "}
                      {match.scoreA ?? "-"} - {match.scoreB ?? "-"}{" "}
                      <strong>{displayTeam(match, "teamB")}</strong>
                      {match.adminLocked && " (Locked)"}
                    </span>
                    <button onClick={() => setEditingMatch(match)}>Edit</button>
                    <button onClick={() => handleDelete(match.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h3>Add Match</h3>
        <select
          value={newMatch.pool}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, pool: e.target.value }))
          }
        >
          <option value="">Select Pool</option>
          {pools.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={newMatch.teamA}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, teamA: e.target.value }))
          }
        >
          <option value="">Select Team A</option>
          {registrations.map((r) => (
            <option key={r.id} value={r.teamName}>
              {r.players?.join(" / ") || r.teamName}
            </option>
          ))}
        </select>
        <select
          value={newMatch.teamB}
          onChange={(e) =>
            setNewMatch((prev) => ({ ...prev, teamB: e.target.value }))
          }
        >
          <option value="">Select Team B</option>
          {registrations.map((r) => (
            <option key={r.id} value={r.teamName}>
              {r.players?.join(" / ") || r.teamName}
            </option>
          ))}
        </select>
        <button onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}