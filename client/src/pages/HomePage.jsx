// src/pages/HomePage.jsx

import React, { useState } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom"; // Import hooks
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const HomePage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate(); // Hook for programmatic navigation
  const { socket } = useOutletContext(); // Get the shared socket

  const handleCreateGame = () => {
    if (!nickname) return alert("Please enter a nickname first.");
    socket.emit("game:create", nickname);
  };

  const handleJoinGame = () => {
    if (!nickname) return alert("Please enter a nickname first.");

    MySwal.fire({
      title: "Join Game",
      text: "Enter the 4-character room code:",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        maxLength: 4,
      },
      showCancelButton: true,
      confirmButtonText: "Join",
      confirmButtonColor: "#22c55e", // green-500
      background: "#374151", // gray-700
      color: "#ffffff",
      preConfirm: (roomId) => {
        if (!roomId || roomId.length !== 4) {
          Swal.showValidationMessage("Please enter a valid 4-character code");
        }
        return roomId;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(`[Client] Attempting to join room: "${result.value}"`);
        socket.emit("game:join", {
          roomId: result.value,
          nickname,
        });
      }
    });
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

    socket.on("game:created", handleSuccessfulJoin);
    socket.on("game:joined", handleSuccessfulJoin);
    socket.on("game:error", onGameError);

    return () => {
      socket.off("game:created", handleSuccessfulJoin);
      socket.off("game:joined", handleSuccessfulJoin);
      socket.off("game:error", onGameError);
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
      <Link
        to="/solo"
        className="w-full text-center px-8 py-3 bg-purple-500 rounded-lg text-xl font-semibold hover:bg-purple-600 transition"
      >
        Play Solo
      </Link>
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
