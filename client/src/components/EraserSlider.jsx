// src/components/EraserSlider.jsx
import React from 'react';

const EraserSlider = () => {
  return (
    <div 
      className="absolute h-6 bg-green-700 rounded-full flex items-center px-1 pointer-events-auto"
      style={{ bottom: '5.1%', left: '13%', width: '74%' }}
    >
      <div className="w-10 h-8 bg-stone-200 rounded-md shadow-md cursor-grab"></div>
      </div>
  );
};
export default EraserSlider;