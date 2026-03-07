import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <aside className="w-64 flex-shrink-0 bg-white  border-r border-gray-200  hidden md:flex flex-col h-full font-display">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-primary/20"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCRnSSEYHutkMPUcBvdUfDlvvv0M0ZJ7-dTvTeT6QNfSmQOzQMskjmU6_XRsBswUvq3w9dB9pepyUzpuhnHL6ZMwZk-CNLCtXKfHrR04JUkwa1wbth7mSdOue-evh8bdQ4nbZAnbvcZ-40BZXFGXydj_v-W-UDl3pNKrTm4avDccFs_u4hgNHrvRHi2fzNuCMaqd02grDNb9avCA_RKAWB3bEfz9jHzCliJy1v2ZJ06YWtPkmM2_gS5XM4aJaiU1l8_bIgSJD-petw")' }}>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-gray-900  text-base font-bold leading-none">PrintPOD Admin</h1>
                        <p className="text-gray-500  text-xs mt-1">Platform Management</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {[
                    { name: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
                    { name: 'User Directory', icon: 'group', path: '/admin/users' },
                    { name: 'Order Management', icon: 'shopping_cart', path: '/admin/orders' },
                    { name: 'Base Products', icon: 'inventory_2', path: '/admin/base-products' },
                    { name: 'Print Areas', icon: 'aspect_ratio', path: '/admin/print-areas' },
                    { name: 'Stickers', icon: 'category', path: '/admin/stickers' },
                    { name: 'Scheduler', icon: 'schedule', path: '/admin/scheduler' },
                    { name: 'Roles & Permissions', icon: 'shield', path: '/admin/roles' },
                ].map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive
                            ? 'text-gray-900  bg-gray-100  border-l-4 border-primary shadow-sm'
                            : 'text-gray-500  hover:text-gray-900  hover:bg-gray-100'
                            }`}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span className="text-sm font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-gray-50  rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500  uppercase tracking-wider">System Status</span>
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                    </div>
                    <p className="text-sm font-bold text-gray-900 ">All Systems Online</p>
                    <p className="text-[10px] text-gray-500  mt-1">Last synced 2m ago</p>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem('isAdminAuthenticated');
                        navigate('/login');
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg h-10 bg-primary text-[#11221c] text-sm font-bold hover:brightness-110 transition-all"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
