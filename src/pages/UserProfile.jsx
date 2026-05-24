import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const getInitials = (nameOrEmail = '') => {
    const source = nameOrEmail.trim();
    if (!source) return 'U';
    const words = source.split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, logout, isAuthenticated } = useAuth();
    const displayName = user?.fullName || user?.email || 'Customer';
    const roles = user?.roles || (user?.role ? [user.role] : []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/home/profile' } });
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 min-h-screen text-slate-900 bg-background-light">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/home')}
                    className="size-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Account</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your profile and order activity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
                            <div className="size-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-black">
                                {getInitials(displayName)}
                            </div>
                            <div className="min-w-0">
                                <h2 className="font-bold text-lg leading-tight truncate">{displayName}</h2>
                                <p className="text-sm text-slate-500 truncate">{user?.email}</p>
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
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 w-full px-4 py-3 mt-4 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                Sign Out
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                                <p className="font-semibold text-slate-900">{displayName}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <p className="font-semibold text-slate-900">{user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                <p className="font-semibold text-slate-900">{user?.phoneNumber || user?.phone || 'Not configured'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
                                <p className="font-semibold text-slate-900">{user?.status || 'ACTIVE'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    {roles.length > 0 ? roles.map((role) => (
                                        <span key={role} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                                            {role}
                                        </span>
                                    )) : <span className="text-slate-500 text-sm">USER</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <h2 className="text-xl font-bold mb-4">Saved Shipping Address</h2>
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4">
                            <span className="material-symbols-outlined text-slate-400 mt-1">home</span>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">No default address configured</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Shipping details are entered during checkout and stored on each order.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
