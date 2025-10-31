import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "./MatchCard.module.css";

// 🎛️ Feature flag: Toggle player score editing
// Set to false to hide "Enter Score" button from players (read-only mode)
const ALLOW_PLAYER_SCORING = false;

export default function MatchCard({
  match,
  index,
  tournamentId,
  divisionId,
  isTournamentToday,
  isAdmin,
  teamColorMap,
  teamSeedMap,
  teamNameMap,
  nameToIdMap,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [scoreA, setScoreA] = useState(
    match.adminLocked && match.scoreA != null
      ? match.scoreA
      : match.playerScoreA ?? ""
  );
  const [scoreB, setScoreB] = useState(
    match.adminLocked && match.scoreB != null
      ? match.scoreB
      : match.playerScoreB ?? ""
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const matchRef = doc(
        db,
        "tournaments",
        tournamentId,
        "divisions",
        divisionId || match.divisionId,
        "matches",
        match.id
      );

      const parsedA = scoreA === "" ? null : parseInt(scoreA, 10);
      const parsedB = scoreB === "" ? null : parseInt(scoreB, 10);

      await updateDoc(matchRef, {
        playerScoreA: parsedA,
        playerScoreB: parsedB,
        status: parsedA != null && parsedB != null ? "final" : "pending",
      });

      setScoreA(parsedA);
      setScoreB(parsedB);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Error saving player score:", err);
    } finally {
      setSaving(false);
    }
  };

  // Always compare numbers
  const numA = scoreA === "" || scoreA == null ? null : Number(scoreA);
  const numB = scoreB === "" || scoreB == null ? null : Number(scoreB);

  const winnerA = numA != null && numB != null && numA > numB;
  const winnerB = numA != null && numB != null && numB > numA;

  const teamAKey = match.teamA;
  const teamBKey = match.teamB;

  const resolveTeamData = (teamKey) => {
    if (!teamKey) return { color: "#999", seed: "", name: teamKey || "TBD" };
    if (teamColorMap?.[teamKey]) {
      return {
        color: teamColorMap[teamKey],
        seed: teamSeedMap?.[teamKey] ?? "",
        name: teamNameMap?.[teamKey] || teamKey,
      };
    }
    const id = nameToIdMap?.[teamKey];
    if (id && teamColorMap?.[id]) {
      return {
        color: teamColorMap[id],
        seed: teamSeedMap?.[id] ?? "",
        name: teamNameMap?.[id] || teamKey,
      };
    }
    return { color: "#999", seed: "", name: teamKey || "TBD" };
  };

  const teamAData = resolveTeamData(teamAKey);
  const teamBData = resolveTeamData(teamBKey);

  const canPlayerEdit = ALLOW_PLAYER_SCORING && !match.adminLocked && isTournamentToday;
  const canAdminEdit = isAdmin;

  return (
    <div className={styles.card}>
      <h3 className={styles.matchHeader}>
        {match.pool} | Match {index + 1}
        {match.adminLocked && <span className={styles.lockIcon}> 🔒</span>}
      </h3>

      <div className={styles.teams}>
        {/* Team A */}
        <div className={styles.teamRow}>
          <div className={styles.teamInfo}>
            <div className={styles.teamIconWrapper}>
              <div
                className={styles.teamIcon}
                style={{ backgroundColor: teamAData.color }}
              ></div>
              <span className={styles.seedNumber}>
                {teamAData.seed !== 9999 ? teamAData.seed : ""}
              </span>
            </div>
            <span
              className={`${styles.teamName} ${winnerA ? styles.winner : ""}`}
            >
              {teamAData.name}
            </span>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={scoreA ?? ""}
              onChange={(e) => setScoreA(e.target.value)}
              className={styles.scoreInput}
            />
          ) : (
            <span className={`${styles.score} ${winnerA ? styles.winner : ""}`}>
              {numA ?? "-"}
            </span>
          )}
        </div>

        {/* Team B */}
        <div className={styles.teamRow}>
          <div className={styles.teamInfo}>
            <div className={styles.teamIconWrapper}>
              <div
                className={styles.teamIcon}
                style={{ backgroundColor: teamBData.color }}
              ></div>
              <span className={styles.seedNumber}>
                {teamBData.seed !== 9999 ? teamBData.seed : ""}
              </span>
            </div>
            <span
              className={`${styles.teamName} ${winnerB ? styles.winner : ""}`}
            >
              {teamBData.name}
            </span>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={scoreB ?? ""}
              onChange={(e) => setScoreB(e.target.value)}
              className={styles.scoreInput}
            />
          ) : (
            <span className={`${styles.score} ${winnerB ? styles.winner : ""}`}>
              {numB ?? "-"}
            </span>
          )}
        </div>
      </div>

      {(canPlayerEdit || canAdminEdit) && (
        <div className={styles.playerScoring}>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className={styles.saveButton}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.scoreButton}
            >
              ✎ Enter Score
            </button>
          )}
        </div>
      )}
    </div>
  );
}