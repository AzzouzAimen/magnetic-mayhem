// src/components/MagneticBoard.jsx

import React, { useRef, useState, useEffect } from 'react';


const MagneticBoard = ({ socket }) => {
  // Refs and State
  const canvasRef = useRef(null); // A ref to our canvas element
  const [isDrawing, setIsDrawing] = useState(false); // A state to track if the mouse is down

  // A ref to store the last point to avoid re-renders
  const lastPoint = useRef(null); 

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
  
  // Helper function to draw a line segment - moved outside useEffect so it can be used anywhere
  const drawLine = (start, end) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };
  
  //useEffect for socket event listeners
  useEffect(() => {
    if (!socket || !canvasRef.current) return; // Don't run if socket is not available yet
    socket.emit('history:request');

    // --- Event Handlers ---
    const handleDrawing = (data) => {
        drawLine(data.start, data.end);
    };
    
    const handleClear = () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Handler for receiving the entire history 
    const handleDrawHistory = (history) => {
        history.forEach(item => {
            if (item.type === 'drawing') {
                drawLine(item.start, item.end);
            }
        });
    };
    
    // --- Attach listeners ---
    socket.on('draw:drawing', handleDrawing);
    socket.on('clear', handleClear);
    socket.on('draw:history', handleDrawHistory); // Listen for the history

    // Clean up listeners
    return () => {
      socket.off('draw:drawing', handleDrawing);
      socket.off('clear', handleClear);
      socket.off('draw:history', handleDrawHistory);
    };
  }, [socket]); // Re-run effect if the socket instance changes

  // Drawing Functions
  const startDrawing = (event) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    lastPoint.current = { x: offsetX, y: offsetY };
  };

  const draw = (event) => {
    if (!isDrawing) return; // Only draw if mouse is down
    const { offsetX, offsetY } = event.nativeEvent;

    // Create the data object to send
    const data = {
        start: lastPoint.current,
        end: { x: offsetX, y: offsetY }
    };
    

    // Draw locally for immediate feedback
    drawLine(data.start, data.end);
    socket.emit('draw:drawing', data);
    
    // Update the last point
    lastPoint.current = data.end;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
    
  };

  const clearCanvas = () => {
    socket.emit('clear');
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