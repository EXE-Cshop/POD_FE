import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { cartService } from '../../services/api';

const Header = ({ children }) => {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    React.useEffect(() => {
        const updateCount = async () => {
            if (user) {
                try {
                    const res = await cartService.get();
                    const data = res.data?.data || res.data || {};
                    setCartCount(data.totalItems || 0);
                } catch {
                    setCartCount(0);
                }
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
                            <span className="material-symbols-outlined text-background-dark text-[20px] font-black">shopping_bag</span>
                        </div>
                        <h2 className="text-lg font-black leading-tight tracking-tighter uppercase">CShop</h2>
                    </Link>
                </div>

                {/* Slot for middle content */}
                <div className="flex-1 flex justify-center px-4">
                    {children}
                </div>

                <div className="flex items-center gap-4">
                    <nav className="hidden lg:flex items-center gap-6 mr-4">
                        <Link className="text-slate-600 text-xs font-black uppercase tracking-wider hover:text-primary transition-colors" to="/home">Home</Link>
                        <Link className="text-slate-600 text-xs font-black uppercase tracking-wider hover:text-primary transition-colors" to="/home/catalog">Catalog</Link>
                        <Link className="text-slate-600 text-xs font-black uppercase tracking-wider hover:text-primary transition-colors" to="/home/categories/streetwear">
                            Streetwear
                        </Link>
                        <Link className="text-slate-600 text-xs font-black uppercase tracking-wider hover:text-primary transition-colors" to="/home/categories/minimalist">
                            Minimalist
                        </Link>
                        <Link className="text-slate-600 text-xs font-black uppercase tracking-wider hover:text-primary transition-colors" to="/home/wishlist">
                            Wishlist
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
