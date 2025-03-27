import React from 'react';
import { Navigate } from 'react-router';
import { ThreeCircles } from 'react-loader-spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTracker } from 'meteor/react-meteor-data';
import { RolesCollection } from '../../../api/collections';

export const PrivateRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  // Subscribe to roles collection
  Meteor.subscribe('roles');

  // Fetch role IDs for the allowed role names
  const allowedRoleIds = useTracker(() => {
    if (!allowedRoles || allowedRoles.length === 0) return [];
    return RolesCollection.find({ role: { $in: allowedRoles } }).fetch().map(doc => doc._id);
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg font-bold">
        <ThreeCircles
          height="100"
          width="100"
          innerCircleColor="#0ea6b2"
          middleCircleColor="#f9b126"
          outerCircleColor="#721d35"
          ariaLabel="loading"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Only check roles if allowedRoles is provided and non-empty
  if (allowedRoles) {
    const userRoles = user?.roles || [];
    const hasAccess = userRoles.some(userRoleId => allowedRoleIds.includes(userRoleId));
    if (!hasAccess) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-lg mb-1">
            Sorry, you do not have the required permissions to view this page.
          </p>
          <p className="text-md">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      );
    }
  }

  return children;
};