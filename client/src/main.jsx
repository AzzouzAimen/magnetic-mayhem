// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'; 
import GamePage from './pages/GamePage.jsx'; 
import './index.css'

//  Define our routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App is the parent layout component
    children: [ // These routes render inside App's <Outlet />
      {
        index: true, // This is the default child route for "/"
        element: <HomePage />,
      },
      {
        path: "game/:roomId",
        element: <GamePage />,
      },
    ],
  },
]);

// Provide the router to our app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)