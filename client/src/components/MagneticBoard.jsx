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

  // useEffect to watch for erase commands
  useEffect(() => {
    if (eraseProgress !== null) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        // Calculate the width to clear based on progress
        const clearWidth = canvas.width * eraseProgress;
        // Erase from the right side back to the cleared width
        context.clearRect(0, 0, clearWidth, canvas.height);
      }
    }
  }, [eraseProgress]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const context = canvas.getContext("2d");
    context.scale(devicePixelRatio, devicePixelRatio);
    context.lineCap = "round";
    context.strokeStyle = "black";
    context.fillStyle = "black";
    context.lineWidth = 10;
    contextRef.current = context;
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
    context.beginPath();
    if (shape === "square") {
      context.rect(x - size / 2, y - size / 2, size, size);
    } else if (shape === "circle") {
      context.arc(x, y, size / 2, 0, 2 * Math.PI);
    } else if (shape === "triangle") {
      context.moveTo(x, y - size / 2);
      context.lineTo(x - size / 2, y + size / 2);
      context.lineTo(x + size / 2, y + size / 2);
      context.closePath();
    }
    context.fill();
  };

  const drawLine = (start, end) => {
    const context = contextRef.current;
    if (!context) return;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.closePath();
  };

  useEffect(() => {
    if (!socket) return;
    socket.emit("history:request");
    const handleDrawing = (data) => drawLine(data.start, data.end);
    const handlePlaceStamp = (data) => drawShape(data.shape, data.position);
    const handleClear = () => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    const handleDrawHistory = (history) => {
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
      socket.emit("draw:drawing", data);
    }
    lastPoint.current = data.end;
  };

  const stopDrawing = () => setIsDrawing(false);

  return (
    <div
      className="absolute"
      style={{ top: "20%", left: "22%", width: "67%", height: "60%" }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={isDrawer ? handleMouseDown : undefined}
        onMouseMove={isDrawer ? draw : undefined}
        onMouseUp={isDrawer ? stopDrawing : undefined}
        onMouseLeave={isDrawer ? stopDrawing : undefined}
        className={`w-full h-full bg-stone-200 rounded-lg ${
          isDrawer ? "cursor-crosshair" : "cursor-not-allowed"
        }`}
      />
    </div>
  );
};

export default MagneticBoard;
