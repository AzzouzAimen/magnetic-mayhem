// src/pages/HomePage.jsx

import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Import hooks

const HomePage = () => {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { socket } = useOutletContext(); // Get the shared socket

  const handleCreateGame = () => {
    if (!nickname) return alert("Please enter a nickname first.");
    socket.emit('game:create', nickname);
  };

  const handleJoinGame = () => {
    if (!nickname) return alert("Please enter a nickname first.");
    const roomId = prompt("Enter the 4-digit room code:");
    if (roomId && roomId.length === 4) {
      socket.emit('game:join', { roomId, nickname });
    } else if (roomId !== null) { // User didn't click "Cancel"
      alert("Invalid room code. Please enter a 4-digit code.");
    }
  };
  
  // Set up a listener for the server's response
  React.useEffect(() => {
    if (!socket) return;
    
    const handleSuccessfulJoin = ({ roomId, players }) => {
      console.log(`Joined room: ${roomId}. Navigating...`);
      navigate(`/game/${roomId}`, { state: { players } });
    };

    const onGameError = (errorMessage) => {
      console.error(errorMessage);
      alert(errorMessage);
    };
    
    socket.on('game:created', handleSuccessfulJoin); 
    socket.on('game:joined', handleSuccessfulJoin);
    socket.on('game:error', onGameError);

    return () => {
      socket.off('game:created', handleSuccessfulJoin);
      socket.off('game:joined', handleSuccessfulJoin);
      socket.off('game:error', onGameError);
    };
  }, [socket, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <h1 className="text-6xl font-bold mb-4">Magnetic Mayhem</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="px-4 py-2 text-center text-xl bg-gray-700 rounded-lg"
        />
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleCreateGame}
          className="px-8 py-3 bg-green-500 rounded-lg text-xl font-semibold hover:bg-green-600 transition"
        >
          Create Game
        </button>
        <button
          onClick={handleJoinGame} // Wire up the new handler
          className="px-8 py-3 bg-blue-500 rounded-lg text-xl font-semibold hover:bg-blue-600 transition"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default HomePage;