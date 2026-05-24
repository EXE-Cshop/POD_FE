import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { getCurrentUser } from '../services/api';
import { authStorage } from '../utils/authStorage';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const restoreSession = async () => {
        try {
            const currentUser = await getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        restoreSession();
    }, []);

    const login = (userData) => {
        // Tokens are in cookies now
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout API failed:', err);
        } finally {
            authStorage.clearTokens();
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.roles?.includes('SUPER_ADMIN') || user?.role === 'SUPER_ADMIN',
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
