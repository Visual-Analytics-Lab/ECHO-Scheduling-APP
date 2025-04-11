import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Subscribe for access to custom fields like role
      const userSub = Meteor.subscribe('currentUser');
      const tracker = Tracker.autorun(() => {
        const meteorUser = Meteor.user();
        const loggingIn = Meteor.loggingIn();

        if (!loggingIn) {
          setUser(meteorUser);
          setLoading(false);
        }
      });
      return () => tracker.stop();
    }, []);

    const logout = () => {
      Meteor.logout();
      setUser(null); // Ensure UI updates immediately
    };

    return (
      <AuthContext.Provider value={{ user, loading, logout }}>
        {children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);