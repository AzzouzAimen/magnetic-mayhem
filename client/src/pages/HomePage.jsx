import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import AnimatedBackground from "../components/AnimatedBackground";
import RetroButton from "../components/RetroButton";
import logo from '../assets/logo.png';

const MySwal = withReactContent(Swal);

const HomePage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const { socket } = useOutletContext();

  const handleCreateGame = () => {
    if (!nickname) return MySwal.fire({ title: 'Oops...', text: 'Please enter a nickname first!', background: '#374151', color: '#ffffff' });
    socket.emit("game:create", nickname);
  };

  const handleJoinGame = () => {
    if (!nickname) return MySwal.fire({ title: 'Oops...', text: 'Please enter a nickname first!', background: '#374151', color: '#ffffff' });

    MySwal.fire({
      title: "Join Game",
      text: "Enter the 4-character room code:",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
        maxLength: 4,
        className: 'bg-gray-600 text-white text-center text-2xl p-2 rounded'
      },
      showCancelButton: true,
      confirmButtonText: "Join",
      confirmButtonColor: "#22c55e",
      background: "#374151",
      color: "#ffffff",
      preConfirm: (roomId) => {
        if (!roomId || roomId.length !== 4) {
          Swal.showValidationMessage("Please enter a valid 4-character code");
        }
        return roomId;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit("game:join", {
          roomId: result.value.toUpperCase(),
          nickname,
        });
      }
    });
  };

  useEffect(() => {
    if (!socket) return;
    const handleSuccessfulJoin = ({ roomId, players }) => navigate(`/game/${roomId}`, { state: { players } });
    const onGameError = (errorMessage) => MySwal.fire({ title: 'Error', text: errorMessage, icon: 'error', background: '#374151', color: '#ffffff' });
    
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col items-center p-8 md:p-12 bg-stone-200 rounded-3xl border-8 border-green-700 shadow-2xl w-11/12 max-w-lg shadow-inner-custom">
        <div className="-mt-24 md:-mt-32 mb-4">
            <img src={logo} alt="Magnetic Mayhem Logo" className="w-full max-w-xs md:max-w-md" />
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="nameplate-input"
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <RetroButton color="red" onClick={handleCreateGame}>Create Game</RetroButton>
          <RetroButton color="yellow" onClick={handleJoinGame}>Join Game</RetroButton>
          <RetroButton color="purple" as="Link" to="/solo">Sandbox Mode</RetroButton>
        </div>
      </div>
    </div>
  );
};

export default HomePage;