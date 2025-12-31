import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignInPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        setError('');
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 z-50 bg-white rounded-b-lg p-6 w-96 shadow-full-border">
      <div className="flex flex-col space-y-4">
        {error && <p style={{color: 'red'}}>{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pr-10 border border-gray-300 rounded bg-gray-100"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignInPopup;