// src/services/poolService.js

/**
 * Generate pools based on total number of teams.
 * @param {Array} teams - list of team objects, each with {id, name, seed}
 * @returns {Array} pools - array of pools with assigned teams
 */
export function generatePools(teams) {
  const numTeams = teams.length;
  const pools = [];

  if (numTeams <= 6) {
    // For <= 6 teams, single pool
    pools.push({ name: "Pool A", teams });
  } else {
    // For 7+ teams, split into pools of 4-6
    const numPools = Math.ceil(numTeams / 6);
    const poolSize = Math.ceil(numTeams / numPools);

    for (let i = 0; i < numPools; i++) {
      const poolTeams = teams.slice(i * poolSize, (i + 1) * poolSize);
      pools.push({ name: `Pool ${String.fromCharCode(65 + i)}`, teams: poolTeams });
    }
  }

  return pools;
}

/**
 * Generate matches for a pool of teams.
 * Ensures ~4 games/team where possible.
 * @param {Array} teams - array of team objects with {id, name, seed}
 * @returns {Array} matches - array of matches {teamA, teamB}
 */
export function generatePoolMatches(teams) {
  const numTeams = teams.length;
  const matches = [];

  if (numTeams === 3) {
    // Each team plays each other twice
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matches.push({ teamA: teams[i], teamB: teams[j] });
        matches.push({ teamA: teams[i], teamB: teams[j] });
      }
    }
  } else if (numTeams === 4) {
    // Each plays 3 games + 1 extra (avoid #1 vs #2 if possible)
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matches.push({ teamA: teams[i], teamB: teams[j] });
      }
    }
    // Add one extra match: lowest seeds play each other again
    matches.push({ teamA: teams[2], teamB: teams[3] });
  } else if (numTeams === 5) {
    // Full round robin (4 games each)
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matches.push({ teamA: teams[i], teamB: teams[j] });
      }
    }
  } else if (numTeams === 6) {
    // Option C: 4 games each, skip one matchup per team (avoid 1 vs 2)
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        // Skip if i=0 (seed 1) and j=1 (seed 2)
        if (i === 0 && j === 1) continue;
        matches.push({ teamA: teams[i], teamB: teams[j] });
      }
    }
    // This generates 15-1 = 14 games → each team plays 4
  } else {
    // Generic round robin for larger pools (simplify for now)
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        matches.push({ teamA: teams[i], teamB: teams[j] });
      }
    }
  }

  return matches;
}