import React from 'react';
import { Navigate } from 'react-router';
import { ThreeCircles } from 'react-loader-spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useHasRole } from '../../hooks/useHasRole';

export const PrivateRoute = ({ allowedRoles, children }) => {
  const { user, userLoading } = useAuth();

  // Get role access and readiness from the hook
  const { hasRole: hasRole, ready: accessReady } = useHasRole(user, allowedRoles);

  // If the user is still loading or the roles are not ready, show the loading spinner
  if (userLoading) {
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

  // If no user, redirect to login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If the user doesn't have the required role, show access denied
  if (!hasRole && allowedRoles && accessReady) {
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

  // Render the children (actual page content)
  return children;
};
