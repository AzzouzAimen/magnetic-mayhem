import React, { useState, useEffect } from 'react';

const StatusDisplay = ({ socket, isDrawer, currentWord, players, drawerId }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleRoundStart = ({ roundDuration }) => {
      setTimeLeft(roundDuration);
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

  const renderWordDisplay = () => {
    if (isDrawer) {
      return (
        <div className="text-center">
          <span className="text-stone-700 text-sm font-medium">Your word is:</span>
          <span className="text-[#1d4ed8] text-xl font-medium ml-1 break-words">{currentWord}</span>
        </div>
      );
    }
    const underscores = currentWord ? '_ '.repeat(currentWord.length).trim() : '';
    return (
      <div className="text-center">
        <span className="text-stone-700 text-sm font-medium">Guess the word:</span>
        <span className="text-[#1d4ed8] text-xl font-medium ml-1 tracking-widest">{underscores}</span>
      </div>
    );
  };

  return (
    <div className="relative w-64" style={{ height: '75vh' }}>
      <div className="pointer-events-none absolute -inset-[1.5px] rounded-2xl bg-gradient-to-b from-emerald-300/70 via-green-500/60 to-emerald-700/60 opacity-70 blur-[1px]"></div>
      <div className="relative h-full min-h-0 rounded-2xl p-1 bg-green-900/90 shadow-[inset_0_2px_0_rgba(255,255,255,.15)]">
        <div className="textured-container rounded-xl p-2 h-full flex flex-col gap-2">
          {/* Timer */}
          <div
            className={`rounded-xl border-2 shadow-xl px-3 py-2 relative overflow-hidden flex flex-col items-center justify-center ${
              timeLeft <= 10
                ? 'bg-gradient-to-b from-red-500 to-red-600 border-red-700 text-white animate-pulse'
                : timeLeft <= 20
                ? 'bg-gradient-to-b from-amber-400 to-amber-500 border-amber-600 text-white'
                : 'bg-gradient-to-b from-green-500 to-green-600 border-green-700 text-white'
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-8 bg-white/25 blur-[6px] opacity-40"></div>
            <div className="absolute inset-x-0 top-6 h-4 bg-white/15 blur-[10px] opacity-25"></div>
            <div className="text-[10px] uppercase tracking-widest opacity-90">Time</div>
            <div className="text-4xl font-extrabold leading-none drop-shadow-sm">
              {timeLeft > 0 ? timeLeft : '—'}
            </div>
            <div className="text-[10px] tracking-wide opacity-90">seconds</div>
          </div>

          {/* Word */}
          <div className="font-['Fredoka_One']">
            {renderWordDisplay()}
          </div>

          {/* Players */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {players.map((player) => {
              const isCurrentDrawer = player.id === drawerId;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between w-full px-2 py-1 rounded-lg text-sm border ${
                    isCurrentDrawer
                      ? 'bg-green-100 border-green-600 shadow-md'
                      : 'bg-stone-100 border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`${
                      isCurrentDrawer ? 'bg-[#eab308]' : 'bg-stone-500'
                    } w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[11px]`}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`${
                      isCurrentDrawer ? 'text-[#eab308] font-semibold' : 'text-stone-700'
                    } truncate`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isCurrentDrawer && <span className="text-[#eab308]">✏️</span>}
                    <span className={`${
                      isCurrentDrawer ? 'text-[#eab308] font-bold' : 'text-stone-600 font-semibold'
                    }`}>
                      ({player.score})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDisplay;
