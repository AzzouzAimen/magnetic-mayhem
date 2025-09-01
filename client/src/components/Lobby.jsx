// src/components/Lobby.jsx

import React from 'react';

const Lobby = ({ roomId, players,  socket }) => {
  // The host is the first player who joined
  const isHost = players.length > 0 && players[0].id === socket.id;

  const handleStartGame = () => {
    console.log("Attempting to start game...");
    // We'll emit an event to the server
    socket.emit('game:start', roomId);
  };
  return (
    <div className="w-full max-w-md bg-gray-700 p-6 rounded-lg shadow-xl text-white">
      <h2 className="text-3xl font-bold mb-4 text-center">Lobby</h2>
      <div className="mb-6 text-center">
        <p className="text-lg mb-2">Share this code with your friends:</p>
        <p className="text-4xl font-mono bg-gray-800 py-2 rounded-md tracking-widest">{roomId}</p>
      </div>
      <h3 className="text-xl font-semibold mb-3">Players ({players.length}):</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="bg-gray-600 p-3 rounded-md text-lg">
            {player.name}
          </li>
        ))}
      </ul>
      {/* Conditionally render the button */}
      {isHost ? (
        <button
          onClick={handleStartGame}
          disabled={players.length < 2} // Disable if not enough players
          className="mt-6 w-full py-3 bg-green-500 rounded-lg text-xl font-semibold hover:bg-green-600 transition disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
        </button>
      ) : (
        <p className="mt-6 text-center text-xl">Waiting for the host to start the game...</p>
      )}
    </div>
  );
};

export default Lobby;