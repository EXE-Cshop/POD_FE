import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light  font-display text-gray-900  antialiased">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
