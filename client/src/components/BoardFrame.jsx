// src/components/BoardFrame.jsx

import React from 'react';
import frameSvg from "../assets/board-frame.svg"; // Vite handles importing SVGs as URLs

const BoardFrame = ({ canvas, tools }) => {
  return (
    // The main container for the entire board
    <div
      className="relative"
      style={{
        width: '55vw', // Use almost full viewport width
        maxWidth: '1400px', // Set a maximum size for very large screens
        aspectRatio: '1022 / 740', // Match the actual SVG dimensions
        // backgroundImage: `url(${frameSvg})`,
        // backgroundSize: 'contain',
        // backgroundRepeat: 'no-repeat',
        // backgroundPosition: 'center',
      }}
    >
      {/* --- LAYER 1: The Canvas --- */}
      {/* Render the `canvas` prop on the bottom layer */}
      <div className="absolute inset-0 z-10">{canvas}</div>

      {/* --- LAYER 2: The SVG Frame on Top --- */}
      <img
        src={frameSvg}
        alt="Magnetic drawing board frame"
        className="absolute inset-0 z-20 w-full h-full pointer-events-none"
      />

      {/* --- LAYER 3: The Tools --- */}
      {/* Render the `tools` prop on the topmost layer */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {/* We add pointer-events-none here and enable it on the tools themselves */}
        {tools}
      </div>
    </div>
  );
};

export default BoardFrame;