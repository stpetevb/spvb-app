import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTournamentById, addRegistration } from "../services/tournamentService";
import { useAuth } from "../context/AuthContext";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [divisionId, setDivisionId] = useState("");
  const [players, setPlayers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [captainPhone, setCaptainPhone] = useState("");
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const data = await getTournamentById(tournamentId);
        setTournament(data);

        let divs = [];
        if (data.divisions && data.divisions.length > 0) {
          if (typeof data.divisions[0] === "string") {
            divs = data.divisions.map((name) => ({
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
            }));
          } else {
            divs = data.divisions.map((d) => ({
              id: d.id,
              name: d.name,
            }));
          }
        }
        setDivisions(divs);

        if (divs.length > 0) {
          setDivisionId(divs[0].id);
          const teamSize = data.teamSizes?.[divs[0].id] || 2;
          setPlayers(Array(teamSize).fill(""));
        }
      } catch (err) {
        console.error(err);
        setError("Tournament not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  const handlePlayerChange = (index, value) => {
    setPlayers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleDivisionChange = (id) => {
    setDivisionId(id);
    const teamSize = tournament?.teamSizes?.[id] || 2;
    setPlayers(Array(teamSize).fill(""));
  };

  // Format phone input as 999-999-9999
  const handlePhoneChange = (value) => {
    const digits = value.replace(/\D/g, "");
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 6) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 6) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    setCaptainPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const now = new Date();
    if (
      !isAdmin &&
      tournament?.registrationDeadline &&
      now > tournament.registrationDeadline.toDate()
    ) {
      setError("Registration is closed for this tournament.");
      return;
    }

    if (!waiverAccepted) {
      setError("You must accept the waiver.");
      return;
    }

    try {
      const safeTeamName =
        teamName?.trim() ||
        (players[0] ? `${players[0]}'s Team` : "Unnamed Team");

      await addRegistration(tournamentId, divisionId, {
        teamName: safeTeamName,
        players: players.filter(Boolean),
        captainPhone: captainPhone || "",
        waiverAccepted: !!waiverAccepted,
        createdBy: user?.uid || "anon",
        seed: null,
      });

      alert("Team registered successfully!");
      navigate(`/t/${tournamentId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to register. Try again.");
    }
  };

  if (loading) return <p>Loading tournament...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1>Register for {tournament?.name}</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label}>Team Name</label>
        <input
          type="text"
          className={styles.input}
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="Optional (defaults to Player 1)"
          required
        />

        <div className={styles.divisionRow}>
          <label className={styles.label}>Division</label>
          <select
            value={divisionId}
            onChange={(e) => handleDivisionChange(e.target.value)}
            className={styles.select}
            required
          >
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {players.map((p, i) => (
          <div key={i}>
            <label className={styles.label}>
              {i === 0
                ? "Player 1 Name (Team Captain)"
                : `Player ${i + 1} Name`}
            </label>
            <input
              type="text"
              className={styles.input}
              value={players[i]}
              onChange={(e) => handlePlayerChange(i, e.target.value)}
              required
            />
          </div>
        ))}

        <label className={styles.label}>Captain Phone</label>
        <input
          type="tel"
          className={styles.input}
          value={captainPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="999-999-9999"
          required
        />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={waiverAccepted}
            onChange={(e) => setWaiverAccepted(e.target.checked)}
            required
          />
          I agree to the waiver
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button}>
          Submit Registration
        </button>
      </form>
    </div>
  );
}