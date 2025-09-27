// src/components/AdminBracketPanel.jsx
import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import Bracket from "./Bracket";
import { computeOverallStandings } from "../services/standingsService";

export default function AdminBracketPanel({ tournamentId, divisionId }) {
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [teamNameMap, setTeamNameMap] = useState({});
  const [teamColorMap, setTeamColorMap] = useState({});
  const [teamSeedMap, setTeamSeedMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const regsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "registrations")
        );
        const regs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRegistrations(regs);

        const matchesSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "matches")
        );
        setMatches(matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const nameMap = {};
        const colorMap = {};
        const seedMap = {};

        regs.forEach((r, index) => {
          nameMap[r.id] = r.players?.join(" / ") || r.teamName;
          // consistent color palette
          const palette = [
            "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
            "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe",
            "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000",
            "#aaffc3", "#808000", "#ffd8b1", "#000075", "#808080"
          ];
          colorMap[r.id] = palette[index % palette.length];
          seedMap[r.id] = index + 1;
        });

        setTeamNameMap(nameMap);
        setTeamColorMap(colorMap);
        setTeamSeedMap(seedMap);
      } catch (err) {
        console.error("❌ Error fetching bracket data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId && divisionId) fetchData();
  }, [tournamentId, divisionId]);

  if (loading) return <p>Loading playoffs...</p>;

  const playoffStandings = computeOverallStandings(matches, registrations);

  return (
    <div>
      <h2>Manage Playoffs</h2>
      <p>Seeds are based on pool play results (wins → diff → seed).</p>
      <Bracket
        tournamentId={tournamentId}
        divisionId={divisionId}
        standings={playoffStandings}
        teamNameMap={teamNameMap}
        teamColorMap={teamColorMap}
        teamSeedMap={teamSeedMap}
        isAdmin={true}
        isTournamentToday={true}
      />
    </div>
  );
}