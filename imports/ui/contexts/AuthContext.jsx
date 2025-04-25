import React, { createContext, useContext, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check if user session is stored in localStorage
      const savedUser = localStorage.getItem('userSession');
      if (savedUser) {
        setUser(JSON.parse(savedUser)); // Restore user data from localStorage
        setLoading(false); // Mark loading as done if user is restored
      }

      // Subscribe for access to custom fields like role
      const userSub = Meteor.subscribe('currentUser');
      const tracker = Tracker.autorun(() => {
        const meteorUser = Meteor.user();
        const loggingIn = Meteor.loggingIn();

        if (!loggingIn) {
          setUser(meteorUser);
          if (meteorUser) {
            localStorage.setItem('userSession', JSON.stringify(meteorUser)); // Save user session to localStorage
          } 
          else {
            localStorage.removeItem('userSession'); // Remove session from localStorage on logout
          }
          setLoading(false);
        }
      });

      return () => {
        tracker.stop();
        userSub.stop();
      };
    }, []);

    const logout = () => {
      Meteor.logout();
      setUser(null); // Ensure UI updates immediately
      localStorage.removeItem('userSession'); // Remove user session from localStorage
    };

    return (
      <AuthContext.Provider value={{ user, loading, logout }}>
        {children}
      </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
