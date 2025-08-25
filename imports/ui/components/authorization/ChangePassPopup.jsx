import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTracker } from 'meteor/react-meteor-data';

const ChangePassPopup = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [showUserReset, setShowUserReset] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is admin or specialist
  const currentUser = useTracker(() => Meteor.user());
  const canResetPasswords = useTracker(() => {
    if (!currentUser) return false;
    
    // Subscribe to roles
    const rolesSub = Meteor.subscribe('roles');
    if (!rolesSub.ready()) return false;
    
    const adminRole = Meteor.collection('roles').findOne({ title: 'Admin' });
    const specialistRole = Meteor.collection('roles').findOne({ title: 'Specialist' }); // Adjust if your role name is different
    
    return (adminRole && currentUser.role_id === adminRole._id) || 
           (specialistRole && currentUser.role_id === specialistRole._id);
  });

  // Get all users for password reset (only if admin/specialist)
  const allUsers = useTracker(() => {
    if (!canResetPasswords) return [];
    
    const usersSub = Meteor.subscribe('users');
    if (!usersSub.ready()) return [];
    
    return Meteor.users.find({}, { 
      fields: { username: 1, emails: 1 }
    }).fetch();
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    Accounts.changePassword(oldPassword, newPassword, (err) => {
      setIsLoading(false);
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

  const handleUserReset = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedUser || !resetPassword) {
      setError('Please select a user and enter a new password');
      setIsLoading(false);
      return;
    }

    if (resetPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    Meteor.call('users.resetPassword', selectedUser, resetPassword, (error) => {
      setIsLoading(false);
      if (error) {
        setError(error.reason || 'Failed to reset password');
      } else {
        toast.success('Password reset successfully!');
        setError('');
        setSelectedUser('');
        setResetPassword('');
        setShowUserReset(false);
      }
    });
  };

  // Reset states when popup closes
  useEffect(() => {
    if (!isOpen) {
      setOldPassword('');
      setNewPassword('');
      setError('');
      setShowUserReset(false);
      setSelectedUser('');
      setResetPassword('');
    }
  }, [isOpen]);

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
        
        {/* Tab buttons for admin/specialist */}
        {canResetPasswords && (
          <div className="flex border-b">
            <button
              onClick={() => setShowUserReset(false)}
              className={`flex-1 py-2 text-sm ${!showUserReset ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            >
              Change My Password
            </button>
            <button
              onClick={() => setShowUserReset(true)}
              className={`flex-1 py-2 text-sm ${showUserReset ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
            >
              Reset User Password
            </button>
          </div>
        )}

        {!showUserReset ? (
          // Regular password change form
          <>
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
                disabled={isLoading}
                className={`w-full py-2 rounded transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </>
        ) : (
          // User reset form (for admins/specialists)
          <>
            <h3 className="text-lg font-semibold text-orange-600">Reset User Password</h3>
            <p className="text-sm text-gray-600">
              Select a user and set a new password for them.
            </p>
            <form onSubmit={handleUserReset} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select User</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                  required
                >
                  <option value="">Choose a user...</option>
                  {allUsers.map(user => (
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
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-500 hover:bg-orange-600'
                } text-white`}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePassPopup;