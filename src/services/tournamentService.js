// src/services/tournamentService.js
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase"; // make sure firebase.js is already set up

const tournamentsRef = collection(db, "tournaments");

/**
 * Add a new tournament (admin only).
 * @param {Object} data - tournament fields
 */
export async function addTournament(data) {
  return await addDoc(tournamentsRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get all tournaments (one-time fetch).
 * @param {string} status - "upcoming" | "active" | "completed"
 */
export async function getTournaments(status) {
  const q = query(
    tournamentsRef,
    where("status", "==", status),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Listen to tournaments in real time.
 * @param {string} status
 * @param {function} callback
 * @returns unsubscribe function
 */
export function listenTournaments(status, callback) {
  const q = query(
    tournamentsRef,
    where("status", "==", status),
    orderBy("date", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const tournaments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tournaments);
  });
}

/**
 * Get a single tournament by ID.
 * Loads divisions as objects: [{ id, name }]
 */
export async function getTournamentById(id) {
  const docRef = doc(db, "tournaments", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) throw new Error("Tournament not found");

  const tournamentData = snap.data();

  // Prefer divisions from the tournament doc if present and valid
  let divisions = [];
  if (
    Array.isArray(tournamentData.divisions) &&
    tournamentData.divisions.length > 0 &&
    typeof tournamentData.divisions[0] === "object" &&
    tournamentData.divisions[0].id &&
    tournamentData.divisions[0].name
  ) {
    divisions = tournamentData.divisions;
  } else {
    // Fallback: fetch divisions subcollection (legacy support)
    const divisionsRef = collection(db, "tournaments", id, "divisions");
    const divisionsSnap = await getDocs(divisionsRef);
    divisions = divisionsSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }

  return {
    id: snap.id,
    ...tournamentData,
    divisions, // always objects with {id, name, ...}
  };
}

/**
 * Update a tournament (admin only).
 */
export async function updateTournament(id, updates) {
  const docRef = doc(db, "tournaments", id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Helper: create a consistent new match doc.
 * Ensures all matches start "pending" with null scores.
 */
export function newMatchDoc({
  pool = "",
  teamA = null,
  teamB = null,
  teamAPlayers = [],
  teamBPlayers = [],
}) {
  return {
    pool,
    teamA,
    teamB,
    teamAPlayers,
    teamBPlayers,
    scoreA: null,
    scoreB: null,
    playerScoreA: null,
    playerScoreB: null,
    adminLocked: false,
    status: "pending", // not counted in standings until final
    createdAt: serverTimestamp(),
  };
}

/* =========================================================
   🔹 REGISTRATIONS SERVICE (per-division)
   ========================================================= */

/**
 * Add a registration to a tournament division.
 * @param {string} tournamentId
 * @param {string} divisionId
 * @param {Object} data
 */
export async function addRegistration(tournamentId, divisionId, data) {
  const regRef = collection(
    db,
    "tournaments",
    tournamentId,
    "divisions",
    divisionId,
    "registrations"
  );
  const newData = {
    teamName: data.teamName || "Unnamed Team",
    players: data.players || [],
    captainPhone: data.captainPhone || "",
    waiverAccepted: !!data.waiverAccepted,
    createdBy: data.createdBy || "anon",
    seed: null, // 🔹 Always initialize seed to null
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(regRef, newData);
  return docRef.id;
}

/**
 * Update an existing registration.
 */
export async function updateRegistration(tournamentId, divisionId, regId, data) {
  const regDoc = doc(
    db,
    "tournaments",
    tournamentId,
    "divisions",
    divisionId,
    "registrations",
    regId
  );
  await updateDoc(regDoc, data);
}

/**
 * Delete a registration.
 */
export async function deleteRegistration(tournamentId, divisionId, regId) {
  const regDoc = doc(
    db,
    "tournaments",
    tournamentId,
    "divisions",
    divisionId,
    "registrations",
    regId
  );
  await deleteDoc(regDoc);
}

/**
 * Listen to registrations in real time for a division.
 */
export function listenRegistrations(tournamentId, divisionId, callback) {
  const regRef = collection(
    db,
    "tournaments",
    tournamentId,
    "divisions",
    divisionId,
    "registrations"
  );
  return onSnapshot(regRef, (snapshot) => {
    const regs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(regs);
  });
}

/**
 * Get all registrations (one-time fetch) for a division.
 */
export async function getRegistrations(tournamentId, divisionId) {
  const regRef = collection(
    db,
    "tournaments",
    tournamentId,
    "divisions",
    divisionId,
    "registrations"
  );
  const snapshot = await getDocs(regRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}