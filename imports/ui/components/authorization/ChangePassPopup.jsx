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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    setIsResetting(true);
    Meteor.call('admin.resetUserPassword', selectedUser, (error, result) => {
      setIsResetting(false);
      if (error) {
        setError('Failed to generate reset link: ' + error.reason);
      } else {
        const resetMessage = `Reset link generated! Copy this URL and give it to the user:\n\n${result.resetUrl}\n\nThey can use this link to set a new password.`;
        
        // Copy to clipboard if possible
        if (navigator.clipboard) {
          navigator.clipboard.writeText(result.resetUrl);
          toast.success('Reset URL copied to clipboard! Give this link to the user.');
        } else {
          toast.success('Reset link generated! Check the console for the URL.');
          console.log('Password Reset URL:', result.resetUrl);
        }
        
        alert(resetMessage);
        setSelectedUser('');
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
            <h4 className="text-red-600 font-medium">Generate Password Reset Link</h4>
            <p className="text-sm text-gray-600">
              Select a user to generate a secure password reset link for them.
            </p>
            <form onSubmit={handleAdminReset} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select User</label>
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
              <button
                type="submit"
                className={`w-full py-2 rounded transition-colors text-white ${
                  isResetting || !selectedUser
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                disabled={!selectedUser || isResetting}
              >
                {isResetting ? 'Generating Link...' : 'Generate Password Reset Link'}
              </button>
            </form>
            <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded">
              <strong>How it works:</strong>
              <br />
              1. Select a user and click the button
              <br />
              2. Copy the generated reset URL
              <br />
              3. Send the URL to the user securely
              <br />
              4. They can use the link to set a new password
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePassPopup;