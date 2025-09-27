// src/components/PoolTable.jsx
import React from "react";

const PoolTable = ({ pool }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{pool.name} Standings</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2">Finish</th>
              <th className="px-4 py-2">Team</th>
              <th className="px-4 py-2 text-center">Wins</th>
              <th className="px-4 py-2 text-center">Losses</th>
              <th className="px-4 py-2 text-center">Diff</th>
            </tr>
          </thead>
          <tbody>
            {pool.teams.map((team, idx) => (
              <tr
                key={team.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } border-t`}
              >
                <td className="px-4 py-2 font-medium">{idx + 1}</td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <span
                    className="w-5 h-5 rounded-full inline-block"
                    style={{ backgroundColor: team.color }}
                  ></span>
                  <span>{team.name}</span>
                </td>
                <td className="px-4 py-2 text-center">{team.wins}</td>
                <td className="px-4 py-2 text-center">{team.losses}</td>
                <td className="px-4 py-2 text-center">{team.diff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PoolTable;