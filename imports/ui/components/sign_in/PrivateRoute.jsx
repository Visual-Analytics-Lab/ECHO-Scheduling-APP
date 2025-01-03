import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export const PrivateRoute = ({ children }) => {
    const {user, loading} = useAuth();
    if(loading) {
        return <div>Loading...</div>
    }
    return user ? children : <Navigate to="/" />;
};