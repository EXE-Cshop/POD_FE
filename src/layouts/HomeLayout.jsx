import React from 'react';
import { Outlet } from 'react-router-dom';
import AIChatbox from '../components/AIChatbox';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const HomeLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-display text-gray-900 antialiased">
            <Header />
            <main className="flex-1 overflow-hidden flex flex-col">
                <Outlet />
            </main>
            <Footer />
            <AIChatbox />
        </div>
    );
};

export default HomeLayout;
