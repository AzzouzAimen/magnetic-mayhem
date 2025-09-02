// src/components/Timer.jsx

import React, { useState, useEffect } from 'react';

const Timer = ({ socket }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(60);

  useEffect(() => {
    if (!socket) return;
    
    const handleRoundStart = ({ roundDuration }) => {
      setTimeLeft(roundDuration);
      setRoundDuration(roundDuration); // Store the total time for this round
    };

    const handleTimerTick = (time) => {
      setTimeLeft(time);
    };

    socket.on('round:start', handleRoundStart);
    socket.on('timer:tick', handleTimerTick);

    return () => {
      socket.off('round:start', handleRoundStart);
      socket.off('timer:tick', handleTimerTick);
    };
  }, [socket]);

  const progress = (timeLeft / roundDuration) * 100; // Assuming 60s rounds

  return (
    <div className="w-full bg-gray-600 rounded-full h-6 shadow-inner">
      <div
        className={`h-6 rounded-full text-center text-white font-bold transition-all duration-500 ${
          timeLeft <= 10 ? 'bg-red-500' : 'bg-green-500'
        }`}
        style={{ width: `${progress}%` }}
      >
        {timeLeft}s
      </div>
    </div>
  );
};

export default Timer;