// src/pages/HomePage.jsx

import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Import hooks

const HomePage = () => {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { socket } = useOutletContext(); // Get the shared socket

  const handleCreateGame = () => {
    console.log('Requesting to create a new game...');
    socket.emit('game:create');
  };
  
  // Set up a listener for the server's response
  React.useEffect(() => {
    if (!socket) return;
    
    const onGameCreated = (roomId) => {
      console.log(`Game created with ID: ${roomId}. Navigating...`);
      navigate(`/game/${roomId}`); // Navigate to the new game room
    };
    
    socket.on('game:created', onGameCreated);
    
    return () => {
      socket.off('game:created', onGameCreated);
    };
  }, [socket, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white">
      <h1 className="text-6xl font-bold mb-8">Magnetic Mayhem</h1>
      <div className="flex gap-4">
        <button
          onClick={handleCreateGame}
          className="px-8 py-3 bg-green-500 rounded-lg text-xl font-semibold hover:bg-green-600 transition"
        >
          Create Game
        </button>
        <button className="px-8 py-3 bg-blue-500 rounded-lg text-xl font-semibold hover:bg-blue-600 transition">
          Join Game
        </button>
      </div>
    </div>
  );
};

export default HomePage;