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

  // --- Final scores (prefer admin, fallback to player) ---
  const finalScoreA =
    match.adminLocked && match.scoreA != null ? match.scoreA : match.playerScoreA;
  const finalScoreB =
    match.adminLocked && match.scoreB != null ? match.scoreB : match.playerScoreB;

  const teamAKey = match.teamA;
  const teamBKey = match.teamB;

  // --- Force proper name resolution ---
  const teamADisplay = teamNameMap?.[teamAKey] || "TBD";
  const teamBDisplay = teamNameMap?.[teamBKey] || "TBD";

  // --- Color resolution: prefer ID match, then name fallback ---
  const resolveColor = (teamKey, displayName) => {
    if (!teamKey && !displayName) return "#999";
    if (teamColorMap?.[teamKey]) return teamColorMap[teamKey];
    const found = Object.entries(teamNameMap || {}).find(
      ([id, name]) => name === displayName
    );
    if (found && teamColorMap?.[found[0]]) return teamColorMap[found[0]];
    return "#999";
  };

  const teamAColor = resolveColor(teamAKey, teamADisplay);
  const teamBColor = resolveColor(teamBKey, teamBDisplay);

  const teamASeed = teamSeedMap?.[teamAKey] ?? "";
  const teamBSeed = teamSeedMap?.[teamBKey] ?? "";

  const winnerA =
    finalScoreA != null && finalScoreB != null && finalScoreA > finalScoreB;
  const winnerB =
    finalScoreA != null && finalScoreB != null && finalScoreB > finalScoreA;

  // --- Save handler ---
  const handleSave = () => {
    onSaveScore(match.id, parseInt(editA) || 0, parseInt(editB) || 0);
  };

  // --- Render input or static score ---
  const renderScoreBox = (team, editValue, setEdit, finalScore, isWinner) => {
    if (isAdmin) {
      // ✅ Admins can always edit
      return (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEdit(e.target.value)}
          className={styles.scoreInput}
        />
      );
    } else if (!match.adminLocked && isTournamentToday) {
      // ✅ Players: editable if today & unlocked
      return (
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEdit(e.target.value)}
          className={styles.scoreInput}
        />
      );
    } else {
      // ✅ Show final score only
      return (
        <span className={`${styles.score} ${isWinner ? styles.winner : ""}`}>
          {finalScore ?? "-"}
        </span>
      );
    }
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
          {renderScoreBox("A", editA, setEditA, finalScoreA, winnerA)}
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
          {renderScoreBox("B", editB, setEditB, finalScoreB, winnerB)}
        </div>
      </div>

      {/* Save button (admin always, players only if editable) */}
      {(isAdmin || (!isAdmin && !match.adminLocked && isTournamentToday)) && (
        <button onClick={handleSave} className={styles.saveBtn}>
          Save
        </button>
      )}

      {/* Player view lock notice */}
      {!isAdmin && match.adminLocked && (
        <span className={styles.locked}>🔒 Locked for players</span>
      )}
    </div>
  );
}