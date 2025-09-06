import { use, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { Toaster } from 'react-hot-toast';
import { soundManager } from './utils/soundManager'; 

const socket = io("http://localhost:4001");
// This is a flag to ensure init() is only called once, especially in Strict Mode
let soundManagerInitialized = false;

function App() {
  // useEffect to manage the connection
  useEffect(() => {
    if (!soundManagerInitialized) {
      soundManager.init();
      soundManagerInitialized = true;
    }
    // --- Define handlers ---
    const onConnect = () => {
      console.log(`✅ You're connected with id: ${socket.id}`);
    };

    const onDisconnect = () => {
      console.log('❌ You were disconnected.');
    };
    
    // --- Attach listeners ---
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Clean up the connection when the component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <Outlet context={{ socket }} />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </>
  );
}

export default App;
