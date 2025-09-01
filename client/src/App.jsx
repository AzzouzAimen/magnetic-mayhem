import { use, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";

import MagneticBoard from "./components/MagneticBoard";

const socket = io("http://localhost:4001");

function App() {
  // useEffect to manage the connection
  useEffect(() => {
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
    <Outlet context={{ socket }} />
  );
}

export default App;
