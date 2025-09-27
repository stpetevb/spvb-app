import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import MatchCard from "../components/MatchCard";
import Bracket from "../components/Bracket";
import { computeOverallStandings, buildTeamMaps } from "../services/standingsService";
import styles from "./DivisionPage.module.css";

// TODO: Replace this with your actual admin check (e.g. from context)
function useIsAdmin() {
  return false;
}

// Helper to format placement as ordinal
function formatPlacement(n) {
  if (n == null || n === "—") return "—";
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function DivisionPage() {
  const { tournamentId, divisionId } = useParams();
  const [division, setDivision] = useState(null);
  const [actualDivisionId, setActualDivisionId] = useState(divisionId);

  const [pools, setPools] = useState([]);
  const [matches, setMatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [teamColorMap, setTeamColorMap] = useState({});
  const [teamSeedMap, setTeamSeedMap] = useState({});
  const [teamRankMap, setTeamRankMap] = useState({});
  const [teamNameMap, setTeamNameMap] = useState({});
  const [nameToIdMap, setNameToIdMap] = useState({});

  const [isTournamentToday, setIsTournamentToday] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const isAdmin = useIsAdmin();

  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId || !divisionId) {
        setLoading(false);
        return;
      }

      try {
        const tournamentDoc = await getDoc(doc(db, "tournaments", tournamentId));
        let tournamentData = tournamentDoc.exists() ? tournamentDoc.data() : null;

        let dDoc = await getDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId)
        );
        let dData = null;
        let foundDivisionId = divisionId;

        if (dDoc.exists()) {
          dData = dDoc.data();
          setDivision({ id: dDoc.id, ...dData });
          setActualDivisionId(dDoc.id);
        } else if (tournamentData) {
          let divisions = [];
          if (
            Array.isArray(tournamentData.divisions) &&
            typeof tournamentData.divisions[0] === "object"
          ) {
            divisions = tournamentData.divisions;
          } else if (
            Array.isArray(tournamentData.divisions) &&
            typeof tournamentData.divisions[0] === "string"
          ) {
            divisions = tournamentData.divisions.map((name) => ({
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
            }));
          }
          const found = divisions.find(
            (d) => d.id === divisionId || d.name === divisionId
          );
          if (found) {
            setDivision(found);
            foundDivisionId = found.id;
            setActualDivisionId(found.id);
          } else {
            setDivision({ id: divisionId, name: divisionId });
            setActualDivisionId(divisionId);
          }
        }

        const today = new Date();
        let eventDateObj = null;
        const dateSource = dData?.date || tournamentData?.date;
        if (dateSource) {
          if (dateSource.toDate) {
            eventDateObj = dateSource.toDate();
          } else if (dateSource.seconds) {
            eventDateObj = new Date(dateSource.seconds * 1000);
          } else {
            eventDateObj = new Date(dateSource);
          }
          const isToday =
            today.getFullYear() === eventDateObj.getFullYear() &&
            today.getMonth() === eventDateObj.getMonth() &&
            today.getDate() === eventDateObj.getDate();
          setIsTournamentToday(isToday);
        }

        const poolsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", foundDivisionId, "pools")
        );
        setPools(poolsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const matchesSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", foundDivisionId, "matches")
        );
        setMatches(matchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

        const regsSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", foundDivisionId, "registrations")
        );
        const loadedRegs = regsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            seed: data.seed ?? null,
            finish: data.finish ?? null, // NEW
            players: Array.isArray(data.players) ? data.players : [],
            teamName: data.teamName || "Unnamed Team",
            ...data,
          };
        });

        setRegistrations(loadedRegs);

        const nameToId = {};
        loadedRegs.forEach((reg) => {
          nameToId[reg.teamName] = reg.id;
        });

        const { teamNameMap, teamColorMap, teamSeedMap } = buildTeamMaps(loadedRegs);
        setTeamNameMap(teamNameMap);
        setTeamColorMap(teamColorMap);
        setTeamSeedMap(teamSeedMap);
        setNameToIdMap(nameToId);

        const overallStandings = computeOverallStandings(matches, loadedRegs, teamSeedMap);
        const rankMaps = buildTeamMaps(loadedRegs, overallStandings);
        setTeamRankMap(rankMaps.teamSeedMap);
      } catch (err) {
        console.error("❌ Error loading division data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, divisionId]);

  const matchesByPool = pools.reduce((acc, pool) => {
    acc[pool.name] = matches.filter((m) => m.pool === pool.name);
    return acc;
  }, {});

  const computeStandings = (poolName) => {
    const standings = {};
    (matchesByPool[poolName] || []).forEach((match) => {
      const scoreA = match.adminLocked ? match.scoreA : match.playerScoreA;
      const scoreB = match.adminLocked ? match.scoreB : match.playerScoreB;
      const teamAKey = match.teamA;
      const teamBKey = match.teamB;
      if (!teamAKey || !teamBKey) return;

      const teamADisplay = teamNameMap[teamAKey] || teamAKey;
      const teamBDisplay = teamNameMap[teamBKey] || teamBKey;

      if (!standings[teamADisplay])
        standings[teamADisplay] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, teamKey: teamAKey };
      if (!standings[teamBDisplay])
        standings[teamBDisplay] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, teamKey: teamBKey };

      if (match.status === "final" && typeof scoreA === "number" && typeof scoreB === "number") {
        standings[teamADisplay].pointsFor += scoreA;
        standings[teamADisplay].pointsAgainst += scoreB;
        standings[teamBDisplay].pointsFor += scoreB;
        standings[teamBDisplay].pointsAgainst += scoreA;

        if (scoreA > scoreB) {
          standings[teamADisplay].wins++;
          standings[teamBDisplay].losses++;
        } else {
          standings[teamBDisplay].wins++;
          standings[teamADisplay].losses++;
        }
      }
    });

    return Object.entries(standings)
      .map(([team, record]) => ({
        team,
        ...record,
        diff: record.pointsFor - record.pointsAgainst,
        seed: teamSeedMap[record.teamKey] ?? 9999,
      }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.diff !== a.diff) return b.diff - a.diff;
        return a.seed - b.seed;
      });
  };

  const standingsByPool = useMemo(() => {
    const result = {};
    pools.forEach((pool) => {
      result[pool.name] = computeStandings(pool.name);
    });
    return result;
  }, [pools, matches, teamNameMap]);

  const playoffStandings = computeOverallStandings(matches, registrations, teamSeedMap, teamColorMap);

  if (loading) return <p>Loading division...</p>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{division?.name}</h2>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === "home" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("home")}
        >
          Home
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "pools" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("pools")}
        >
          Pools
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === "playoffs" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("playoffs")}
        >
          Playoffs
        </button>
      </div>

      <div className={styles.panel}>
        {activeTab === "home" && (
          <div>
            <h3>Teams</h3>
            <table className={styles.teamsTable}>
              <thead>
                <tr>
                  <th>Placement</th>
                  <th>Team</th>
                  <th>Seed</th>
                </tr>
              </thead>
              <tbody>
                {registrations
                  .sort((a, b) => (a.finish ?? 9999) - (b.finish ?? 9999)) // sort by finish
                  .map((r) => {
                    const id = r.id;
                    const color = teamColorMap[id] || "#999";
                    const seed = r.seed ?? "—";
                    const finish = r.finish ?? "—";
                    const displayName =
                      r.players.length > 0
                        ? r.players.join(" / ")
                        : r.teamName || "Unnamed Team";
                    return (
                      <tr key={r.id}>
                        <td>{formatPlacement(finish)}</td>
                        <td className={styles.teamCell}>
                          <div className={styles.teamIconWrapper}>
                            <div
                              className={styles.teamIcon}
                              style={{ backgroundColor: color }}
                            ></div>
                          </div>
                          {displayName}
                        </td>
                        <td>{seed}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "pools" && (
          <div>
            {pools.map((pool) => (
              <div key={pool.id} className={styles.poolSection}>
                <h3 className={styles.poolTitle}>{pool.name}</h3>
                <table className={styles.standingsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Team</th>
                      <th>Wins</th>
                      <th>Losses</th>
                      <th>Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(standingsByPool[pool.name] || []).map((row, i) => {
                      const id = nameToIdMap[row.teamKey];
                      const color = teamColorMap[id] || "#999";
                      const seed = teamSeedMap[id] || "";
                      const displayName = teamNameMap[id] || row.team;
                      return (
                        <tr key={row.team}>
                          <td className={styles.rankCell}>{i + 1}</td>
                          <td className={styles.teamCell}>
                            <div className={styles.teamIconWrapper}>
                              <div
                                className={styles.teamIcon}
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className={styles.seedNumber}>
                                {seed}
                              </span>
                            </div>
                            {displayName}
                          </td>
                          <td>{row.wins}</td>
                          <td>{row.losses}</td>
                          <td>{row.diff}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className={styles.matchesGrid}>
                  {(matchesByPool[pool.name] || []).map((match, idx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      index={idx}
                      tournamentId={tournamentId}
                      divisionId={actualDivisionId}
                      isTournamentToday={isTournamentToday}
                      isAdmin={isAdmin}
                      teamColorMap={teamColorMap}
                      teamSeedMap={teamSeedMap}
                      teamNameMap={teamNameMap}
                      nameToIdMap={nameToIdMap}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "playoffs" && (
          <Bracket
            tournamentId={tournamentId}
            divisionId={actualDivisionId}
            standings={playoffStandings}
            teamNameMap={teamNameMap}
            teamColorMap={teamColorMap}
            teamSeedMap={teamSeedMap}
            teamRankMap={teamRankMap}
            isAdmin={isAdmin}
            isTournamentToday={isTournamentToday}
          />
        )}
      </div>
    </div>
  );
}