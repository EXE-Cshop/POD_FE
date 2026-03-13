import React from 'react';
import { Link } from 'react-router-dom';

const Forbidden403 = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 font-display">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 relative">
                    <h1 className="text-9xl font-black text-slate-200 select-none">403</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-6xl drop-shadow-lg">
                            gpp_maybe
                        </span>
                    </div>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                    Access Forbidden
                </h2>
                
                <p className="text-slate-500 mb-10 leading-relaxed">
                    Sorry, you don't have permission to access this page. 
                    Please contact your administrator if you believe this is an error.
                </p>
                
                <Link 
                    to="/home" 
                    className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-[#11221c] font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary/20 group"
                >
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">
                        arrow_back
                    </span>
                    Back to Home Page
                </Link>
            </div>
            
            <div className="mt-16 text-slate-400 text-sm">
                &copy; 2024 POD Print Dashboard. All rights reserved.
            </div>
        </div>
    );
};

export default Forbidden403;
