import React, { useState, useRef, useEffect } from "react";
import { soundManager } from '../utils/soundManager';

const EraserSlider = ({ position, onErase, onEraseComplete, animateToProgress  }) => {
  const trackRef = useRef(null);
  const handleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

// handle networked real-time updates
useEffect(() => {
  if (animateToProgress !== null && handleRef.current) {
    // For real-time updates, move instantly without transition
    handleRef.current.style.transition = '';
    handleRef.current.style.left = `${animateToProgress * 100}%`;
  }
}, [animateToProgress]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !trackRef.current) return;

      const trackRect = trackRef.current.getBoundingClientRect();
      const handleWidth = handleRef.current.offsetWidth;

      // Calculate position of the mouse relative to the track
      let mouseX = e.clientX - trackRect.left;

      // Clamp the position to stay within the track boundaries
      // Use the full handle width to keep it completely within the track
      mouseX = Math.max(
        handleWidth,
        Math.min(mouseX, trackRect.width - handleWidth)
      );

      const progress =
        (mouseX - handleWidth) / (trackRect.width - handleWidth);

      // Update the handle's visual position
      handleRef.current.style.left = `${progress * 100}%`;

      // Call the callback to erase the canvas in real-time
      if (onErase) {
        onErase(progress);
      }
    };

    const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Call the final callback for networking
      if (onEraseComplete) {
        const trackRect = trackRef.current.getBoundingClientRect();
        const handleWidth = handleRef.current.offsetWidth;
        const finalProgress =
          (parseFloat(handleRef.current.style.left) || 0) / 100;
        onEraseComplete(finalProgress);
      }
    };

    // Add listeners to the window so dragging works even if the cursor leaves the slider
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    // Cleanup function to remove listeners
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onErase, onEraseComplete]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    // Don't allow dragging if onErase is null (non-drawer mode)
    if (!onErase) return;
    
    soundManager.play('erase'); // Play erase sound when starting to erase
    
    if (handleRef.current) {
      // Remove any existing transition to ensure drag is snappy
      handleRef.current.style.transition = '';
    }
    setIsDragging(true);
  };

  return (
    <div
      ref={trackRef}
      className="absolute h-6 bg-green-700 rounded-full flex items-center px-1 pointer-events-auto"
      style={position}
    >
      <div
        ref={handleRef}
        onMouseDown={handleMouseDown}
        //className="absolute top-1/2 -translate-y-1/2 w-10 h-8 bg-stone-200 rounded-md shadow-md cursor-grab active:cursor-grabbing"
        className={`absolute top-1/2 -translate-y-1/2 bg-stone-200 rounded-md shadow-md ${
          onErase ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
        style={{
          width: '15%',
          height: '70%',
          left: "0%"// Initial position
        }}
      ></div>
    </div>
  );
};
export default EraserSlider;
