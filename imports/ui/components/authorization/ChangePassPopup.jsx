import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const ChangePassPopup = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    Accounts.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        toast.success('Password succesfully changed!');
        setError('');
        setOldPassword('');
        setNewPassword('');
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 z-50 bg-white rounded-b-lg p-4 w-96 shadow-full-border">
      {/* Close Button */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-3 pb-2 font-bold text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="flex flex-col space-y-4">
        {error && <p style={{color: 'red'}}>{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Change Password
            </button>
          </form>
      </div>
    </div>
  );
};

export default ChangePassPopup;