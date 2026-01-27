import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';
import { getAccessToken, removeToken, setUserName } from '../Auth';

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check initial auth state
        const token = getAccessToken();
        setIsLoggedIn(!!token);
        setLoading(false);
    }, []);

    const login = (firstName) => {
        if (firstName) {
            setUserName(firstName);
        }
        // Token is typically set by the API call before calling this, 
        // or we could pass it here if needed. 
        // Assuming the Login component handles the token storage via the API response utilities,
        // and just calls this to update UI state.
        setIsLoggedIn(true);
    };

    const logout = () => {
        removeToken();
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
