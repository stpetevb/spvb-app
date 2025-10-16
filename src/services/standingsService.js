// src/services/standingsService.js
// Shared helper to compute overall playoff standings from pool play

export function computeOverallStandings(matches, registrations, teamSeedMap, teamColorMap = {}) {
  const standings = {};

  // Normalize team key to registration ID
  const findId = (key) => {
    if (!key) return null;
    const regById = registrations.find((r) => r.id === key);
    if (regById) return regById.id;
    const regByName = registrations.find((r) => r.teamName === key);
    if (regByName) return regByName.id;
    return key;
  };

  // Count results from matches
  matches.forEach((match) => {
    const scoreA = match.adminLocked ? match.scoreA : match.playerScoreA;
    const scoreB = match.adminLocked ? match.scoreB : match.playerScoreB;
    if (match.status !== "final" || typeof scoreA !== "number" || typeof scoreB !== "number") return;

    const teamAKey = findId(match.teamA);
    const teamBKey = findId(match.teamB);
    if (!teamAKey || !teamBKey) return;

    if (!standings[teamAKey]) {
      standings[teamAKey] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, teamId: teamAKey };
    }
    if (!standings[teamBKey]) {
      standings[teamBKey] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, teamId: teamBKey };
    }

    standings[teamAKey].pointsFor += scoreA;
    standings[teamAKey].pointsAgainst += scoreB;
    standings[teamBKey].pointsFor += scoreB;
    standings[teamBKey].pointsAgainst += scoreA;

    if (scoreA > scoreB) {
      standings[teamAKey].wins++;
      standings[teamBKey].losses++;
    } else if (scoreB > scoreA) {
      standings[teamBKey].wins++;
      standings[teamAKey].losses++;
    }
  });

  // Ensure every registered team appears in standings
  registrations.forEach((reg) => {
    if (!standings[reg.id]) {
      standings[reg.id] = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        teamId: reg.id,
      };
    }
  });

  // Build sorted array
  return Object.values(standings)
    .map((rec) => {
      const reg = registrations.find((r) => r.id === rec.teamId);
      return {
        teamId: rec.teamId,
        teamName: reg?.teamName || "Unknown",
        players: reg?.players || [],
        wins: rec.wins,
        losses: rec.losses,
        diff: rec.pointsFor - rec.pointsAgainst,
        seed: reg?.seed ?? 9999,
        color: teamColorMap[rec.teamId] || "#ccc",
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return a.seed - b.seed;
    });
}

/**
 * Build consistent team maps for brackets and standings
 * @param {Array} registrations - registration docs
 * @param {Array} standings - optional sorted standings array for current ranks
 * @returns {Object} { teamNameMap, teamColorMap, teamSeedMap }
 */
export function buildTeamMaps(registrations, standings = null) {
  const teamNameMap = {};
  const teamColorMap = {};
  const teamSeedMap = {};

  const colors = [
    "#e6194b", "#3cb44b", "#ffd700", "#4363d8",
    "#ff8c00", "#911eb4", "#46f0f0", "#f032e6",
    "#8b4513", "#fabebe", "#008080", "#e6beff",
    "#9a6324", "#fffac8", "#800000", "#aaffc3",
    "#808000", "#ffd8b1", "#000075", "#808080"
  ];

  registrations.forEach((reg, idx) => {
    teamNameMap[reg.id] = reg.players.length > 0 ? reg.players.join(" / ") : reg.teamName;
    if (standings) {
      const rank = standings.findIndex(s => s.id === reg.id) + 1;
      teamSeedMap[reg.id] = rank || (reg.seed ?? idx + 1);
    } else {
      teamSeedMap[reg.id] = reg.seed ?? idx + 1;
    }
    teamColorMap[reg.id] = colors[idx % colors.length];
  });

  return { teamNameMap, teamColorMap, teamSeedMap };
}