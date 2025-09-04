import React from 'react';

const GameOver = ({ scores, socket, isHost, roomId }) => {
  const handlePlayAgain = () => {
    socket.emit('game:playAgain', roomId);
  };

  return (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center text-white z-50">
      <h1 className="text-6xl font-bold mb-4">Game Over!</h1>
      <h2 className="text-3xl mb-8">Final Scores:</h2>
      
      <ol className="w-full max-w-sm space-y-3 mb-10">
        {scores.map((player, index) => (
          <li
            key={player.id}
            className="flex items-center justify-between p-4 bg-gray-700 rounded-lg text-xl"
          >
            <div className="flex items-center gap-4">
              <span className="font-bold w-8 text-center">
                {index === 0 ? '🏆' : `${index + 1}.`}
              </span>
              <span className="font-semibold">{player.name}</span>
            </div>
            <span className="font-bold text-yellow-400">{player.score}</span>
          </li>
        ))}
      </ol>
      
      {isHost ? (
        <button
          onClick={handlePlayAgain}
          className="px-8 py-3 bg-green-500 rounded-lg text-xl font-semibold hover:bg-green-600 transition"
        >
          Play Again
        </button>
      ) : (
        <p className="text-xl">Waiting for the host to start a new game...</p>
      )}
    </div>
  );
};

export default GameOver;
