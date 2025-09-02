// src/components/StampToolbar.jsx
import React from 'react';

const StampToolbar = () => {
  return (
    <div className="absolute flex flex-col gap-4 pointer-events-auto" style={{ top: '25%', left: '9 %' }}>
      <button className="w-12 h-12 bg-purple-400 rounded-md border-2 border-slate-500 shadow-md"></button>
      <button className="w-12 h-12 bg-lime-300 rounded-md border-2 border-slate-500 shadow-md"></button>
      <button className="w-12 h-12 bg-red-400 rounded-md border-2 border-slate-500 shadow-md"></button>
    </div>
  );
};
export default StampToolbar;