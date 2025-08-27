// Replace your ChangePassPopup.jsx with this version
import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const ChangePassPopup = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showAdminReset, setShowAdminReset] = useState(false);
  
  // Admin reset states
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    Accounts.changePassword(oldPassword, newPassword, (err) => {
      if (err) {
        setError(err.reason);
      } else {
        toast.success('Password successfully changed!');
        setError('');
        setOldPassword('');
        setNewPassword('');
        onClose();
      }
    });
  };

  const loadUsers = () => {
    if (users.length === 0) {
      setLoadingUsers(true);
      Meteor.call('admin.getUserList', (error, result) => {
        setLoadingUsers(false);
        if (error) {
          setError('Failed to load users: ' + error.reason);
        } else {
          setUsers(result || []);
        }
      });
    }
  };

  const handleAdminReset = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUser || !resetPassword) {
      setError('Please select a user and enter a password');
      return;
    }

    if (resetPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    Meteor.call('admin.resetUserPassword', selectedUser, resetPassword, (error) => {
      if (error) {
        setError('Failed to reset password: ' + error.reason);
      } else {
        toast.success('Password reset successfully!');
        setSelectedUser('');
        setResetPassword('');
        setError('');
      }
    });
  };

  const switchToAdminReset = () => {
    setShowAdminReset(true);
    setError('');
    loadUsers();
  };

  const switchToNormal = () => {
    setShowAdminReset(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 top-16 z-50 bg-white rounded-b-lg p-4 w-96 shadow-full-border max-h-96 overflow-y-auto">
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
        
        {/* Tab buttons */}
        <div className="flex border-b">
          <button
            onClick={switchToNormal}
            className={`flex-1 py-2 text-sm ${!showAdminReset ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
          >
            Change My Password
          </button>
          <button
            onClick={switchToAdminReset}
            className={`flex-1 py-2 text-sm ${showAdminReset ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-600'}`}
          >
            Reset User Password
          </button>
        </div>

        {!showAdminReset ? (
          // Normal password change
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
        ) : (
          // Admin reset form
          <>
            <h4 className="text-red-600 font-medium">Reset Any User's Password</h4>
            <form onSubmit={handleAdminReset} className="space-y-4">
              <div>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                  disabled={loadingUsers}
                >
                  <option value="">
                    {loadingUsers ? 'Loading users...' : 'Choose a user...'}
                  </option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.emails?.[0]?.address || 'No email'})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="password"
                  placeholder="New Password (min 6 characters)"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
                disabled={!selectedUser || !resetPassword}
              >
                Reset Password
              </button>
            </form>
            <p className="text-xs text-gray-600">
              Give the new password to the user securely.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePassPopup;