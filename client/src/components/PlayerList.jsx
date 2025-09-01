// src/components/PlayerList.jsx

import React from 'react';

const PlayerList = ({ players, drawerId }) => {
  return (
    <div className="w-64 bg-gray-700 p-4 rounded-lg shadow-xl text-white">
      <h3 className="text-xl font-bold mb-3 text-center">Players</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            // Highlight the current drawer
            className={`p-3 rounded-md flex justify-between items-center ${
              player.id === drawerId ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span className="font-semibold">{player.name}</span>
            <span className="font-bold text-yellow-400">{player.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;