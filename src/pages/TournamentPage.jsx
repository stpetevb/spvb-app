import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { TEAM_COLORS } from "../services/standingsService";
import styles from "./TournamentPage.module.css";

export default function TournamentPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [divisions, setDivisions] = useState([]);
  const [registrationsByDiv, setRegistrationsByDiv] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tDoc = await getDoc(doc(db, "tournaments", tournamentId));
        let tData = null;
        if (tDoc.exists()) {
          tData = { id: tDoc.id, ...tDoc.data() };
          setTournament(tData);
        }

        const divSnap = await getDocs(
          collection(db, "tournaments", tournamentId, "divisions")
        );
        let divs = divSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        if (divs.length === 0 && tData?.divisions) {
          if (typeof tData.divisions[0] === "string") {
            divs = tData.divisions.map((name) => ({
              id: name.toLowerCase().replace(/\s+/g, "-"),
              name,
            }));
          } else {
            divs = tData.divisions.map((d) => ({
              id: d.id,
              name: d.name,
            }));
          }
        }

        setDivisions(divs);

        const regMap = {};
        for (let div of divs) {
          const regSnap = await getDocs(
            collection(
              db,
              "tournaments",
              tournamentId,
              "divisions",
              div.id,
              "registrations"
            )
          );
          regMap[div.id] = regSnap.docs.map((r, idx) => {
            const data = r.data();
            return {
              id: r.id,
              teamName: data.teamName || "Unnamed Team",
              players: Array.isArray(data.players) ? data.players : [],
              captainPhone: data.captainPhone || "",
              waiverAccepted: !!data.waiverAccepted,
              seed: data.seed ?? idx + 1, // fallback seed
              color: TEAM_COLORS[idx % TEAM_COLORS.length],
              ...data,
            };
          });
        }

        setRegistrationsByDiv(regMap);
      } catch (err) {
        console.error("❌ Error loading tournament:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId]);

  if (loading) return <p>Loading tournament...</p>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>{tournament?.name}</h2>
      <p className={styles.subtitle}>
        {tournament?.location} —{" "}
        {tournament?.date?.toDate
          ? tournament.date.toDate().toLocaleDateString()
          : new Date(tournament?.date).toLocaleDateString()}
      </p>

      <h3 className={styles.sectionTitle}>Divisions</h3>
      <ul className={styles.divisionList}>
        {divisions.map((div) => (
          <li key={div.id} className={styles.divisionItem}>
            <Link
              to={`/t/${tournamentId}/${div.id}`}
              className={styles.divisionLink}
            >
              {div.name}
            </Link>
          </li>
        ))}
      </ul>

      <h3 className={styles.sectionTitle}>Registered Teams</h3>
      {divisions.length === 0 && <p>No registrations yet.</p>}
      {divisions.map((div) => {
        const teams = registrationsByDiv[div.id] || [];
        return (
          <div key={div.id} className={styles.divisionBlock}>
            <h4>{div.name}</h4>
            {teams.length === 0 ? (
              <p>No teams registered yet.</p>
            ) : (
              <table className={styles.teamTable}>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Players</th>
                    <th>Seed</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td className={styles.teamCell}>
                        <div className={styles.teamIconWrapper}>
                          <div
                            className={styles.teamIcon}
                            style={{ backgroundColor: team.color }}
                          ></div>
                          <span className={styles.seedNumber}>
                            {team.seed ?? "—"}
                          </span>
                        </div>
                        <strong>{team.teamName}</strong>
                      </td>
                      <td>
                        {team.players.length > 0
                          ? team.players.join(" / ")
                          : "—"}
                      </td>
                      <td>
                        {team.seed != null ? (
                          <span className={styles.seedBadge}>{team.seed}</span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}