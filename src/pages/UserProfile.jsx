import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';
import { authService } from '../services/api';

const UserProfile = () => {
    const navigate = useNavigate();

    // Mock user details
    const user = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1 (555) 123-4567',
        joined: 'Member since Oct 2023',
        initials: 'JD'
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (_) { /* ignore if already invalid */ }
        authStorage.clearTokens();
        navigate('/login');
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 min-h-screen text-slate-900 bg-background-light">
            {/* Header section with back button */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/home')}
                    className="size-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your profile, orders, and addresses.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar Menu */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                            <div className="size-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-black">
                                {user.initials}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-tight">{user.name}</h2>
                                <p className="text-sm text-slate-500">{user.joined}</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link to="/home/profile" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 text-primary font-bold transition-colors">
                                <span className="material-symbols-outlined text-[20px]">person</span>
                                Profile Info
                            </Link>
                            <Link to="/home/my-orders" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors">
                                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                                My Orders
                            </Link>
                            <Link to="/home" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors">
                                <span className="material-symbols-outlined text-[20px]">location_on</span>
                                Saved Addresses
                            </Link>
                            <Link to="/home" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold transition-colors">
                                <span className="material-symbols-outlined text-[20px]">credit_card</span>
                                Payment Methods
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 mt-4 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Personal Information</h2>
                            <button className="text-primary hover:text-primary/80 font-bold text-sm">Edit</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                <p className="font-semibold text-slate-900">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <p className="font-semibold text-slate-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                <p className="font-semibold text-slate-900">{user.phone}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <p className="font-semibold text-slate-900">••••••••</p>
                            </div>
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Default Shipping Address</h2>
                            <button className="text-primary hover:text-primary/80 font-bold text-sm">Manage Settings</button>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4">
                            <div className="mt-1">
                                <span className="material-symbols-outlined text-slate-400">home</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">{user.name}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-2">
                                    123 Creative Studio Ave, Suite 4B
                                    <br />
                                    New York, NY 10012
                                    <br />
                                    United States
                                </p>
                                <p className="text-slate-500 text-sm">{user.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
