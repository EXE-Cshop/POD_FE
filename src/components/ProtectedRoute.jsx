import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = () => {
    const { user, loading, isAdmin } = useAuth();
    
    if (loading) return null; // Or a loading spinner

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/403" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
