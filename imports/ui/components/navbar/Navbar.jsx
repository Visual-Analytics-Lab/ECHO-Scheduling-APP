import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import SignInPopup from '../authorization/SignInPopup';
import ChangePassPopup from '../authorization/ChangePassPopup'
import { useAuth } from '../../contexts/AuthContext';
import { useHasRole } from '../../hooks/useHasRole';

const Navbar = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

  const { hasRole: isAdmin, ready: accessReady } = useHasRole(user, ['admin', 'Admin']);

  return (
    <nav className="bg-echo-maroon h-16 flex items-center justify-between px-4 relative">
      <Link to="/" className="flex items-center space-x-2">
        <img
          src="/assets/images/Echo Logo.png"
          alt="Echo Logo"
          className="h-8"
        />
        <h1 className="text-white text-xl">Scheduling App</h1>
      </Link>
      
      {user ? (
        <div className="flex items-center space-x-4">
          <nav className="flex space-x-4">
            <Link to="/dashboard" className="text-white hover:text-gray-200 border-r-2 border-white pr-4">
              Dashboard
            </Link>
            {isAdmin && accessReady && (
              <Link to="/calendar" className="text-white hover:text-gray-200 border-r-2 border-white pr-4">
                Calendar
              </Link>
            )}
            {isAdmin && accessReady && (
              <Link to="/admin" className="text-white hover:text-gray-200 border-r-2 border-white pr-4">
                Administration
              </Link>
            )}
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
              <div className="absolute right-0 top-11 z-50 bg-white shadow-full-border">
                <div className="flex flex-col w-lg">
                  <button
                    onClick={() => { setIsChangePassOpen(true); setIsDropdownOpen(false); }}
                    className="block w-full p-4 text-left hover:bg-gray-200"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => { logout(); setIsDropdownOpen(false); }}
                    className="block w-full p-4 text-left text-red-600 hover:bg-red-100 hover:text-red-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsSignInOpen(!isSignInOpen)}
          className="bg-[#0EA6B2] text-white px-4 py-2 rounded hover:bg-[#0c8f9a] transition-colors"
        >
          Sign in
        </button>
      )}

      {user && (
        <ChangePassPopup
          isOpen={isChangePassOpen}
          onClose={() => setIsChangePassOpen(false)}
        />
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