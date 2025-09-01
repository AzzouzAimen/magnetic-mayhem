// src/pages/GamePage.jsx

import React, { useState, useEffect } from 'react'; // Add hooks
import { useParams, useOutletContext, useLocation  } from 'react-router-dom';
import MagneticBoard from '../components/MagneticBoard';
import Lobby from '../components/Lobby'; // Import Lobby

const GamePage = () => {
  const { roomId } = useParams();
  const { socket } = useOutletContext();
  const location = useLocation(); // Hook to access navigation state

  // Initialize the players state with the data passed from HomePage, if it exists
  const [players, setPlayers] = useState(location.state?.players || []);
  const [gameState, setGameState] = useState('lobby');
  const [currentDrawerId, setCurrentDrawerId] = useState(null);
  const [currentWord, setCurrentWord] = useState('');

  useEffect(() => {
    if (!socket) return;

    // --- Event Handlers ---
    const handleLobbyUpdate = (playerList) => {
      setPlayers(playerList);
    };
    const handleRoundStart = ({ drawerId }) => {
      console.log(`New round started. Drawer is ${drawerId}`);
      setGameState('drawing');
      setCurrentDrawerId(drawerId);
      setCurrentWord(''); // Clear the word from the previous round
    };

    const handleRoundWord = (word) => {
      console.log(`You are the drawer! The word is: ${word}`);
      setCurrentWord(word);
    };


    // --- Attach Listeners ---
    socket.on('lobby:update', handleLobbyUpdate);
    socket.on('round:start', handleRoundStart);
    socket.on('round:word', handleRoundWord);

    return () => {
      socket.off('lobby:update', handleLobbyUpdate);
      socket.off('round:start', handleRoundStart);
      socket.off('round:word', handleRoundWord);
    };
  }, [socket]);

  // Determine current user's role 
  const isDrawer = socket.id === currentDrawerId;

  if (gameState === 'lobby') {
    return <Lobby roomId={roomId} players={players} socket={socket} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center text-white p-4">
      {/* --- NEW Game UI Header --- */}
      <div className="w-full max-w-4xl mb-4 text-center">
        {isDrawer ? (
          <h2 className="text-3xl font-bold">Your word is: <span className="text-yellow-400">{currentWord}</span></h2>
        ) : (
          <h2 className="text-3xl">Guess the drawing!</h2>
        )}
      </div>

      <MagneticBoard socket={socket} />

      {/* We will add a player list/scoreboard and a chat/guess box here next */}
    </div>
  );
};

export default GamePage;