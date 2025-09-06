// src/components/Lobby.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, Crown } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";
import RetroButton from "./RetroButton";


const Lobby = ({ roomId, players, socket }) => {
  // The host is the first player who joined
  const isHost = players.length > 0 && players[0].id === socket.id;

  const [roundTime, setRoundTime] = useState(60); // Default 60 seconds
  const [customWords, setCustomWords] = useState("");

  const handleStartGame = () => {
    if (players.length < 2) {
      toast.error("You need at least 2 players to start!");
      return;
    }
    const gameOptions = {
      roundTime,
      customWords: customWords
        .split(",")
        .map((word) => word.trim())
        .filter((word) => word),
    };

    console.log("Starting game with options:", gameOptions);
    socket.emit("game:start", { roomId, options: gameOptions });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room code copied!");
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      {/* Back to Menu Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          &larr; Back to Menu
        </Link>
      </div>

      {/* Lobby Title - Positioned above container */}
      <h2
        className="absolute top-8 left-1/2 transform -translate-x-1/2 text-5xl md:text-6xl font-bold text-white z-20"
        style={{
          fontFamily: "Fredoka One, cursive",
          textShadow: `
            -6px -6px 0 #15803d,
            6px -6px 0 #15803d,
            -6px 6px 0 #15803d,
            6px 6px 0 #15803d,
            -5px -6px 0 #15803d,
            5px -6px 0 #15803d,
            -5px 6px 0 #15803d,
            5px 6px 0 #15803d,
            -6px -5px 0 #15803d,
            6px -5px 0 #15803d,
            -6px 5px 0 #15803d,
            6px 5px 0 #15803d,
            -4px -6px 0 #15803d,
            4px -6px 0 #15803d,
            -4px 6px 0 #15803d,
            4px 6px 0 #15803d,
            -6px -4px 0 #15803d,
            6px -4px 0 #15803d,
            -6px 4px 0 #15803d,
            6px 4px 0 #15803d,
            -3px -6px 0 #15803d,
            3px -6px 0 #15803d,
            -3px 6px 0 #15803d,
            3px 6px 0 #15803d,
            -6px -3px 0 #15803d,
            6px -3px 0 #15803d,
            -6px 3px 0 #15803d,
            6px 3px 0 #15803d,
            -2px -6px 0 #15803d,
            2px -6px 0 #15803d,
            -2px 6px 0 #15803d,
            2px 6px 0 #15803d,
            -6px -2px 0 #15803d,
            6px -2px 0 #15803d,
            -6px 2px 0 #15803d,
            6px 2px 0 #15803d,
            -1px -6px 0 #15803d,
            1px -6px 0 #15803d,
            -1px 6px 0 #15803d,
            1px 6px 0 #15803d,
            -6px -1px 0 #15803d,
            6px -1px 0 #15803d,
            -6px 1px 0 #15803d,
            6px 1px 0 #15803d,
            -5px -5px 0 #15803d,
            5px -5px 0 #15803d,
            -5px 5px 0 #15803d,
            5px 5px 0 #15803d,
            -4px -5px 0 #15803d,
            4px -5px 0 #15803d,
            -4px 5px 0 #15803d,
            4px 5px 0 #15803d,
            -5px -4px 0 #15803d,
            5px -4px 0 #15803d,
            -5px 4px 0 #15803d,
            5px 4px 0 #15803d,
            -3px -5px 0 #15803d,
            3px -5px 0 #15803d,
            -3px 5px 0 #15803d,
            3px 5px 0 #15803d,
            -5px -3px 0 #15803d,
            5px -3px 0 #15803d,
            -5px 3px 0 #15803d,
            5px 3px 0 #15803d,
            -2px -5px 0 #15803d,
            2px -5px 0 #15803d,
            -2px 5px 0 #15803d,
            2px 5px 0 #15803d,
            -5px -2px 0 #15803d,
            5px -2px 0 #15803d,
            -5px 2px 0 #15803d,
            5px 2px 0 #15803d,
            -1px -5px 0 #15803d,
            1px -5px 0 #15803d,
            -1px 5px 0 #15803d,
            1px 5px 0 #15803d,
            -5px -1px 0 #15803d,
            5px -1px 0 #15803d,
            -5px 1px 0 #15803d,
            5px 1px 0 #15803d,
            -4px -4px 0 #15803d,
            4px -4px 0 #15803d,
            -4px 4px 0 #15803d,
            4px 4px 0 #15803d,
            -3px -4px 0 #15803d,
            3px -4px 0 #15803d,
            -3px 4px 0 #15803d,
            3px 4px 0 #15803d,
            -4px -3px 0 #15803d,
            4px -3px 0 #15803d,
            -4px 3px 0 #15803d,
            4px 3px 0 #15803d,
            -2px -4px 0 #15803d,
            2px -4px 0 #15803d,
            -2px 4px 0 #15803d,
            2px 4px 0 #15803d,
            -4px -2px 0 #15803d,
            4px -2px 0 #15803d,
            -4px 2px 0 #15803d,
            4px 2px 0 #15803d,
            -1px -4px 0 #15803d,
            1px -4px 0 #15803d,
            -1px 4px 0 #15803d,
            1px 4px 0 #15803d,
            -4px -1px 0 #15803d,
            4px -1px 0 #15803d,
            -4px 1px 0 #15803d,
            4px 1px 0 #15803d,
            -3px -3px 0 #15803d,
            3px -3px 0 #15803d,
            -3px 3px 0 #15803d,
            3px 3px 0 #15803d,
            -2px -3px 0 #15803d,
            2px -3px 0 #15803d,
            -2px 3px 0 #15803d,
            2px 3px 0 #15803d,
            -3px -2px 0 #15803d,
            3px -2px 0 #15803d,
            -3px 2px 0 #15803d,
            3px 2px 0 #15803d,
            -1px -3px 0 #15803d,
            1px -3px 0 #15803d,
            -1px 3px 0 #15803d,
            1px 3px 0 #15803d,
            -3px -1px 0 #15803d,
            3px -1px 0 #15803d,
            -3px 1px 0 #15803d,
            3px 1px 0 #15803d,
            -2px -2px 0 #15803d,
            2px -2px 0 #15803d,
            -2px 2px 0 #15803d,
            2px 2px 0 #15803d,
            -1px -2px 0 #15803d,
            1px -2px 0 #15803d,
            -1px 2px 0 #15803d,
            1px 2px 0 #15803d,
            -2px -1px 0 #15803d,
            2px -1px 0 #15803d,
            -2px 1px 0 #15803d,
            2px 1px 0 #15803d,
            -1px -1px 0 #15803d,
            1px -1px 0 #15803d,
            -1px 1px 0 #15803d,
            1px 1px 0 #15803d
          `,
        }}
      >
        Lobby
      </h2>

      <div className="relative z-10 flex flex-col items-center p-6 md:p-8 bg-stone-200 rounded-3xl border-8 border-green-700 shadow-2xl w-11/12 max-w-xl shadow-inner-custom max-h-[90vh] overflow-y-auto mt-16">

        {/* Room Code LCD Display */}
        <div className="mb-6 text-center">
          <p className="text-lg mb-3 text-slate-700 font-semibold">
            Share this code with your friends:
          </p>
          <div
            onClick={handleCopyCode}
            className="relative group cursor-pointer"
          >
            <div className="bg-slate-800 p-3 rounded-lg shadow-inner border-2 border-slate-600">
              <div className="text-4xl font-mono font-bold text-cyan-400 tracking-widest">
                {roomId}
              </div>
            </div>
            <div className="absolute -right-2 -top-2 bg-green-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Copy size={16} />
            </div>
          </div>
        </div>

        {/* Players Section */}
        <div className="w-full mb-6">
          <h3
            className="text-2xl font-bold mb-3 text-center text-green-700"
            style={{ fontFamily: "Fredoka One, cursive" }}
          >
            Players ({players.length})
          </h3>
          <div className="space-y-3">
            {players.map((player, index) => {
              const isPlayerHost = index === 0;

              return (
                <div
                  key={player.id}
                  className="bg-stone-300 p-4 rounded-xl shadow-inner border-2 border-stone-400 flex items-center gap-3"
                >
                  <span
                    className="text-lg font-bold text-slate-800"
                    style={{ fontFamily: "Nunito, sans-serif" }}
                  >
                    {player.name}
                  </span>
                  {isPlayerHost && (
                    <Crown size={20} className="text-yellow-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Game Settings - Host Only */}
        {isHost && (
          <div className="w-full mb-6">
            <h3
              className="text-2xl font-bold mb-3 text-center text-green-700"
              style={{ fontFamily: "Fredoka One, cursive" }}
            >
              Game Settings
            </h3>
            <div className="bg-stone-300 p-4 rounded-xl shadow-inner border-2 border-stone-400">
              {/* Round Time Selector */}
              <div className="mb-4">
                <label
                  htmlFor="roundTime"
                  className="block mb-2 font-semibold text-slate-700"
                >
                  Round Time (seconds)
                </label>
                <select
                  id="roundTime"
                  value={roundTime}
                  onChange={(e) => setRoundTime(Number(e.target.value))}
                  className="w-full p-2 bg-stone-200 border-2 border-stone-400 rounded-lg text-slate-800 font-semibold focus:outline-none focus:border-green-600 transition-colors"
                  style={{ fontFamily: "Nunito, sans-serif" }}
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
                <label
                  htmlFor="customWords"
                  className="block mb-2 font-semibold text-slate-700"
                >
                  Custom Words (optional)
                </label>
                <textarea
                  id="customWords"
                  value={customWords}
                  onChange={(e) => setCustomWords(e.target.value)}
                  placeholder="Enter words separated by commas, e.g., cat, house, computer"
                  className="w-full p-2 bg-stone-200 border-2 border-stone-400 rounded-lg h-20 resize-none text-slate-800 font-semibold focus:outline-none focus:border-green-600 transition-colors"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="w-full">
          {isHost ? (
            <RetroButton
              color="green"
              onClick={handleStartGame}
              disabled={players.length < 2}
            >
              {players.length < 2 ? "Waiting for players..." : "Start Game"}
            </RetroButton>
          ) : (
            <div className="text-center">
              <p
                className="text-xl text-slate-700 font-semibold"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Waiting for the host to start the game...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
