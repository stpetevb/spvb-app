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

    const nextRound = match.round + 1;

    if (nextRound === 2) {
      // Explicit mapping: top half QFs → top SF, bottom half QFs → bottom SF
      const sfSlot = match.slot <= 2 ? 2 : 1;
      const target = matches.find((m) => m.round === 2 && m.slot === sfSlot);
      if (target) {
        const data =
          match.slot % 2 === 1
            ? { teamA: winner.team, teamAPlayers: winner.players }
            : { teamB: winner.team, teamBPlayers: winner.players };
        await updateDoc(
          doc(db, "tournaments", tournamentId, "divisions", divisionId, "playoffs", target.id),
          data
        );
      }
    } else if (nextRound === 3) {
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
        created.push(await createMatch(3, 1, seeds[0], seeds[1]));
      } else if (numTeams === 3) {
        created.push(await createMatch(2, 1, seeds[1], seeds[2]));
        created.push(await createMatch(3, 1, seeds[0], null));
      } else if (numTeams === 4) {
        created.push(await createMatch(2, 1, seeds[0], seeds[3]));
        created.push(await createMatch(2, 2, seeds[1], seeds[2]));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 5) {
        created.push(await createMatch(1, 1, seeds[3], seeds[4]));
        created.push(await createMatch(2, 1, seeds[1], seeds[2]));
        created.push(await createMatch(2, 2, seeds[0], null));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 6) {
        created.push(await createMatch(1, 1, seeds[2], seeds[5]));
        created.push(await createMatch(1, 2, seeds[3], seeds[4]));
        created.push(await createMatch(2, 1, seeds[1], null));
        created.push(await createMatch(2, 2, seeds[0], null));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 7) {
        created.push(await createMatch(1, 1, seeds[3], seeds[4]));
        created.push(await createMatch(1, 2, seeds[1], seeds[6]));
        created.push(await createMatch(1, 3, seeds[2], seeds[5]));
        created.push(await createMatch(2, 1, seeds[0], null));
        created.push(await createMatch(2, 2, null, null));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 8) {
        created.push(await createMatch(1, 1, seeds[0], seeds[7]));
        created.push(await createMatch(1, 2, seeds[3], seeds[4]));
        created.push(await createMatch(1, 3, seeds[1], seeds[6]));
        created.push(await createMatch(1, 4, seeds[2], seeds[5]));
        created.push(await createMatch(2, 1, null, null));
        created.push(await createMatch(2, 2, null, null));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 9) {
        created.push(await createMatch(1, 1, seeds[7], seeds[8]));
        created.push(await createMatch(1, 2, seeds[0], null));
        created.push(await createMatch(1, 3, seeds[3], seeds[4]));
        created.push(await createMatch(1, 4, seeds[2], seeds[5]));
        created.push(await createMatch(1, 5, seeds[1], seeds[6]));
        created.push(await createMatch(2, 1, null, null));
        created.push(await createMatch(2, 2, null, null));
        created.push(await createMatch(3, 1, null, null));
      } else if (numTeams === 10) {
        created.push(await createMatch(1, 1, seeds[7], seeds[8]));
        created.push(await createMatch(1, 2, seeds[6], seeds[9]));
        created.push(await createMatch(1, 3, seeds[0], null));
        created.push(await createMatch(1, 4, seeds[3], seeds[4]));
        created.push(await createMatch(1, 5, seeds[2], seeds[5]));
        created.push(await createMatch(1, 6, seeds[1], null));
        created.push(await createMatch(2, 1, null, null));
        created.push(await createMatch(2, 2, null, null));
        created.push(await createMatch(3, 1, null, null));
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
              {grouped[1].map((m) => (
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
          )}
          {grouped[2] && (
            <div className={`${styles.round} ${styles.semifinals}`}>
              <h3>Semifinals</h3>
              {grouped[2].sort((a, b) => b.slot - a.slot).map((m) => (
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
          )}
          {grouped[3] && (
            <div className={`${styles.round} ${styles.final}`}>
              <h3>Final</h3>
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