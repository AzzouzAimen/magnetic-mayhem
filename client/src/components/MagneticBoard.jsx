// src/components/MagneticBoard.jsx

import React, { useRef, useState, useEffect } from 'react';


const MagneticBoard = () => {
  // Refs and State
  const canvasRef = useRef(null); // A ref to our canvas element
  const [isDrawing, setIsDrawing] = useState(false); // A state to track if the mouse is down

  //  useEffect to get the drawing context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Make sure canvas is available

    // Adjust canvas size for high-density displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    const context = canvas.getContext('2d');
    context.scale(devicePixelRatio, devicePixelRatio);
    context.lineCap = 'round'; // Makes lines smoother
    context.strokeStyle = 'black'; // Color of the drawing
    context.lineWidth = 10; // "Pen" thickness

  }, []); // Empty dependency array means this runs only once after component mounts

  // Drawing Functions
  const startDrawing = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.beginPath(); // Starts a new path
    context.moveTo(offsetX, offsetY); // Moves the "pen" to the mouse position
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return; // Only draw if mouse is down
    const { offsetX, offsetY } = event.nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.lineTo(offsetX, offsetY); // Draws a line to the new mouse position
    context.stroke(); // Renders the line
  };

  const stopDrawing = () => {
    const context = canvasRef.current.getContext('2d');
    context.closePath(); // Closes the current path
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    // Clear the entire canvas rectangle
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[800px] h-[600px] bg-red-500 rounded-2xl p-4 shadow-lg">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full bg-gray-300 rounded-lg cursor-crosshair"
        />
      </div>
      <button
        onClick={clearCanvas}
        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Clear Board
      </button>
    </div>
  );
};

export default MagneticBoard;