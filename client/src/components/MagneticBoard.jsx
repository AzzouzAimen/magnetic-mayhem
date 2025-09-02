// src/components/MagneticBoard.jsx

import React, { useRef, useState, useEffect } from "react";

const MagneticBoard = ({ socket, isDrawer }) => {
  // Refs and State
  const canvasRef = useRef(null); // A ref to our canvas element
  const contextRef = useRef(null); // A ref to store the canvas context
  const [isDrawing, setIsDrawing] = useState(false); // A state to track if the mouse is down

  // A ref to store the last point to avoid re-renders
  const lastPoint = useRef(null);

  // Function to resize canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Adjust canvas size for high-density displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    const context = canvas.getContext("2d");
    context.scale(devicePixelRatio, devicePixelRatio);
    context.lineCap = "round"; // Makes lines smoother
    context.strokeStyle = "black"; // Color of the drawing
    context.lineWidth = 10; // "Pen" thickness

    contextRef.current = context; // Store the configured context in ref
  };

  // useEffect to get the drawing context and handle resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Make sure canvas is available

    // Initial setup
    resizeCanvas();

    // Add resize listener
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
    };
  }, []); // Empty dependency array means this runs only once after component mounts

  // Helper function to draw a line segment - moved outside useEffect so it can be used anywhere
  const drawLine = (start, end) => {
    const context = contextRef.current;
    if (!context) return;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  //useEffect for socket event listeners
  useEffect(() => {
    if (!socket || !canvasRef.current) return; // Don't run if socket is not available yet
    socket.emit("history:request");

    // --- Event Handlers ---
    const handleDrawing = (data) => {
      drawLine(data.start, data.end);
    };

    const handleClear = () => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Handler for receiving the entire history
    const handleDrawHistory = (history) => {
      history.forEach((item) => {
        if (item.type === "drawing") {
          drawLine(item.start, item.end);
        }
      });
    };

    // --- Attach listeners ---
    socket.on("draw:drawing", handleDrawing);
    socket.on("clear", handleClear);
    socket.on("draw:history", handleDrawHistory); // Listen for the history

    // Clean up listeners
    return () => {
      socket.off("draw:drawing", handleDrawing);
      socket.off("clear", handleClear);
      socket.off("draw:history", handleDrawHistory);
    };
  }, [socket]); // Re-run effect if the socket instance changes

  // Drawing Functions
  const startDrawing = (event) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    const { offsetX, offsetY } = event.nativeEvent;
    lastPoint.current = { x: offsetX, y: offsetY };
  };

  const draw = (event) => {
    if (!isDrawing || !isDrawer) return; // Only draw if mouse is down
    const { offsetX, offsetY } = event.nativeEvent;

    // Create the data object to send
    const data = {
      start: lastPoint.current,
      end: { x: offsetX, y: offsetY },
    };

    // Draw locally for immediate feedback
    drawLine(data.start, data.end);
    if (socket) {
      socket.emit("draw:drawing", data);
    }
    // Update the last point
    lastPoint.current = data.end;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    if (socket) {
      socket.emit("clear");
    } else {
      // If offline, clear the canvas directly
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    // --- NEW: Absolute positioned container ---
    <div 
      className="absolute"
      style={{
        // These are ESTIMATES. You will need to fine-tune them!
        top: '22%', 
        left: '23.5%',
        width: '64%',
        height: '59%',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={isDrawer ? startDrawing : undefined}
        onMouseMove={isDrawer ? draw : undefined}
        onMouseUp={isDrawer ? stopDrawing : undefined}
        onMouseLeave={isDrawer ? stopDrawing : undefined}
        // --- REMOVE width/height classes ---
        className={`w-full h-full bg-stone-200 rounded-lg ${
          isDrawer ? 'pen-cursor' : 'cursor-not-allowed'
        }`}
        // We can add the hex grid later, let's get positioning right first
      />
      
      {/* --- MOVE THE BUTTON (we'll replace it later) --- */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
        {isDrawer && (
          <button
            onClick={clearCanvas}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Clear (temp)
          </button>
        )}
      </div>
    </div>
  );
};

export default MagneticBoard;
