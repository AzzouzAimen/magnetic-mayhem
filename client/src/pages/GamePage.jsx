import React, { useState, useEffect } from "react";
import { useParams, useOutletContext, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MagneticBoard from "../components/MagneticBoard";
import Lobby from "../components/Lobby";
import PlayerList from "../components/PlayerList";
import ChatBox from "../components/ChatBox";
import Timer from "../components/Timer";
import BoardFrame from "../components/BoardFrame";
import Stamp from "../components/Stamp";
import EraserSlider from "../components/EraserSlider";
import GameOver from '../components/GameOver';

const GamePage = () => {
  const { roomId } = useParams();
  const { socket } = useOutletContext();
  const location = useLocation();

  const [players, setPlayers] = useState(location.state?.players || []);
  const [gameState, setGameState] = useState("lobby");
  const [currentDrawerId, setCurrentDrawerId] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  // The active tool can be a stamp shape or 'pen'
  const [activeTool, setActiveTool] = useState("pen");

  const [localEraseProgress, setLocalEraseProgress] = useState(null);
  const [finalScores, setFinalScores] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleLobbyUpdate = (playerList) => setPlayers(playerList);
    const handleRoundStart = ({ drawerId }) => {
      setGameState("drawing");
      setCurrentDrawerId(drawerId);
      setCurrentWord("");
      setActiveTool("pen"); // Default to pen at the start of each round
    };
    const handleRoundWord = (word) => setCurrentWord(word);

    const handleBoardErased = ({ progress }) => {
      // When receiving a networked event, we just set the final state
      // This will cause an instant clear on other clients' boards.
      // We will add the animation for this later.
      setLocalEraseProgress(progress);
    };
    const handleGameOver = (scores) => {
      console.log("Game over! Final scores:", scores);
      setGameState('results');
      setFinalScores(scores);
    };

    const handleReturnToLobby = () => {
      console.log("Returning to lobby.");
      setGameState('lobby');
      setFinalScores([]);
      setCurrentDrawerId(null);
      setCurrentWord('');
    };

    socket.on("lobby:update", handleLobbyUpdate);
    socket.on("round:start", handleRoundStart);
    socket.on("round:word", handleRoundWord);
    socket.on("board:erased", handleBoardErased);
    socket.on('game:over', handleGameOver);
    socket.on('game:lobby', handleReturnToLobby);

    return () => {
      socket.off("lobby:update", handleLobbyUpdate);
      socket.off("round:start", handleRoundStart);
      socket.off("round:word", handleRoundWord);
      socket.off("board:erased", handleBoardErased);
      socket.off('game:over', handleGameOver);
      socket.off('game:lobby', handleReturnToLobby);
    };
  }, [socket]);

  // When a stamp is selected, the tool is set.
  // To go back to drawing, the user simply draws again. We'll handle this in MagneticBoard.
  const handleToolSelect = (toolName) => {
    setActiveTool(toolName);
    toast(`${toolName.charAt(0).toUpperCase() + toolName.slice(1)} selected!`, {
      duration: 1500,
    });
  };

  const handleEraseComplete = (progress) => {
    if (socket && roomId) {
      socket.emit('board:erase', { roomId, progress });
    }
  };

  const isDrawer = socket.id === currentDrawerId;
  const isHost = players.length > 0 && players[0].id === socket.id;

  // Define the set of tools available to the drawer
  const drawerTools = (
    <>
      <Stamp
        shape="square"
        color="#a855f7"
        position={{ top: "28.5%", left: "12.2%", width: "7%", height: "9.7%" }}
        onSelect={() => handleToolSelect("square")}
      />
      <Stamp
        shape="triangle"
        color="#a3e635"
        position={{ top: "45.2%", left: "12%", width: "7.2%", height: "9%" }}
        onSelect={() => handleToolSelect("triangle")}
      />
      <Stamp
        shape="circle"
        color="#ef4444"
        position={{ top: "61.2%", left: "12.1%", width: "7.2%", height: "10%" }}
        onSelect={() => handleToolSelect("circle")}
      />
      <EraserSlider
        position={{ bottom: "5.1%", left: "13%", width: "74%", height: "4%" }}
        onErase={setLocalEraseProgress}
        onEraseComplete={handleEraseComplete}
      />
    </>
  );

  if (gameState === "lobby") {
    return <Lobby roomId={roomId} players={players} socket={socket} />;
  }

  return (
    <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-start p-4 text-white">
      {/* The GameOver component will render as an overlay */}
      {gameState === 'results' && (
        <GameOver scores={finalScores} socket={socket} isHost={isHost} roomId={roomId} />
      )}
      
      {/* The main game UI is still here, and will be visible under the overlay */}
      <div className="w-full max-w-6xl mb-4">
        <div className="text-center mb-2">
          {isDrawer ? (
            <h2 className="text-3xl font-bold">
              Your word is:{" "}
              <span className="text-yellow-400">{currentWord}</span>
            </h2>
          ) : (
            <h2 className="text-3xl">Guess the drawing!</h2>
          )}
        </div>
        <Timer socket={socket} />
      </div>

      <div className="w-full max-w-6xl flex items-center justify-center gap-4">
        <PlayerList players={players} drawerId={currentDrawerId} />
        <BoardFrame
          canvas={
            <MagneticBoard
              socket={socket}
              isDrawer={isDrawer}
              activeTool={activeTool}
              onToolSwitch={setActiveTool}
              eraseProgress={localEraseProgress}
            />
          }
          tools={isDrawer ? drawerTools : null}
        />
        <div className="w-80 flex-shrink-0">
          <ChatBox socket={socket} isDrawer={isDrawer} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
