// src/components/BracketMatchCard.jsx
import React, { useState } from "react";
import styles from "./Bracket.module.css";

export default function BracketMatchCard({
  match,
  teamNameMap,
  teamColorMap,
  teamSeedMap,
  isAdmin,
  isTournamentToday,
  onSaveScore,
}) {
  const [editA, setEditA] = useState(match.scoreA ?? match.playerScoreA ?? "");
  const [editB, setEditB] = useState(match.scoreB ?? match.playerScoreB ?? "");

  const finalScoreA =
    match.adminLocked && match.scoreA != null ? match.scoreA : match.playerScoreA;
  const finalScoreB =
    match.adminLocked && match.scoreB != null ? match.scoreB : match.playerScoreB;

  const teamAKey = match.teamA;
  const teamBKey = match.teamB;

  const teamADisplay = teamNameMap?.[teamAKey] || teamAKey || "TBD";
  const teamBDisplay = teamNameMap?.[teamBKey] || teamBKey || "TBD";

  // --- New: safe color resolution ---
  const resolveColor = (teamKey, displayName) => {
    if (!teamKey && !displayName) return "#999";
    // direct key lookup
    if (teamColorMap?.[teamKey]) return teamColorMap[teamKey];
    // try by matching display name in teamNameMap
    const found = Object.entries(teamNameMap || {}).find(
      ([id, name]) => name === displayName
    );
    if (found && teamColorMap?.[found[0]]) return teamColorMap[found[0]];
    return "#999"; // fallback grey
  };

  const teamAColor = resolveColor(teamAKey, teamADisplay);
  const teamBColor = resolveColor(teamBKey, teamBDisplay);

  const teamASeed = teamSeedMap?.[teamAKey] ?? "";
  const teamBSeed = teamSeedMap?.[teamBKey] ?? "";

  const winnerA =
    finalScoreA != null && finalScoreB != null && finalScoreA > finalScoreB;
  const winnerB =
    finalScoreA != null && finalScoreB != null && finalScoreB > finalScoreA;

  const handleSave = () => {
    onSaveScore(match.id, parseInt(editA) || 0, parseInt(editB) || 0);
  };

  return (
    <div className={styles.match}>
      {/* Team A */}
      <div className={styles.teamRow}>
        <div className={styles.teamInfo}>
          <div className={styles.teamIconWrapper}>
            <div
              className={styles.teamIcon}
              style={{ backgroundColor: teamAColor }}
            ></div>
            <span className={styles.seedNumber}>
              {teamASeed !== 9999 ? teamASeed : ""}
            </span>
          </div>
          <span className={`${styles.teamName} ${winnerA ? styles.winner : ""}`}>
            {teamADisplay}
          </span>
        </div>
        <div className={styles.scoreBox}>
          {isAdmin ? (
            <input
              type="number"
              value={editA}
              onChange={(e) => setEditA(e.target.value)}
            />
          ) : (
            <span className={`${styles.score} ${winnerA ? styles.winner : ""}`}>
              {finalScoreA ?? "-"}
            </span>
          )}
        </div>
      </div>

      {/* Team B */}
      <div className={styles.teamRow}>
        <div className={styles.teamInfo}>
          <div className={styles.teamIconWrapper}>
            <div
              className={styles.teamIcon}
              style={{ backgroundColor: teamBColor }}
            ></div>
            <span className={styles.seedNumber}>
              {teamBSeed !== 9999 ? teamBSeed : ""}
            </span>
          </div>
          <span className={`${styles.teamName} ${winnerB ? styles.winner : ""}`}>
            {teamBDisplay}
          </span>
        </div>
        <div className={styles.scoreBox}>
          {isAdmin ? (
            <input
              type="number"
              value={editB}
              onChange={(e) => setEditB(e.target.value)}
            />
          ) : (
            <span className={`${styles.score} ${winnerB ? styles.winner : ""}`}>
              {finalScoreB ?? "-"}
            </span>
          )}
        </div>
      </div>

      {isAdmin && (
        <button onClick={handleSave} className={styles.saveBtn}>
          Save
        </button>
      )}
      {match.adminLocked && (
        <span className={styles.locked}>Score is locked for players.</span>
      )}
    </div>
  );
}