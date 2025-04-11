import React, { useEffect } from 'react';
import Navbar from '../navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user, navigate]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1 }}>
                <div style={{ padding: '20px' }}>
                    <h1>Welcome to Echo Scheduling App</h1>
                </div>
            </div>
        </div>
    );
};
