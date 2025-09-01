// src/pages/GamePage.jsx

import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import MagneticBoard from '../components/MagneticBoard';

const GamePage = () => {
  const { roomId } = useParams(); // Hook to get the roomId from the URL
  const { socket } = useOutletContext(); // Get the socket from the context
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl mb-4">Game Room: {roomId}</h2>
      <MagneticBoard socket={socket} />
    </div>
  );
};

export default GamePage;