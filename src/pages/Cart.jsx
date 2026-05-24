import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, promotionService } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';
import { useAuth } from '../components/AuthProvider';
import { formatCurrency } from '../utils/formatters';

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">account_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 font-display">Login Required</h3>
                    <p className="text-slate-500 mb-8">
                        Please sign in or create an account to proceed with your checkout. 
                        Your selected items will be saved to your account automatically.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onLogin}
                            className="w-full h-12 bg-primary text-[#11221c] rounded-xl font-bold hover:brightness-105 transition-all shadow-lg"
                        >
                            Sign In / Register
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full h-12 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                        >
                            Continue as Guest
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Coupon states
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isAuthenticated) {
                const res = await cartService.get();
                setCartItems(res.data?.data?.items || res.data?.items || []);
            } else {
                setCartItems(guestCartStorage.getCartItems());
            }
        } catch (err) {
            console.error('Fetch cart failed:', err);
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                setError(err.message || 'Failed to fetch cart');
            } else {
                setCartItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Load saved coupon from sessionStorage if exists
    useEffect(() => {
        const savedCoupon = sessionStorage.getItem('applied_coupon');
        if (savedCoupon) {
            try {
                setAppliedPromo(JSON.parse(savedCoupon));
            } catch (e) {
                sessionStorage.removeItem('applied_coupon');
            }
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
        try {
            if (isAuthenticated) {
                const res = await cartService.updateItem(itemId, { quantity: newQuantity });
                setCartItems(res.data?.data?.items || res.data?.items || []);
            } else {
                const items = guestCartStorage.updateItem(itemId, { quantity: newQuantity });
                setCartItems(items);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const updateSize = async (itemId, newSize, currentQuantity) => {
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
        try {
            if (isAuthenticated) {
                const res = await cartService.updateItem(itemId, { quantity: currentQuantity, size: newSize });
                setCartItems(res.data?.data?.items || res.data?.items || []);
            } else {
                const items = guestCartStorage.updateItem(itemId, { size: newSize });
                setCartItems(items);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const removeItem = async (itemId) => {
        setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
        try {
            if (isAuthenticated) {
                const res = await cartService.removeItem(itemId);
                setCartItems(res.data?.data?.items || res.data?.items || []);
            } else {
                const items = guestCartStorage.removeItem(itemId);
                setCartItems(items);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
        }
    };

    // Promotion Action Handler
    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            const res = await promotionService.validate(promoCode);
            const promo = res.data?.data || res.data;
            if (subtotal < promo.minOrderAmount) {
                setPromoError(`Đơn hàng tối thiểu ${formatCurrency(promo.minOrderAmount)} để sử dụng mã này.`);
                setAppliedPromo(null);
                sessionStorage.removeItem('applied_coupon');
            } else {
                setAppliedPromo(promo);
                sessionStorage.setItem('applied_coupon', JSON.stringify(promo));
            }
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            setAppliedPromo(null);
            sessionStorage.removeItem('applied_coupon');
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        setPromoCode('');
        sessionStorage.removeItem('applied_coupon');
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Apply discount
    const discount = appliedPromo 
        ? (appliedPromo.discountType === 'PERCENTAGE' 
            ? subtotal * (appliedPromo.discountValue / 100) 
            : appliedPromo.discountValue)
        : 0;

    const remainingSubtotal = Math.max(0, subtotal - discount);
    const tax = 0;
    const shipping = 0;
    const total = remainingSubtotal;

    if (loading) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center bg-background-light font-display">
                <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mt-4">Loading your bag...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center bg-background-light font-display">
                <div className="size-20 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Something went wrong</h2>
                <p className="text-gray-500 mb-8 max-w-md">{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); fetchCart(); }}
                    className="h-12 px-8 bg-primary text-background-dark text-xs uppercase font-black tracking-wider rounded-xl transition-all shadow-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center bg-background-light font-display">
                <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400">shopping_bag</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-4">Your Shopping Bag is Empty</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your bag yet. Let's get you set up with some premium seasonal drops.</p>
                <button
                    onClick={() => navigate('/home/catalog')}
                    className="h-12 px-8 bg-primary text-background-dark text-xs uppercase font-black tracking-wider rounded-xl transition-all shadow-md"
                >
                    Shop Trending Drops
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-12 bg-background-light font-display">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-10 leading-none tracking-tight">Shopping Bag</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    {/* Header Row (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-100 text-xs font-black text-gray-400 tracking-wider uppercase">
                        <div className="col-span-6">Product</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>

                    {/* Items */}
                    {cartItems.map(item => (
                        <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-gray-100 ${updatingItems[item.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Product Info */}
                            <div className="col-span-1 md:col-span-6 flex gap-6 items-start">
                                <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100 shadow-sm">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[40px] text-slate-300">checkroom</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-base font-bold text-gray-900 mb-1">
                                        {item.productName}
                                    </h3>
                                    <div className="text-xs text-gray-400 mb-4 flex items-center gap-2 flex-wrap">
                                        <span>Color: <span className="text-gray-900 font-bold">{item.colorName}</span></span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1.5">
                                            Size:
                                            {item.availableSizes && item.availableSizes.length > 1 ? (
                                                <select
                                                    value={item.size}
                                                    onChange={(e) => updateSize(item.id, e.target.value, item.quantity)}
                                                    className="border border-gray-200 rounded-lg px-2 py-0.5 text-xs font-bold text-gray-900 bg-white cursor-pointer hover:border-primary focus:outline-none"
                                                >
                                                    {item.availableSizes.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-gray-900 font-bold">{item.size}</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-auto hidden md:block">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Remove Item
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Info Wrapper */}
                            <div className="col-span-1 md:hidden flex items-center justify-between mt-4">
                                <span className="font-black text-lg">{formatCurrency(item.price)}</span>
                                <div className="flex items-center border border-gray-200 rounded-xl bg-white h-10 w-28 shadow-sm">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                                    <span className="flex-1 text-center font-bold text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">add</span></button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500"><span className="material-symbols-outlined">delete</span></button>
                            </div>

                            {/* Desktop Columns */}
                            <div className="hidden md:flex col-span-2 justify-center font-bold text-base text-gray-900">
                                {formatCurrency(item.price)}
                            </div>
                            <div className="hidden md:flex col-span-2 justify-center">
                                <div className="flex items-center border border-gray-200 rounded-xl bg-white h-11 w-28 shadow-sm">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">remove</span>
                                    </button>
                                    <span className="w-10 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-2 justify-end font-black text-lg text-emerald-600">
                                {formatCurrency(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}

                    {/* Continue Shopping */}
                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="flex items-center text-gray-400 hover:text-emerald-500 font-extrabold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
                            Continue Shopping
                        </button>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 sticky top-24 shadow-sm flex flex-col gap-6">
                        <h2 className="text-xl font-black text-gray-900 leading-none">Order Summary</h2>

                        {/* Promo Code Input Box */}
                        <div className="flex flex-col gap-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Coupon Code</span>
                            {appliedPromo ? (
                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-2.5 rounded-xl text-xs font-bold mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm">sell</span>
                                        {appliedPromo.code} Applied
                                    </span>
                                    <button onClick={handleRemovePromo} className="text-emerald-700 hover:text-rose-500 transition-colors">
                                        <span className="material-symbols-outlined text-sm font-black">close</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2 mt-1">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="SUMMER2026"
                                        className="flex-1 bg-white border border-gray-200 focus:border-primary/50 text-xs font-bold uppercase rounded-xl px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-gray-800"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoCode.trim()}
                                        className="px-4 py-2.5 bg-gray-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                                    >
                                        {promoLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                            {promoError && (
                                <p className="text-rose-500 text-[10px] font-bold mt-1 flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-xs">warning</span>
                                    {promoError}
                                </p>
                            )}
                        </div>

                        {/* Breakdown */}
                        <div className="flex flex-col gap-4 text-gray-400 text-xs font-semibold border-b border-gray-100 pb-6">
                            <div className="flex justify-between items-center">
                                <span>Bag Subtotal</span>
                                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
                            </div>
                            
                            {/* Discount row */}
                            {appliedPromo && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span>Discount ({appliedPromo.code})</span>
                                    <span className="font-black">-{formatCurrency(discount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span>Tax</span>
                                <span className="font-bold text-gray-900">{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                <span className="font-black text-emerald-500 uppercase text-[10px] tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Free</span>
                            </div>
                        </div>

                        {/* Total pricing */}
                        <div className="flex justify-between items-end">
                            <span className="text-base font-bold text-gray-900">Total</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tight">{formatCurrency(total)}</span>
                        </div>

                        {/* Checkout CTAs */}
                        <button
                            onClick={() => {
                                if (isAuthenticated) {
                                    navigate('/home/checkout');
                                } else {
                                    setShowLoginModal(true);
                                }
                            }}
                            className="w-full h-14 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mt-2">
                            <span className="material-symbols-outlined text-[16px] text-emerald-500">verified_user</span>
                            Secure encrypted checkout
                        </div>
                    </div>
                </div>
            </div>

            <LoginPromptModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLogin={() => navigate('/login', { state: { from: '/home/cart' } })}
            />
        </div>
    );
};

export default Cart;
