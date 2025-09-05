import React, { useRef, useState, useEffect } from "react"; 

const MagneticBoard = ({
  socket,
  isDrawer,
  activeTool,
  onToolSwitch,
  eraseProgress,
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef(null);
  const lastErasePosition = useRef(null);

  // Reset erase position when progress is null (new round)
  useEffect(() => {
    if (eraseProgress === null) {
      lastErasePosition.current = null;
    }
  }, [eraseProgress]);

  // useEffect to watch for erase commands
  useEffect(() => {
    if (eraseProgress !== null) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        // Calculate the erase position and width for bidirectional erasing
        const erasePosition = canvas.width * eraseProgress;
        const eraseWidth = 1; // Width of the erase area
        
        // Calculate the start and end positions for bidirectional erasing
        const startX = Math.max(0, erasePosition - eraseWidth / 2);
        const endX = Math.min(canvas.width, erasePosition + eraseWidth / 2);
        const actualWidth = endX - startX;
        
        // If we have a previous position, fill any gaps between positions
        if (lastErasePosition.current !== null) {
          const prevPosition = lastErasePosition.current;
          const gapStart = Math.min(prevPosition - eraseWidth / 2, startX);
          const gapEnd = Math.max(prevPosition + eraseWidth / 2, endX);
          const gapWidth = gapEnd - gapStart;
          
          // Erase the entire gap area to prevent missing spots
          context.clearRect(gapStart, 0, gapWidth, canvas.height);
        } else {
          // First erase - just erase the current position
          context.clearRect(startX, 0, actualWidth, canvas.height);
        }
        
        // Store the current position for next time
        lastErasePosition.current = erasePosition;
        
        // Redraw the hex pattern in the cleared area
        const rect = canvas.getBoundingClientRect();
        drawHexPattern(context, { width: rect.width, height: rect.height });
      }
    }
  }, [eraseProgress]);

  const drawHexPattern = (context, canvas) => {
    const hexWidth = 12; // Smaller hexagons
    const hexHeight = 14; // Smaller hexagons
    const hexRadius = hexWidth / 2;
    
    context.strokeStyle = "#8d939e";
    context.lineWidth = 0.3; // Thinner lines for smaller hexagons
    
    // Calculate how many hexagons we need to fill the canvas with extra margin
    const cols = Math.ceil(canvas.width / hexWidth) + 2;
    const rows = Math.ceil(canvas.height / (hexHeight * 0.75)) + 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth + (row % 2) * hexRadius;
        const y = row * hexHeight * 0.75;
        
        // Only draw if the hexagon is within or slightly outside the canvas bounds
        if (x > -hexWidth && x < canvas.width + hexWidth && y > -hexHeight && y < canvas.height + hexHeight) {
          context.beginPath();
          context.moveTo(x + hexRadius, y);
          context.lineTo(x + hexWidth, y + hexHeight * 0.25);
          context.lineTo(x + hexWidth, y + hexHeight * 0.75);
          context.lineTo(x + hexRadius, y + hexHeight);
          context.lineTo(x, y + hexHeight * 0.75);
          context.lineTo(x, y + hexHeight * 0.25);
          context.closePath();
          context.stroke();
        }
      }
    }
  };

  const drawRoundedRect = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const context = canvas.getContext("2d");
    context.scale(devicePixelRatio, devicePixelRatio);
    context.lineCap = "round";
    context.strokeStyle = "#4a4a4a"; // Dark gray
    context.fillStyle = "#4a4a4a"; // Dark gray
    context.lineWidth = 5;
    contextRef.current = context;
    
    // Draw the hex pattern background
    drawHexPattern(context, { width: rect.width, height: rect.height });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    resizeCanvas();
    return () => resizeObserver.disconnect();
  }, []);

  const drawShape = (shape, pos, size = 50) => {
    const context = contextRef.current;
    if (!context) return;
    const x = pos.x;
    const y = pos.y;
    
    // Set dark gray color for stamps
    const color = "#4a4a4a";
    context.fillStyle = color;
    context.strokeStyle = color;
    if (shape === "square") {
      const cornerRadius = Math.max(2, Math.round(size * 0.18));
      drawRoundedRect(context, x - size / 2, y - size / 2, size, size, cornerRadius);
      context.fill();
    } else if (shape === "circle") {
      context.beginPath();
      context.arc(x, y, size / 2, 0, 2 * Math.PI);
      context.fill();
    } else if (shape === "triangle") {
      const tSize = Math.round(size * 0.8);
      context.beginPath();
      context.moveTo(x, y - tSize / 2);
      context.lineTo(x - tSize / 2, y + tSize / 2);
      context.lineTo(x + tSize / 2, y + tSize / 2);
      context.closePath();
      // Fill, then stroke with rounded joins to simulate rounded corners
      context.fill();
      context.lineJoin = "round";
      context.lineCap = "round";
      const cornerRadius = Math.max(2, Math.round(tSize * 0.18));
      context.lineWidth = cornerRadius * 2;
      context.stroke();
    }
  };

  const drawLine = (start, end) => {
    const context = contextRef.current;
    if (!context) return;
    
    // Set drawing properties for brush effect
    context.strokeStyle = "#4a4a4a"; // Dark gray instead of black
    context.lineWidth = 5;
    context.lineCap = "round";
    context.lineJoin = "round";
    
    // Create brush effect with multiple overlapping strokes
    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
    const steps = Math.max(1, Math.floor(distance / 2)); // More steps for smoother brush effect
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      
      // Add slight randomness for brush texture
      const offsetX = (Math.random() - 0.5) * 1.5;
      const offsetY = (Math.random() - 0.5) * 1.5;
      const brushSize = 5 + (Math.random() - 0.5) * 2; // Vary brush size slightly
      
      context.lineWidth = brushSize;
      context.globalAlpha = 0.7 + Math.random() * 0.3; // Vary opacity for texture
      
      context.beginPath();
      context.arc(x + offsetX, y + offsetY, brushSize / 2, 0, 2 * Math.PI);
      context.fill();
    }
    
    // Reset alpha for other operations
    context.globalAlpha = 1.0;
  };

  useEffect(() => {
    if (!socket) return;
    console.log(`[MagneticBoard] Requesting history, isDrawer: ${isDrawer}`);
    socket.emit("history:request");
    const handleDrawing = (data) => {
      console.log(`[MagneticBoard] Received drawing event, isDrawer: ${isDrawer}`, data);
      drawLine(data.start, data.end);
    };
    const handlePlaceStamp = (data) => {
      console.log(`[MagneticBoard] Received stamp event, isDrawer: ${isDrawer}`, data);
      drawShape(data.shape, data.position);
    };
    const handleClear = () => {
      console.log(`[MagneticBoard] Received clear event, isDrawer: ${isDrawer}`);
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw the hex pattern after clearing
        const rect = canvas.getBoundingClientRect();
        drawHexPattern(context, { width: rect.width, height: rect.height });
      }
    };
    const handleDrawHistory = (history) => {
      console.log(`[MagneticBoard] Received history, isDrawer: ${isDrawer}, history length: ${history.length}`, history);
      history.forEach((item) => {
        if (item.type === "drawing") {
          drawLine(item.start, item.end);
        } else if (item.type === "stamp") {
          drawShape(item.shape, item.position);
        }
      });
    };
    socket.on("draw:drawing", handleDrawing);
    socket.on("stamp:place", handlePlaceStamp);
    socket.on("clear", handleClear);
    socket.on("draw:history", handleDrawHistory);
    return () => {
      socket.off("draw:drawing", handleDrawing);
      socket.off("stamp:place", handlePlaceStamp);
      socket.off("clear", handleClear);
      socket.off("draw:history", handleDrawHistory);
    };
  }, [socket]);

  const placeStamp = (shape, position) => {
    drawShape(shape, position);
    if (socket) {
      socket.emit("stamp:place", { shape, position });
    }
    // Automatically switch back to the pen tool after placing a stamp
    onToolSwitch("pen");
  };

  const handleMouseDown = (event) => {
    if (!isDrawer) return;
    const { offsetX, offsetY } = event.nativeEvent;

    if (activeTool === "pen") {
      setIsDrawing(true);
      lastPoint.current = { x: offsetX, y: offsetY };
    } else {
      placeStamp(activeTool, { x: offsetX, y: offsetY });
    }
  };

  const draw = (event) => {
    if (!isDrawing || !isDrawer || activeTool !== "pen") return;
    const { offsetX, offsetY } = event.nativeEvent;
    const data = { start: lastPoint.current, end: { x: offsetX, y: offsetY } };
    drawLine(data.start, data.end);
    if (socket) {
      console.log(`[MagneticBoard] Emitting drawing event:`, data);
      socket.emit("draw:drawing", data);
    }
    lastPoint.current = data.end;
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div
      className="absolute"
      style={{ top: "20%", left: "23%", width: "64%", height: "61%" }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={isDrawer ? handleMouseDown : undefined}
        onMouseMove={isDrawer ? draw : undefined}
        onMouseUp={isDrawer ? stopDrawing : undefined}
        onMouseLeave={isDrawer ? stopDrawing : undefined}
        className={`w-full h-full bg-stone-200 rounded-lg ${
          isDrawer && activeTool === 'pen' ? 'pen-cursor' : ''
        } ${!isDrawer ? 'cursor-not-allowed' : ''}`}
      />
    </div>
  );
};

export default MagneticBoard;
