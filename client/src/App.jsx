import { use, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { Toaster } from 'react-hot-toast';
import { soundManager } from './utils/soundManager';
import { isMobileDevice } from './utils/mobileDetection';
import MobileWarning from './components/MobileWarning'; 

const API_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://magnetic-mayhem-server.onrender.com'
    : 'http://localhost:4001');
const socket = io(API_URL);
// This is a flag to ensure init() is only called once, especially in Strict Mode
let soundManagerInitialized = false;

function App() {
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device on component mount
  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

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

  // Show mobile warning if device is detected as mobile
  if (isMobile) {
    return <MobileWarning />;
  }

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
