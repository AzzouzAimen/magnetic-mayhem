import React from 'react';
import logo from '../assets/logo.png';

const MobileWarning = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 text-center">
        {/* Logo */}
        <div className="mb-6">
          <img src={logo} alt="Magnetic Mayhem Logo" className="w-full max-w-xs mx-auto" />
        </div>
        
        {/* Warning Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        {/* Main Message */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Desktop Required
        </h1>
        
        <p className="text-white/90 mb-6 leading-relaxed">
          Magnetic Mayhem is designed for desktop computers and requires a mouse or trackpad for the best experience. 
          Please access this game from a computer to enjoy all the features.
        </p>
        
        {/* Device Info */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-white/80">
            <strong>Current device:</strong> Mobile/Tablet
          </p>
          <p className="text-sm text-white/80 mt-1">
            <strong>Required:</strong> Desktop computer with mouse
          </p>
        </div>
        
        {/* Decorative Elements */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
        
        <p className="text-xs text-white/60">
          Thank you for your understanding!
        </p>
      </div>
    </div>
  );
};

export default MobileWarning;
