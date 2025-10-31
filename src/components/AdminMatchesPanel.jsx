// src/components/AdminMatchesPanel.jsx
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../services/firebase";
import styles from "./AdminMatchesPanel.module.css";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ✅ Sortable Match Item Component
function SortableMatchItem({ match, displayTeam, onEdit, onDelete, poolName }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: match.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={styles.matchItem}
      {...attributes}
      {...listeners}
    >
      <div className={styles.matchRow}>
        <span className={styles.dragHandle}>⋮⋮</span>
        <span className={styles.matchNumber}>Match {match.sequence}</span>
        <span className={styles.matchInfo}>
          <strong>{displayTeam(match, "teamA")}</strong>{" "}
          {match.scoreA ?? "-"} - {match.scoreB ?? "-"}{" "}
          <strong>{displayTeam(match, "teamB")}</strong>
          {match.adminLocked && " (Locked)"}
        </span>
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(match)}
          >
            Edit
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(match.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}

export default function AdminMatchesPanel({ tournamentId, divisionId }) {
  const [matches, setMatches] = useState([]);
  const [pools, setPools] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderMode, setReorderMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localMatches, setLocalMatches] = useState([]);

  const [editingMatch, setEditingMatch] = useState(null);
  const [newMatch, setNewMatch] = useState({ pool: "", teamA: "", teamB: "" });

  // ✅ Setup drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  // ✅ Handle reorder drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalMatches((items) => {
        const oldIndex = items.findIndex((m) => m.id === active.id);
        const newIndex = items.findIndex((m) => m.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Update sequence numbers after reordering
        return newOrder.map((m, idx) => ({
          ...m,
          sequence: idx + 1,
        }));
      });
      setHasChanges(true);
    }
  };

  // ✅ Save reordered matches to Firebase
  const handleSaveReorder = async () => {
    try {
      const batch = writeBatch(db);
      const matchesRef = collection(
        db,
        "tournaments",
        tournamentId,
        "divisions",
        divisionId,
        "matches"
      );

      localMatches.forEach((match) => {
        const docRef = doc(matchesRef, match.id);
        batch.update(docRef, { sequence: match.sequence });
      });

      await batch.commit();
      setMatches(localMatches);
      setReorderMode(false);
      setHasChanges(false);
      alert("Match order saved successfully!");
    } catch (err) {
      console.error("❌ Error saving match order:", err);
      alert("Error saving match order");
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
      // ✅ Get max sequence for this pool
      const poolMatches = matches.filter((m) => m.pool === newMatch.pool);
      const maxSequence = poolMatches.length > 0 
        ? Math.max(...poolMatches.map((m) => m.sequence || 0)) 
        : 0;

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
        sequence: maxSequence + 1,
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

  // ✅ Sort matches by sequence
  const sortedMatches = [...matches].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  // Group matches by pool
  const matchesByPool = pools.reduce((acc, pool) => {
    acc[pool.name] = sortedMatches.filter((m) => m.pool === pool.name);
    return acc;
  }, {});

  // Display helper
  const displayTeam = (match, side) => {
    const players = match[`${side}Players`];
    return players?.length ? players.join(" / ") : match[side];
  };

  // ✅ Prepare local matches for reorder mode
  const handleEnterReorderMode = () => {
    const flatMatches = Object.values(matchesByPool).flat();
    setLocalMatches(flatMatches);
    setReorderMode(true);
    setHasChanges(false);
  };

  return (
    <div className={styles.panel}>
      <h2>Manage Matches</h2>

      {/* ✅ Reorder Control Buttons */}
      <div className={styles.controlBar}>
        {!reorderMode ? (
          <button className={styles.reorderButton} onClick={handleEnterReorderMode}>
            🔄 Reorder Matches
          </button>
        ) : (
          <>
            <button className={styles.saveButton} onClick={handleSaveReorder} disabled={!hasChanges}>
              ✓ Save Order
            </button>
            <button
              className={styles.cancelButton}
              onClick={() => {
                setReorderMode(false);
                setLocalMatches([]);
                setHasChanges(false);
              }}
            >
              ✕ Cancel
            </button>
          </>
        )}
      </div>

      {reorderMode ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Object.keys(matchesByPool).map((poolName) => (
            <div key={poolName} className={styles.poolCard}>
              <h3>{poolName}</h3>
              <SortableContext
                items={localMatches.filter((m) => m.pool === poolName).map((m) => m.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className={styles.matchList}>
                  {localMatches
                    .filter((m) => m.pool === poolName)
                    .map((match) => (
                      <SortableMatchItem
                        key={match.id}
                        match={match}
                        displayTeam={displayTeam}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        poolName={poolName}
                      />
                    ))}
                </ul>
              </SortableContext>
            </div>
          ))}
        </DndContext>
      ) : (
        <>
          {Object.keys(matchesByPool).map((poolName) => (
            <div key={poolName} className={styles.poolCard}>
              <h3>{poolName}</h3>
              <ul className={styles.matchList}>
                {matchesByPool[poolName].map((match) => (
                  <li key={match.id} className={styles.matchItem}>
                    {editingMatch?.id === match.id ? (
                      <div className={styles.editRow}>
                        <strong>{displayTeam(match, "teamA")}</strong>
                        <input
                          type="number"
                          className={styles.scoreInput}
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
                          className={styles.scoreInput}
                          value={editingMatch.scoreB ?? ""}
                          onChange={(e) =>
                            setEditingMatch((prev) => ({
                              ...prev,
                              scoreB: e.target.value === "" ? null : parseInt(e.target.value, 10),
                            }))
                          }
                        />
                        <strong>{displayTeam(match, "teamB")}</strong>
                        <div className={styles.actions}>
                          <button className={styles.saveButton} onClick={handleSave}>
                            Save
                          </button>
                          <button className={styles.cancelButton} onClick={() => setEditingMatch(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.matchRow}>
                        <span className={styles.matchNumber}>Match {match.sequence}</span>
                        <span className={styles.matchInfo}>
                          <strong>{displayTeam(match, "teamA")}</strong>{" "}
                          {match.scoreA ?? "-"} - {match.scoreB ?? "-"}{" "}
                          <strong>{displayTeam(match, "teamB")}</strong>
                          {match.adminLocked && " (Locked)"}
                        </span>
                        <div className={styles.actions}>
                          <button className={styles.editButton} onClick={() => setEditingMatch(match)}>
                            Edit
                          </button>
                          <button className={styles.deleteButton} onClick={() => handleDelete(match.id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

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