import React, { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import MagneticBoard from "../components/MagneticBoard";
import Lobby from "../components/Lobby";
import ChatBox from "../components/ChatBox";
import StatusDisplay from "../components/StatusDisplay";
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
  const [networkedEraseProgress, setNetworkedEraseProgress] = useState(null);
  const boardWrapperRef = useRef(null);

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

    const handleBoardEraseProgress = ({ progress }) => {
      // When a real-time erase progress event comes in, update the networked progress
      setNetworkedEraseProgress(progress);
    };

    const handleBoardErased = ({ progress }) => {
      // When a networked event comes in, trigger the animation
      setNetworkedEraseProgress(progress);
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
    socket.on("board:erase:progress", handleBoardEraseProgress);
    socket.on("board:erased", handleBoardErased);
    socket.on('game:over', handleGameOver);
    socket.on('game:lobby', handleReturnToLobby);

    return () => {
      socket.off("lobby:update", handleLobbyUpdate);
      socket.off("round:start", handleRoundStart);
      socket.off("round:word", handleRoundWord);
      socket.off("board:erase:progress", handleBoardEraseProgress);
      socket.off("board:erased", handleBoardErased);
      socket.off('game:over', handleGameOver);
      socket.off('game:lobby', handleReturnToLobby);
    };
  }, [socket]);

  // When an animation completes, we can reset the slider's visual state
  useEffect(() => {
    if (networkedEraseProgress !== null) {
      const timer = setTimeout(() => setNetworkedEraseProgress(null), 600);
      return () => clearTimeout(timer);
    }
  }, [networkedEraseProgress]);

  // When a new round starts, reset the erase progress
  useEffect(() => {
    if(gameState === 'drawing') {
      setLocalEraseProgress(0);
    }
  }, [gameState]);

  // (Removed dynamic ChatBox height observer)

  // When a stamp is selected, the tool is set.
  // To go back to drawing, the user simply draws again. We'll handle this in MagneticBoard.
  const handleToolSelect = (toolName) => {
    setActiveTool(toolName);
    toast(`${toolName.charAt(0).toUpperCase() + toolName.slice(1)} selected!`, {
      duration: 1500,
    });
  };

  const handleEraseProgress = (progress) => {
    // Set local progress for instant feedback
    setLocalEraseProgress(progress);
    // Broadcast real-time progress to other players
    if (socket && roomId) {
      socket.emit('board:erase:progress', { roomId, progress });
    }
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
        onErase={handleEraseProgress}
        onEraseComplete={handleEraseComplete}
        animateToProgress={networkedEraseProgress}
      />
    </>
  );

  // Define tools for non-drawers (only the eraser slider for animation feedback)
  const nonDrawerTools = (
    <EraserSlider
      position={{ bottom: "5.1%", left: "13%", width: "74%", height: "4%" }}
      onErase={null} // No interaction for non-drawers
      onEraseComplete={null} // No interaction for non-drawers
      animateToProgress={networkedEraseProgress}
    />
  );

  if (gameState === "lobby") {
    return <Lobby roomId={roomId} players={players} socket={socket} />;
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center text-white pt-6 px-2 overflow-x-hidden">
      {/* Atmospheric Background - matching SoloPage */}
      <div className="area"></div>

      {/* The GameOver component will render as an overlay */}
      {gameState === 'results' && (
        <GameOver scores={finalScores} socket={socket} isHost={isHost} roomId={roomId} />
      )}
      
      {/* The main game UI - Sidebar + Board + Chat */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center gap-6 p-2">
        {/* Status Display - Left vertical sidebar */}
        <div className="flex-shrink-0">
          <StatusDisplay 
            socket={socket} 
            isDrawer={isDrawer} 
            currentWord={currentWord}
            players={players}
            drawerId={currentDrawerId}
          />
        </div>

        {/* The Magnetic Drawing Board - Center hero element */}
        <div className="flex-shrink-0" ref={boardWrapperRef}>
          <BoardFrame
            canvas={
              <MagneticBoard
                socket={socket}
                isDrawer={isDrawer}
                activeTool={activeTool}
                onToolSwitch={setActiveTool}
                eraseProgress={isDrawer ? localEraseProgress : networkedEraseProgress}
              />
            }
            tools={isDrawer ? drawerTools : nonDrawerTools}
          />
        </div>

        {/* Chat Box - Right */}
        <div className="flex-shrink-0">
          <ChatBox socket={socket} isDrawer={isDrawer} />
        </div>
      </div>
    </div>
  );
};

export default GamePage;
