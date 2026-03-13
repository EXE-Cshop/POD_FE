import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './common/Header';
import Footer from './common/Footer';

const AuthLayout = () => {
    return (
        <div className="min-h-screen bg-background-light flex flex-col font-display">
            <Header />
            
            <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full sm:max-w-[480px]">
                    <div className="bg-white px-8 py-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 relative overflow-hidden">
                        {/* Decorative Blobs */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/10 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-100 blur-2xl"></div>

                        <div className="relative z-10">
                            <Outlet />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AuthLayout;
