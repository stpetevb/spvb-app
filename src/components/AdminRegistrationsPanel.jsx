// src/components/AdminRegistrationsPanel.jsx
import { useEffect, useState } from "react";
import {
  listenRegistrations,
  updateRegistration,
  deleteRegistration,
  addRegistration,
} from "../services/tournamentService";
import styles from "./AdminRegistrationsPanel.module.css";

export default function AdminRegistrationsPanel({ tournamentId, divisionId }) {
  const [registrations, setRegistrations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [newForm, setNewForm] = useState({
    players: ["", "", ""],
    captainPhone: "",
    waiverAccepted: false,
    createdBy: "admin",
  });

  useEffect(() => {
    if (!divisionId) return;
    const unsub = listenRegistrations(tournamentId, divisionId, (regs) => {
      // 🔹 Normalize: make sure every registration has safe defaults
      const normalized = regs.map((r) => ({
        id: r.id,
        teamName: r.teamName || "Unnamed Team",
        players: Array.isArray(r.players) ? r.players : [],
        captainPhone: r.captainPhone || "",
        waiverAccepted: !!r.waiverAccepted,
        seed: r.seed ?? null,
        ...r,
      }));
      setRegistrations(normalized);
    });
    return () => unsub && unsub();
  }, [tournamentId, divisionId]);

  const handleEdit = (reg) => {
    setEditingId(reg.id);
    setFormData(reg);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlayerChange = (index, value) => {
    const updated = [...formData.players];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, players: updated }));
  };

  const handleSave = async () => {
    if (!divisionId) return;
    await updateRegistration(tournamentId, divisionId, editingId, formData);
    setEditingId(null);
  };

  const handleDelete = async (regId) => {
    if (!divisionId) return;
    if (window.confirm("Delete this registration?")) {
      await deleteRegistration(tournamentId, divisionId, regId);
    }
  };

  // --- Admin new registration form handlers ---
  const handleNewChange = (field, value) => {
    setNewForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewPlayerChange = (index, value) => {
    const updated = [...newForm.players];
    updated[index] = value;
    setNewForm((prev) => ({ ...prev, players: updated }));
  };

  const handleNewSave = async () => {
    if (!divisionId) {
      alert("Select a division first.");
      return;
    }
    if (!newForm.players[0]) {
      alert("At least Player #1 is required.");
      return;
    }
    await addRegistration(tournamentId, divisionId, {
      ...newForm,
      teamName: newForm.teamName || `Team ${Date.now()}`,
      seed: newForm.seed ?? null, // 🔹 Always ensure seed field
    });
    setNewForm({
      players: ["", "", ""],
      captainPhone: "",
      waiverAccepted: false,
      createdBy: "admin",
    });
  };

  return (
    <div className={styles.container}>
      <h2>Registrations (Division: {divisionId || "N/A"})</h2>
      {registrations.length === 0 && <p>No registrations yet.</p>}

      <ul className={styles.list}>
        {registrations.map((reg) =>
          editingId === reg.id ? (
            <li key={reg.id} className={styles.card}>
              {(formData.players || []).map((p, i) => (
                <input
                  key={i}
                  type="text"
                  value={p}
                  onChange={(e) => handlePlayerChange(i, e.target.value)}
                />
              ))}
              <input
                type="tel"
                value={formData.captainPhone || ""}
                onChange={(e) => handleChange("captainPhone", e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={!!formData.waiverAccepted}
                  onChange={(e) =>
                    handleChange("waiverAccepted", e.target.checked)
                  }
                />
                Waiver
              </label>
              {/* 🔹 Show and edit seed explicitly */}
              <input
                type="number"
                placeholder="Seed"
                value={formData.seed ?? ""}
                onChange={(e) =>
                  handleChange(
                    "seed",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
              />
              <div className={styles.actions}>
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            </li>
          ) : (
            <li key={reg.id} className={styles.card}>
              {(reg.players && reg.players.length > 0
                ? reg.players.filter(Boolean).join(", ")
                : reg.teamName) || "Unnamed Team"}{" "}
              <br />
              Captain Phone: {reg.captainPhone || "N/A"} <br />
              Waiver: {reg.waiverAccepted ? "✔" : "❌"} <br />
              Seed: {reg.seed ?? "—"}
              <div className={styles.actions}>
                <button onClick={() => handleEdit(reg)}>Edit</button>
                <button onClick={() => handleDelete(reg.id)}>Delete</button>
              </div>
            </li>
          )
        )}
      </ul>

      {/* Admin Add Registration Form */}
      <div className={styles.newForm}>
        <h3>Add New Registration (Admin)</h3>
        <input
          type="text"
          placeholder="Team Name"
          value={newForm.teamName || ""}
          onChange={(e) => handleNewChange("teamName", e.target.value)}
        />
        {newForm.players.map((p, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Player #${i + 1}`}
            value={p}
            onChange={(e) => handleNewPlayerChange(i, e.target.value)}
          />
        ))}
        <input
          type="tel"
          placeholder="Captain Phone"
          value={newForm.captainPhone}
          onChange={(e) => handleNewChange("captainPhone", e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={newForm.waiverAccepted}
            onChange={(e) =>
              handleNewChange("waiverAccepted", e.target.checked)
            }
          />
          Waiver
        </label>
        <input
          type="number"
          placeholder="Seed"
          value={newForm.seed ?? ""}
          onChange={(e) =>
            handleNewChange(
              "seed",
              e.target.value ? parseInt(e.target.value) : null
            )
          }
        />
        <button onClick={handleNewSave}>Add Registration</button>
      </div>
    </div>
  );
}