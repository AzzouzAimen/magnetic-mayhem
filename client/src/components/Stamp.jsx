import React from 'react';

const Stamp = ({ shape, color, position, onSelect }) => {
  // Base styles for all stamps
  const baseStyle = {
    position: 'absolute',
    ...position, // Apply position props like { top: '25%', left: '9%', width: '6%', height: '8%' }
    cursor: 'pointer',
    transition: 'transform 0.1s ease-in-out',
    pointerEvents: 'auto', // Ensure this specific element is clickable
  };

  // Define the visual styles for each shape
  const shapeStyles = {
    width: '100%',
    height: '100%',
    backgroundColor: color,
  };

  // Use clip-path for non-rectangular shapes. It's scalable and reliable.
  if (shape === 'square') {
    shapeStyles.borderRadius = '15%';
  } else if (shape === 'circle') {
    shapeStyles.borderRadius = '50%';
  } else if (shape === 'triangle') {
    // A clip-path defines the visible portion of an element.
    // This creates a perfect, scalable triangle.
    shapeStyles.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
  }
  
  // A simple hover effect
  const handleMouseEnter = (e) => { e.currentTarget.style.transform = 'scale(1.1)'; };
  const handleMouseLeave = (e) => { e.currentTarget.style.transform = 'scale(1)'; };

  return (
    <div 
      style={baseStyle}
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={shapeStyles}></div>
    </div>
  );
};

export default Stamp;