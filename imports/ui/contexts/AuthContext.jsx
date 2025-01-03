import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tracker = Tracker.autorun(() => {
            const meteorUser = Meteor.user();
            setUser(meteorUser);
            setLoading(false);
        });
        return () => tracker.stop();
    }, []);

    const logout = () => {
        Meteor.logout();
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);