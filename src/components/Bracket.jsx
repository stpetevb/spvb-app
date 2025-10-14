// src/components/Bracket.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import BracketMatchCard from "./BracketMatchCard";
import styles from "./Bracket.module.css";

export default function Bracket({
  tournamentId,
  divisionId,
  standings,
  teamNameMap,
  teamColorMap,
  teamSeedMap,
  teamRankMap,
  isAdmin = false,
  isTournamentToday = false,
}) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [includeBronze, setIncludeBronze] = useState(false);

  // Fetch playoff matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const snap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs")
        );
        const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMatches(loaded);
      } catch (err) {
        console.error("❌ Error fetching bracket:", err);
      } finally {
        setLoading(false);
      }
    };
    if (tournamentId && divisionId) fetchMatches();
  }, [tournamentId, divisionId]);

  // Reset bracket
  const handleReset = async () => {
    try {
      const snap = await getDocs(
        collection(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs")
      );
      for (const d of snap.docs) {
        await deleteDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", d.id)
        );
      }
      setMatches([]);
    } catch (err) {
      console.error("❌ Error resetting bracket:", err);
    }
  };

  // Helper to create a match doc
  const createMatch = async (round, slot, teamA, teamB, label = null) => {
    const safeKey = (team) => team?.teamId ?? team?.id ?? team?.team ?? team?.teamName ?? null;
    const newMatch = {
      round,
      slot,
      label,
      teamA: safeKey(teamA),
      teamB: safeKey(teamB),
      teamAPlayers: teamA ? teamNameMap?.[safeKey(teamA)]?.split(" / ") || [] : [],
      teamBPlayers: teamB ? teamNameMap?.[safeKey(teamB)]?.split(" / ") || [] : [],
      scoreA: null,
      scoreB: null,
      playerScoreA: null,
      playerScoreB: null,
      status: "pending",
      adminLocked: false,
    };
    const ref = await addDoc(
      collection(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs"),
      newMatch
    );
    return { id: ref.id, ...newMatch };
  };

  // Winner/loser determination
  const getWinnerLoser = (m) => {
    const a = m.scoreA ?? m.playerScoreA;
    const b = m.scoreB ?? m.playerScoreB;
    if (a == null || b == null) return { winner: null, loser: null };
    if (a > b) {
      return {
        winner: { team: m.teamA, players: m.teamAPlayers },
        loser: { team: m.teamB, players: m.teamBPlayers },
      };
    } else {
      return {
        winner: { team: m.teamB, players: m.teamBPlayers },
        loser: { team: m.teamA, players: m.teamAPlayers },
      };
    }
  };

  // Auto-advance + bronze losers
  const advanceWinner = async (match) => {
    const { winner, loser } = getWinnerLoser(match);
    if (!winner) return;

    const numTeams = standings.length;
    const nextRound = match.round + 1;

    // Special handling for play-in matches (9 and 10 team brackets)
    // Play-ins are in round 1 but advance to other round 1 matches (quarterfinals)
    if (match.round === 1 && ((numTeams === 9 && match.slot === 1) || (numTeams === 10 && (match.slot === 1 || match.slot === 2)))) {
      // Play-in match → Quarterfinal match (same round)
      let targetSlot, forceTeamB = true;
      if (numTeams === 9) {
        targetSlot = 2; // Play-in slot 1 → QF slot 2 teamB (to play #1)
      } else if (numTeams === 10) {
        if (match.slot === 1) targetSlot = 3; // Play-in slot 1 (#8v#9) → QF slot 3 teamB (to play #1)
        else if (match.slot === 2) targetSlot = 6; // Play-in slot 2 (#7v#10) → QF slot 6 teamB (to play #2)
      }
      
      const target = matches.find((m) => m.round === 1 && m.slot === targetSlot);
      if (target) {
        const data = { teamB: winner.team, teamBPlayers: winner.players };
        await updateDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", target.id),
          data
        );
      }
      return; // Exit early, play-in advancement is complete
    }

    if (nextRound === 2) {
      // Quarterfinals (round 1) → Semifinals (round 2)
      // Need to determine the correct SF slot AND position (teamA/teamB)
      let targetSlot, forceTeamA = false, forceTeamB = false;
      
      // Explicit mapping based on team count and bracket structure
      if (numTeams === 5) {
        // 5 teams: QF slot 1 (#4v#5) → SF slot 2 teamB (to play #1 who is in teamA)
        if (match.slot === 1) { targetSlot = 2; forceTeamB = true; }
      } else if (numTeams === 6) {
        // 6 teams: QF slot 1 (#3v#6) → SF slot 1 teamB (to play #2), QF slot 2 (#4v#5) → SF slot 2 teamB (to play #1)
        if (match.slot === 1) { targetSlot = 1; forceTeamB = true; }
        else if (match.slot === 2) { targetSlot = 2; forceTeamB = true; }
      } else if (numTeams === 7) {
        // 7 teams: QF slot 1 (#4v#5) → SF slot 1 teamB (to play #1), QF slot 2 (#2v#7) → SF slot 2 teamA, QF slot 3 (#3v#6) → SF slot 2 teamB
        if (match.slot === 1) { targetSlot = 1; forceTeamB = true; }
        else if (match.slot === 2) { targetSlot = 2; forceTeamA = true; }
        else if (match.slot === 3) { targetSlot = 2; forceTeamB = true; }
      } else if (numTeams === 8) {
        // 8 teams: QF slot 1 (#1v#8) → SF slot 1 teamA, QF slot 2 (#4v#5) → SF slot 1 teamB, QF slot 3 (#2v#7) → SF slot 2 teamA, QF slot 4 (#3v#6) → SF slot 2 teamB
        if (match.slot === 1) { targetSlot = 1; forceTeamA = true; }
        else if (match.slot === 2) { targetSlot = 1; forceTeamB = true; }
        else if (match.slot === 3) { targetSlot = 2; forceTeamA = true; }
        else if (match.slot === 4) { targetSlot = 2; forceTeamB = true; }
      } else if (numTeams === 9) {
        // 9 teams: Play-in slot 1 (#8v#9) → QF slot 2 teamB, QF slot 2 (#1vTBD) → SF slot 1 teamA, QF slot 3 (#4v#5) → SF slot 1 teamB, QF slot 4 (#3v#6) → SF slot 2 teamA, QF slot 5 (#2v#7) → SF slot 2 teamB
        if (match.slot === 1) { targetSlot = 1; forceTeamB = true; } // Play-in winner goes to QF slot 2 teamB (handled separately)
        else if (match.slot === 2) { targetSlot = 1; forceTeamA = true; }
        else if (match.slot === 3) { targetSlot = 1; forceTeamB = true; }
        else if (match.slot === 4) { targetSlot = 2; forceTeamA = true; }
        else if (match.slot === 5) { targetSlot = 2; forceTeamB = true; }
      } else if (numTeams === 10) {
        // 10 teams: Play-in slot 1 (#8v#9) → QF slot 3 teamB, Play-in slot 2 (#7v#10) → QF slot 6 teamB, QF slot 3 (#1vTBD) → SF slot 1 teamA, QF slot 4 (#4v#5) → SF slot 1 teamB, QF slot 5 (#3v#6) → SF slot 2 teamA, QF slot 6 (#2vTBD) → SF slot 2 teamB
        if (match.slot === 1) { targetSlot = 1; forceTeamB = true; } // Play-in winner goes to QF slot 3 teamB (handled separately)
        else if (match.slot === 2) { targetSlot = 2; forceTeamB = true; } // Play-in winner goes to QF slot 6 teamB (handled separately)
        else if (match.slot === 3) { targetSlot = 1; forceTeamA = true; }
        else if (match.slot === 4) { targetSlot = 1; forceTeamB = true; }
        else if (match.slot === 5) { targetSlot = 2; forceTeamA = true; }
        else if (match.slot === 6) { targetSlot = 2; forceTeamB = true; }
      }

      const target = matches.find((m) => m.round === 2 && m.slot === targetSlot);
      if (target) {
        // Use forced position if specified, otherwise place in empty slot
        let data;
        if (forceTeamA) {
          data = { teamA: winner.team, teamAPlayers: winner.players };
        } else if (forceTeamB) {
          data = { teamB: winner.team, teamBPlayers: winner.players };
        } else {
          // Fallback: place in empty slot
          data = target.teamA === null
            ? { teamA: winner.team, teamAPlayers: winner.players }
            : { teamB: winner.team, teamBPlayers: winner.players };
        }
        await updateDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", target.id),
          data
        );
      }
    } else if (nextRound === 3) {
      // Semifinals (round 2) → Finals (round 3)
      const target = matches.find((m) => m.round === 3);
      if (target) {
        const data = target.teamA === null
          ? { teamA: winner.team, teamAPlayers: winner.players }
          : { teamB: winner.team, teamBPlayers: winner.players };
        await updateDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", target.id),
          data
        );
      }
      if (includeBronze && loser) {
        const bronze = matches.find((m) => m.round === 4);
        if (bronze) {
          const data = bronze.teamA === null
            ? { teamA: loser.team, teamAPlayers: loser.players }
            : { teamB: loser.team, teamBPlayers: loser.players };
          await updateDoc(
            doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", bronze.id),
            data
          );
        }
      }
    }
  };

  // Generate bracket (2–10 teams)
  const handleGenerate = async () => {
    if (!standings || standings.length < 2) {
      alert("Not enough teams to create a bracket");
      return;
    }
    try {
      await handleReset();
      const seeds = [...standings].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.diff !== a.diff) return b.diff - a.diff;
        return a.seed - b.seed;
      });
      const numTeams = seeds.length;
      const created = [];

      if (numTeams === 2) {
        // Direct finals: #1 vs #2
        created.push(await createMatch(3, 1, seeds[0], seeds[1]));
      } else if (numTeams === 3) {
        // Semifinals: #2 vs #3, winner plays #1 in finals
        created.push(await createMatch(2, 1, seeds[1], seeds[2]));
        created.push(await createMatch(3, 1, seeds[0], null)); // #1 awaits SF winner
      } else if (numTeams === 4) {
        // Semifinals: #1 vs #4, #2 vs #3
        created.push(await createMatch(2, 1, seeds[0], seeds[3]));
        created.push(await createMatch(2, 2, seeds[1], seeds[2]));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 5) {
        // Quarterfinal: #4 vs #5
        // Semifinals: #2 vs #3, #1 vs winner of #4/#5
        created.push(await createMatch(1, 1, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(2, 1, seeds[1], seeds[2])); // SF: #2 vs #3
        created.push(await createMatch(2, 2, seeds[0], null)); // SF: #1 awaits QF winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      } else if (numTeams === 6) {
        // Quarterfinals: #3 vs #6, #4 vs #5
        // Semifinals: #2 vs winner of #3/#6, #1 vs winner of #4/#5
        created.push(await createMatch(1, 1, seeds[2], seeds[5])); // QF: #3 vs #6
        created.push(await createMatch(1, 2, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(2, 1, seeds[1], null)); // SF: #2 awaits #3/#6 winner
        created.push(await createMatch(2, 2, seeds[0], null)); // SF: #1 awaits #4/#5 winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      } else if (numTeams === 7) {
        // Quarterfinals: #4 vs #5, #2 vs #7, #3 vs #6
        // Semifinals: #1 vs winner of #4/#5, winner of #2/#7 vs winner of #3/#6
        created.push(await createMatch(1, 1, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(1, 2, seeds[1], seeds[6])); // QF: #2 vs #7
        created.push(await createMatch(1, 3, seeds[2], seeds[5])); // QF: #3 vs #6
        created.push(await createMatch(2, 1, seeds[0], null)); // SF: #1 awaits #4/#5 winner
        created.push(await createMatch(2, 2, null, null)); // SF: #2/#7 winner vs #3/#6 winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      } else if (numTeams === 8) {
        // Quarterfinals: #1 vs #8, #4 vs #5, #2 vs #7, #3 vs #6
        created.push(await createMatch(1, 1, seeds[0], seeds[7])); // QF: #1 vs #8
        created.push(await createMatch(1, 2, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(1, 3, seeds[1], seeds[6])); // QF: #2 vs #7
        created.push(await createMatch(1, 4, seeds[2], seeds[5])); // QF: #3 vs #6
        created.push(await createMatch(2, 1, null, null)); // SF: #1/#8 winner vs #4/#5 winner
        created.push(await createMatch(2, 2, null, null)); // SF: #2/#7 winner vs #3/#6 winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      } else if (numTeams === 9) {
        // Play-in: #8 vs #9
        // Quarterfinals: #1 vs winner of #8/#9, #4 vs #5, #3 vs #6, #2 vs #7
        created.push(await createMatch(1, 1, seeds[7], seeds[8])); // Play-in: #8 vs #9
        created.push(await createMatch(1, 2, seeds[0], null)); // QF: #1 awaits play-in winner
        created.push(await createMatch(1, 3, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(1, 4, seeds[2], seeds[5])); // QF: #3 vs #6
        created.push(await createMatch(1, 5, seeds[1], seeds[6])); // QF: #2 vs #7
        created.push(await createMatch(2, 1, null, null)); // SF: #1/play-in winner vs #4/#5 winner
        created.push(await createMatch(2, 2, null, null)); // SF: #3/#6 winner vs #2/#7 winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      } else if (numTeams === 10) {
        // Play-ins: #8 vs #9, #7 vs #10
        // Quarterfinals: #1 vs winner of #8/#9, #4 vs #5, #3 vs #6, #2 vs winner of #7/#10
        created.push(await createMatch(1, 1, seeds[7], seeds[8])); // Play-in: #8 vs #9
        created.push(await createMatch(1, 2, seeds[6], seeds[9])); // Play-in: #7 vs #10
        created.push(await createMatch(1, 3, seeds[0], null)); // QF: #1 awaits #8/#9 winner
        created.push(await createMatch(1, 4, seeds[3], seeds[4])); // QF: #4 vs #5
        created.push(await createMatch(1, 5, seeds[2], seeds[5])); // QF: #3 vs #6
        created.push(await createMatch(1, 6, seeds[1], null)); // QF: #2 awaits #7/#10 winner
        created.push(await createMatch(2, 1, null, null)); // SF: #1/play-in winner vs #4/#5 winner
        created.push(await createMatch(2, 2, null, null)); // SF: #3/#6 winner vs #2/play-in winner
        created.push(await createMatch(3, 1, null, null)); // Finals
      }

      if (includeBronze) {
        created.push(await createMatch(4, 1, null, null, "Bronze"));
      }
      setMatches(created);
    } catch (err) {
      console.error("❌ Error generating bracket:", err);
    }
  };

  // Save admin score
  const saveAdminScore = async (matchId, scoreA, scoreB) => {
    try {
      const ref = doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", matchId);
      await updateDoc(ref, { scoreA, scoreB, status: "final", adminLocked: true });
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId ? { ...m, scoreA, scoreB, status: "final", adminLocked: true } : m
        )
      );
      const match = matches.find((m) => m.id === matchId);
      if (match) await advanceWinner({ ...match, scoreA, scoreB });
    } catch (err) {
      console.error("❌ Error saving admin score:", err);
    }
  };

  // Save player score
  const savePlayerScore = async (matchId, playerScoreA, playerScoreB) => {
    try {
      const ref = doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", matchId);
      await updateDoc(ref, { playerScoreA, playerScoreB });
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, playerScoreA, playerScoreB } : m))
      );
      const match = matches.find((m) => m.id === matchId);
      if (match) await advanceWinner({ ...match, playerScoreA, playerScoreB });
    } catch (err) {
      console.error("❌ Error saving player score:", err);
    }
  };

  if (loading) return <p>Loading bracket...</p>;

  const grouped = matches.reduce((acc, m) => {
    acc[m.round] = acc[m.round] || [];
    acc[m.round].push(m);
    return acc;
  }, {});

  // Helper to determine if a match should show connector lines
  const shouldShowConnector = (match) => {
    // Don't show connectors for matches where both teams are null (shouldn't happen but safety check)
    if (!match.teamA && !match.teamB) return false;
    // Show connector if at least one team is present (not a complete bye)
    return true;
  };

  return (
    <div className={styles.bracketWrapper}>
      <h2>Playoffs</h2>
      {isAdmin && (
        <div className={styles.controls}>
          <label>
            <input
              type="checkbox"
              checked={includeBronze}
              onChange={(e) => setIncludeBronze(e.target.checked)}
            />
            Include Bronze Match
          </label>
          <button onClick={handleGenerate}>Generate Bracket</button>
          <button onClick={handleReset} className={styles.resetBtn}>
            Reset Bracket
          </button>
        </div>
      )}
      {Object.keys(grouped).length === 0 && <p>No bracket generated yet.</p>}
      {/* Auto-scaling wrapper */}
      <div className={styles.bracketContent}>
        <div className={styles.rounds}>
          {grouped[1] && (
            <div className={`${styles.round} ${styles.quarterfinals}`}>
              <h3>Quarterfinals</h3>
              {grouped[1].sort((a, b) => a.slot - b.slot).map((m) => (
                <div key={m.id} className={styles.matchWrapper}>
                  <BracketMatchCard
                    match={m}
                    teamNameMap={teamNameMap}
                    teamColorMap={teamColorMap}
                    teamSeedMap={teamRankMap}
                    isAdmin={isAdmin}
                    isTournamentToday={isTournamentToday}
                    onSaveScore={saveAdminScore}
                  />
                  {shouldShowConnector(m) && <div className={styles.connector} />}
                </div>
              ))}
            </div>
          )}
          {grouped[2] && (
            <div className={`${styles.round} ${styles.semifinals}`}>
              <h3>Semifinals</h3>
              {grouped[2].sort((a, b) => a.slot - b.slot).map((m) => (
                <div key={m.id} className={styles.matchWrapper}>
                  <BracketMatchCard
                    match={m}
                    teamNameMap={teamNameMap}
                    teamColorMap={teamColorMap}
                    teamSeedMap={teamRankMap}
                    isAdmin={isAdmin}
                    isTournamentToday={isTournamentToday}
                    onSaveScore={saveAdminScore}
                  />
                  {shouldShowConnector(m) && <div className={styles.connector} />}
                </div>
              ))}
            </div>
          )}
          {grouped[3] && (
            <div className={`${styles.round} ${styles.final}`}>
              <h3>Final</h3>
              <div className={styles.finalMatchWrapper}>
                {grouped[3]
                  .filter((m) => m.label !== "Bronze")
                  .map((m) => (
                    <BracketMatchCard
                      key={m.id}
                      match={m}
                      teamNameMap={teamNameMap}
                      teamColorMap={teamColorMap}
                      teamSeedMap={teamRankMap}
                      isAdmin={isAdmin}
                      isTournamentToday={isTournamentToday}
                      onSaveScore={saveAdminScore}
                    />
                  ))}
              </div>
            </div>
          )}
          {grouped[4] && (
            <div className={`${styles.round} ${styles.bronze}`}>
              <h3>Bronze</h3>
              {grouped[4].map((m) => (
                <BracketMatchCard
                  key={m.id}
                  match={m}
                  teamNameMap={teamNameMap}
                  teamColorMap={teamColorMap}
                  teamSeedMap={teamSeedMap}
                  isAdmin={isAdmin}
                  isTournamentToday={isTournamentToday}
                  onSaveScore={saveAdminScore}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}