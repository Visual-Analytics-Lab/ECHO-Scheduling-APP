// /imports/ui/components/admin/AdminPasswordReset.jsx
import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';

const AdminPasswordReset = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user list
    setIsLoading(true);
    Meteor.call('admin.getUserList', (error, result) => {
      setIsLoading(false);
      if (error) {
        setError('Failed to load users: ' + error.reason);
      } else {
        setUsers(result || []);
      }
    });
  }, []);

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    Meteor.call('admin.resetUserPassword', selectedUser, newPassword, (error) => {
      setIsLoading(false);
      if (error) {
        setError('Failed to reset password: ' + error.reason);
      } else {
        toast.success('Password reset successfully!');
        setSelectedUser('');
        setNewPassword('');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-red-600">Reset User Password</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          >
            <option value="">Choose a user...</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.username} ({user.emails?.[0]?.address || 'No email'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || !selectedUser || !newPassword}
            className={`flex-1 py-3 rounded-md font-medium transition-colors ${
              isLoading || !selectedUser || !newPassword
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600'
            } text-white`}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Give the new password to the user securely. 
              They should change it after logging in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPasswordReset;