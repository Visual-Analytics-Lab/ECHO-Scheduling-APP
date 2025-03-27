import React from 'react';
import { Navigate } from 'react-router';
import { ThreeCircles } from 'react-loader-spinner';
import { useAuth } from '../../contexts/AuthContext';

export const PrivateRoute = ({ children }) => {
    const {user, loading} = useAuth();
    if(loading) {
      return  (
        <div className="flex h-screen items-center justify-center text-lg font-bold">            
          <ThreeCircles
              height="100" // Customize size
              width="100"  // Customize size
              innerCircleColor="#0ea6b2" // echo-teal
              middleCircleColor="#f9b126" // echo-gold
              outerCircleColor="#721d35" // echo-maroon
              ariaLabel="loading"
          />
        </div>
      );
    }
    return user ? children : <Navigate to="/" replace/>;
};