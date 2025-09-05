import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import MagneticBoard from "../components/MagneticBoard";
import BoardFrame from "../components/BoardFrame";
import Stamp from "../components/Stamp";
import EraserSlider from "../components/EraserSlider";

const SoloPage = () => {
  const [activeTool, setActiveTool] = useState('pen');
  const [localEraseProgress, setLocalEraseProgress] = useState(null);

  const handleToolSelect = (toolName) => {
    setActiveTool(toolName);
    toast(`${toolName.charAt(0).toUpperCase() + toolName.slice(1)} selected!`, { duration: 1500 });
  };

  const handleEraseComplete = (progress) => {
    // In solo mode, we don't need to emit to server, just handle locally
    // The progress is already set via onErase callback
    console.log('Erase completed with progress:', progress);
  };

  const soloTools = (
    <>
      <Stamp 
        shape="square" 
        color="#a855f7"
        position={{ top: '28.5%', left: '12.2%', width: '7%', height: '9.7%' }} 
        onSelect={() => handleToolSelect('square')}
      />
      <Stamp 
        shape="triangle" 
        color="#eab308"
        position={{ top: '45.2%', left: '12%', width: '7.2%', height: '9%' }}
        onSelect={() => handleToolSelect('triangle')}
      />
      <Stamp 
        shape="circle" 
        color="#ef4444"
        position={{ top: '61.2%', left: '12.1%', width: '7.2%', height: '10%' }}
        onSelect={() => handleToolSelect('circle')}
      />
      <EraserSlider 
        position={{ bottom: '5.1%', left: '13%', width: '74%', height: '4%' }}
        onErase={setLocalEraseProgress}
        onEraseComplete={handleEraseComplete}
      />
    </>
  );

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center text-white p-4 overflow-hidden">
      {/* Atmospheric Background */}
      <div className="area"></div>

      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          &larr; Back to Menu
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center relative z-10">
        <BoardFrame
          canvas={<MagneticBoard socket={null} isDrawer={true} activeTool={activeTool} onToolSwitch={setActiveTool} eraseProgress={localEraseProgress} />}
          tools={soloTools}
        />
      </div>
    </div>
  );
};

export default SoloPage;