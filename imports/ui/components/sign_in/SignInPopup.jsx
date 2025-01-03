import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

const SignInPopup = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        setError(err.reason)
      } else {
        setError('')
      }
  });
    console.log('Signing in with:', email, password);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
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
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Sign in
            </button>
          </form>
          <div className="text-sm text-blue-500 hover:underline cursor-pointer">
            Forgot Password?
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPopup;