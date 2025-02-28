import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SignInPopup from '../sign_in/SignInPopup';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="bg-echo-maroon h-16 flex flex-shrink-0 items-center justify-between px-4">
      <div className="flex items-center space-x-2">
        <img
          src="/assets/images/Echo Logo.png"
          alt="Echo Logo"
          className="h-8"
        />
        <h1 className="text-white text-xl">Scheduling App</h1>
      </div>
      
      {user ? (
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-4">
            <Link to="/calendar" className="text-white hover:text-gray-200 border-r-2 border-white pr-4">
              Calendar
            </Link>
            <Link to="/admin" className="text-white hover:text-gray-200 border-r-2 border-white pr-4">
              Administration
            </Link>
          </nav>
          <div className="relative">
            <button 
              className="flex items-center space-x-2 text-white"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{user.emails?.[0]?.address || 'User'}</span>
              <svg 
                className={`w-4 h-4 ml-1 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSignInOpen(true)}
          className="bg-[#0EA6B2] text-white px-4 py-2 rounded hover:bg-[#0c8f9a] transition-colors"
        >
          Sign in
        </button>
      )}

      {!user && (
        <SignInPopup
          isOpen={isSignInOpen}
          onClose={() => setIsSignInOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;