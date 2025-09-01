import { use, useEffect, useState } from 'react'
import { io } from 'socket.io-client';

import MagneticBoard from './components/MagneticBoard';

const socket = io('http://localhost:3000');

function App() {
  useEffect(() => {
    socket.on('connect', () => {
      console.log(`Connected to server with id: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  return (
   <div className="min-h-screen bg-gray-800 flex items-center justify-center">
      <MagneticBoard />
    </div>
  )
}

export default App
