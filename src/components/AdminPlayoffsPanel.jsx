// src/components/AdminPlayoffsPanel.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import Bracket from "./Bracket";
import { computeOverallStandings } from "../services/standingsService";
import styles from "./AdminPlayoffsPanel.module.css";

export default function AdminPlayoffsPanel({ tournamentId, divisionId }) {
  const [playoffMatches, setPlayoffMatches] = useState([]);
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [teamNameMap, setTeamNameMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Registrations
        const regsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "registrations")
        );
        const regs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRegistrations(regs);

        // Matches (pool play)
        const matchesSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "matches")
        );
        setMatches(matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Playoff matches
        const playoffsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs")
        );
        setPlayoffMatches(playoffsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // Team name map
        const nameMap = {};
        regs.forEach((r) => {
          nameMap[r.teamName] = r.players?.join(" / ") || r.teamName;
        });
        setTeamNameMap(nameMap);
      } catch (err) {
        console.error("❌ Error fetching playoffs data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId && divisionId) fetchData();
  }, [tournamentId, divisionId]);

  // --- Reset Bracket ---
  const handleResetBracket = async () => {
    try {
      const docsSnap = await getDocs(
        collection(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs")
      );
      for (const d of docsSnap.docs) {
        await deleteDoc(d.ref);
      }
      setPlayoffMatches([]);
      alert("✅ Playoff bracket reset!");
    } catch (err) {
      console.error("❌ Error resetting bracket:", err);
    }
  };

  if (loading) return <p>Loading playoffs...</p>;

  // --- Use shared standings helper ---
  const playoffStandings = computeOverallStandings(matches, registrations);

  return (
    <div className={styles.panel}>
      <h2>Manage Playoffs</h2>
      <p>
        Bracket seeds are based on <strong>pool play results</strong> (wins → point diff → seed).
      </p>
      <button onClick={handleResetBracket} className={styles.resetButton}>
        Reset Bracket
      </button>

      <Bracket
        tournamentId={tournamentId}
        divisionId={divisionId}
        standings={playoffStandings}
        teamNameMap={teamNameMap}
        isAdmin={true}
        isTournamentToday={false}
      />
    </div>
  );
}