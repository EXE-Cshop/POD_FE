import React, { useEffect } from 'react';
import api from '../services/api';
import { authStorage } from '../utils/authStorage';

/**
 * On app load: if no access token in memory, try /auth/refresh (cookie sent automatically).
 * Restores session when user has valid refresh-token cookie from previous login.
 */
const AuthProvider = ({ children }) => {
    useEffect(() => {
        if (authStorage.getAccessToken()) return;
        api.post('/auth/refresh', {})
            .then((res) => {
                const { accessToken } = res.data?.data || res.data || {};
                if (accessToken) authStorage.setAccessToken(accessToken);
            })
            .catch(() => {});
    }, []);

    return children;
};

export default AuthProvider;
