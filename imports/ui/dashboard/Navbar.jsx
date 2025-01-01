import React, { useState } from 'react';
import SignInPopup from './SignInPopup';

const Navbar = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <nav className="bg-[#721D35] h-16 flex items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <img
          src="/path-to-your-logo.png"
          alt="Echo Logo"
          className="h-8"
        />
        <h1 className="text-white text-xl">Scheduling App</h1>
      </div>
      <button
        onClick={() => setIsSignInOpen(true)}
        className="bg-[#0EA6B2] text-white px-4 py-2 rounded hover:bg-[#0c8f9a] transition-colors"
      >
        Sign in
      </button>
      <SignInPopup 
        isOpen={isSignInOpen} 
        onClose={() => setIsSignInOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;