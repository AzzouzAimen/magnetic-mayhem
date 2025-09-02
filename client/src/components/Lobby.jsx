// src/components/Lobby.jsx

import React, { useState } from 'react';
import toast from 'react-hot-toast';

const Lobby = ({ roomId, players,  socket }) => {
  // The host is the first player who joined
  const isHost = players.length > 0 && players[0].id === socket.id;

  const [roundTime, setRoundTime] = useState(60); // Default 60 seconds
  const [customWords, setCustomWords] = useState('');

  const handleStartGame = () => {
    if (players.length < 2) {
      toast.error('You need at least 2 players to start!');
      return;
    }
    const gameOptions = {
      roundTime,
      customWords: customWords.split(',').map(word => word.trim()).filter(word => word),
    };
    
    console.log("Starting game with options:", gameOptions);
    socket.emit('game:start', { roomId, options: gameOptions });
  };
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room code copied!');
  };
  return (
    <div className="w-full max-w-md bg-gray-700 p-6 rounded-lg shadow-xl text-white">
      <h2 className="text-3xl font-bold mb-4 text-center">Lobby</h2>
      <div className="mb-6 text-center">
        <p className="text-lg mb-2">Share this code with your friends:</p>
        <div 
          onClick={handleCopyCode}
          className="text-4xl font-mono bg-gray-800 py-2 rounded-md tracking-widest cursor-pointer relative group"
        >
          {roomId}
          <span className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity">📋</span>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3">Players ({players.length}):</h3>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="bg-gray-600 p-3 rounded-md text-lg">
            {player.name}
          </li>
        ))}
      </ul>
      {/* --- Game Options section --- */}
      {isHost && (
        <div className="mt-6 border-t border-gray-600 pt-4">
          <h3 className="text-xl font-semibold mb-3 text-center">Game Settings</h3>
          
          {/* Round Time Selector */}
          <div className="mb-4">
            <label htmlFor="roundTime" className="block mb-1 font-medium">Round Time (seconds)</label>
            <select
              id="roundTime"
              value={roundTime}
              onChange={(e) => setRoundTime(Number(e.target.value))}
              className="w-full p-2 bg-gray-600 rounded-lg"
            >
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
              <option value="90">90</option>
              <option value="120">120</option>
            </select>
          </div>

          {/* Custom Words Input */}
          <div>
            <label htmlFor="customWords" className="block mb-1 font-medium">Custom Words (optional)</label>
            <textarea
              id="customWords"
              value={customWords}
              onChange={(e) => setCustomWords(e.target.value)}
              placeholder="Enter words separated by commas, e.g., cat, house, computer"
              className="w-full p-2 bg-gray-600 rounded-lg h-24 resize-none"
            />
          </div>
        </div>
      )}

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