import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

const Header = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    React.useEffect(() => {
        const updateCount = () => {
            if (user) {
                // For simplicity, we could fetch from server, but for now let's just use a placeholder or local state
                // Ideally, AuthProvider would manage global cart count.
                // Let's just use 0 for now until we have a real global state.
                setCartCount(0); 
            } else {
                const items = JSON.parse(localStorage.getItem('guest_cart') || '[]');
                setCartCount(items.reduce((sum, item) => sum + (item.quantity || 1), 0));
            }
        };
        updateCount();
        window.addEventListener('storage', updateCount);
        const interval = setInterval(updateCount, 2000); 
        return () => {
            window.removeEventListener('storage', updateCount);
            clearInterval(interval);
        };
    }, [user]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-solid border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 py-3 transition-all duration-300">
            <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-900">
                    <Link to="/home" className="flex items-center gap-3">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-background-dark" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">POD Print</h2>
                    </Link>
                </div>

                {/* Slot for middle content (e.g., designer tools) */}
                <div className="flex-1 flex justify-center px-4">
                    {children}
                </div>

                <div className="flex items-center gap-4">
                    <nav className="hidden lg:flex items-center gap-6 mr-4">
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home">Home</Link>
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home/catalog">Catalog</Link>
                        <Link className="text-slate-600 text-sm font-medium hover:text-primary transition-colors" to="/home/community-designs">
                            Thiết kế cộng đồng
                        </Link>
                    </nav>

                    {/* Cart */}
                    <button
                        onClick={() => navigate('/home/cart')}
                        className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">shopping_cart</span>
                        {cartCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[#11221c] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    {/* User Profile / Menu */}
                    <div className="relative">
                        <button
                            onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                            className="flex items-center gap-2 pl-4 ml-1 border-l border-slate-200 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                            title={user ? user.fullName : "Sign In / Account"}
                        >
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold max-w-[80px] truncate hidden sm:inline-block">{(user.fullName || user.email || '').split(' ').pop()}</span>
                                    <span className="material-symbols-outlined text-[24px]">account_circle</span>
                                </div>
                            ) : (
                                <span className="material-symbols-outlined text-[24px]">account_circle</span>
                            )}
                        </button>

                        {user && showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-[100] animate-fade-in">
                                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Account</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                </div>
                                <Link
                                    to="/home/profile"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <span className="material-symbols-outlined text-[18px]">person</span>
                                    My Profile
                                </Link>
                                <Link
                                    to="/home/my-orders"
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                                    onClick={() => setShowUserMenu(false)}
                                >
                                    <span className="material-symbols-outlined text-[18px]">history</span>
                                    My Orders
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin/dashboard"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                        Admin Panel
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
