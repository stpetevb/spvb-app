import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import AdminPoolsPanel from "../components/AdminPoolsPanel";
import AdminMatchesPanel from "../components/AdminMatchesPanel";
import Bracket from "../components/Bracket";
import AdminFinishPanel from "../components/AdminFinishPanel"; // NEW import
import { computeOverallStandings, buildTeamMaps } from "../services/standingsService";
import "./AdminTournamentDetail.module.css";

export default function AdminTournamentDetail() {
  const { tournamentId } = useParams();

  const [tournament, setTournament] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivisionId, setSelectedDivisionId] = useState(null);

  const [pools, setPools] = useState([]);
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activePanel, setActivePanel] = useState("pools");

  // Fetch tournament + divisions
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tDoc = await getDoc(doc(db, "tournaments", tournamentId));
        let tData = null;
        if (tDoc.exists()) {
          tData = { id: tDoc.id, ...tDoc.data() };
          setTournament(tData);
        }

        // Try to load divisions from subcollection
        const divSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions")
        );
        let divs = divSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // Fallback: if no subcollection docs, use divisions array from tournament doc
        if (divs.length === 0 && tData?.divisions) {
          if (typeof tData.divisions[0] === "string") {
            divs = tData.divisions.map((name) => ({
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
            }));
          } else {
            divs = tData.divisions.map((d) => ({
              id: d.id,
              name: d.name,
            }));
          }
        }

        setDivisions(divs);

        if (divs.length > 0) {
          setSelectedDivisionId(divs[0].id);
        }
      } catch (err) {
        console.error("❌ Error fetching tournament/divisions:", err);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  // Fetch pools + matches + registrations for the selected division
  useEffect(() => {
    if (!selectedDivisionId) return;

    const fetchDivisionData = async () => {
      setLoading(true);
      try {
        const poolsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", selectedDivisionId, "pools")
        );
        setPools(poolsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const matchesSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", selectedDivisionId, "matches")
        );
        setMatches(matchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const regsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", selectedDivisionId, "registrations")
        );
        const loadedRegs = regsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setRegistrations(loadedRegs);
      } catch (err) {
        console.error("❌ Error fetching division data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionData();
  }, [tournamentId, selectedDivisionId]);

  if (!tournament) return <p>Loading tournament...</p>;

  // Use shared helper to build maps
  const { teamNameMap, teamColorMap, teamSeedMap } = buildTeamMaps(registrations);

  // Compute playoff standings from pool results
  const playoffStandings = computeOverallStandings(matches, registrations, teamSeedMap, teamColorMap);

  return (
    <div className="page">
      <div className="header">
        <h1>{tournament.name}</h1>
        <p>
          {tournament.location} —{" "}
          {new Date(tournament.date.seconds * 1000).toLocaleDateString()}
        </p>
      </div>

      {/* Division selector */}
      <label>
        Division:{" "}
        <select
          value={selectedDivisionId || ""}
          onChange={(e) => {
            setSelectedDivisionId(e.target.value);
            setActivePanel("pools");
          }}
        >
          {divisions.map((div) => (
            <option key={div.id} value={div.id}>
              {div.name}
            </option>
          ))}
        </select>
      </label>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tabButton ${activePanel === "pools" ? "tabActive" : ""}`}
          onClick={() => setActivePanel("pools")}
        >
          Pools
        </button>
        <button
          className={`tabButton ${activePanel === "matches" ? "tabActive" : ""}`}
          onClick={() => setActivePanel("matches")}
        >
          Matches
        </button>
        <button
          className={`tabButton ${activePanel === "bracket" ? "tabActive" : ""}`}
          onClick={() => setActivePanel("bracket")}
        >
          Bracket
        </button>
        <button
          className={`tabButton ${activePanel === "finish" ? "tabActive" : ""}`}
          onClick={() => setActivePanel("finish")}
        >
          Finish
        </button>
      </div>

      {/* Panels */}
      <div className="panel">
        {activePanel === "pools" && (
          <AdminPoolsPanel
            tournamentId={tournamentId}
            divisionId={selectedDivisionId}
            pools={pools}
          />
        )}
        {activePanel === "matches" && (
          <AdminMatchesPanel
            tournamentId={tournamentId}
            divisionId={selectedDivisionId}
            matches={matches}
          />
        )}
        {activePanel === "bracket" && (
          <Bracket
            tournamentId={tournamentId}
            divisionId={selectedDivisionId}
            standings={playoffStandings}
            teamNameMap={teamNameMap}
            teamColorMap={teamColorMap}
            teamSeedMap={teamSeedMap}
            isAdmin={true}
            isTournamentToday={true}
          />
        )}
        {activePanel === "finish" && (
          <AdminFinishPanel
            tournamentId={tournamentId}
            divisionId={selectedDivisionId}
          />
        )}
      </div>
    </div>
  );
}