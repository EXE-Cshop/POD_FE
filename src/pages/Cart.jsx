import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';
import { useAuth } from '../components/AuthProvider';

const LoginPromptModal = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                    <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">account_circle</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Login Required</h3>
                    <p className="text-slate-500 mb-8">
                        Please sign in or create an account to proceed with your checkout. 
                        Your custom designs will be saved to your account automatically.
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
    const { user, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingItems, setUpdatingItems] = useState({});
    const [showLoginModal, setShowLoginModal] = useState(false);

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
            // Don't redirect automatically anymore, just show error or empty
            if (err.response?.status !== 401 && err.response?.status !== 403) {
                setError(err.message || 'Failed to fetch cart');
            } else {
                // If it was a 401 but we think we are authenticated, wait for refresh logic in api.js/AuthProvider
                setCartItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

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

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    if (loading) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center bg-background-light">
                <span className="material-symbols-outlined text-[48px] text-slate-300 animate-spin">progress_activity</span>
                <p className="text-slate-500 mt-4 font-bold">Loading your cart...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center bg-background-light">
                <div className="size-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[48px] text-red-300">error</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Something went wrong</h2>
                <p className="text-slate-500 mb-8 max-w-md">{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); fetchCart(); }}
                    className="h-12 px-8 bg-primary text-[#11221c] font-extrabold rounded-lg hover:bg-primary/90 transition-all shadow-md"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center bg-background-light">
                <div className="size-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">shopping_cart</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Let's get you set up with some premium custom gear.</p>
                <button
                    onClick={() => {
                        navigate('/home/catalog');
                    }}
                    className="h-12 px-8 bg-primary text-[#11221c] font-extrabold rounded-lg hover:bg-primary/90 transition-all shadow-md"
                >
                    Continue Design
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-10">Your Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items List */}
                <div className="w-full lg:w-2/3 flex flex-col gap-6">
                    {/* Header Row (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 text-sm font-bold text-slate-400 tracking-wider uppercase">
                        <div className="col-span-6">Product</div>
                        <div className="col-span-2 text-center">Price</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>

                    {/* Items */}
                    {cartItems.map(item => (
                        <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-slate-200 ${updatingItems[item.id] ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Product Info */}
                            <div className="col-span-1 md:col-span-6 flex gap-6 items-start">
                                <div className="w-24 h-32 md:w-32 md:h-40 bg-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-[40px] text-slate-300">checkroom</span>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                                        {item.productName}
                                    </h3>
                                    <div className="text-sm text-slate-500 mb-4 flex items-center gap-2 flex-wrap">
                                        <span>Màu: <span className="text-slate-900 font-medium">{item.colorName}</span></span>
                                        <span>|</span>
                                        <span className="flex items-center gap-1">
                                            Size:
                                            {item.availableSizes && item.availableSizes.length > 1 ? (
                                                <select
                                                    value={item.size}
                                                    onChange={(e) => updateSize(item.id, e.target.value, item.quantity)}
                                                    className="border border-slate-200 rounded-md px-2 py-1 text-sm font-bold text-slate-900 bg-white cursor-pointer hover:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    {item.availableSizes.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-slate-900 font-medium">{item.size}</span>
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-auto hidden md:block">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Info Wrapper */}
                            <div className="col-span-1 md:hidden flex items-center justify-between mt-4">
                                <span className="font-bold text-lg">${Number(item.price).toFixed(2)}</span>
                                <div className="flex items-center border border-slate-200 rounded-lg bg-white h-10 w-28">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                                    <span className="flex-1 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">add</span></button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                            </div>

                            {/* Desktop Columns */}
                            <div className="hidden md:flex col-span-2 justify-center font-bold text-lg text-slate-900">
                                ${Number(item.price).toFixed(2)}
                            </div>
                            <div className="hidden md:flex col-span-2 justify-center">
                                <div className="flex items-center border border-slate-200 rounded-lg bg-white h-12 w-32 shadow-sm">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">remove</span>
                                    </button>
                                    <input
                                        type="text"
                                        value={item.quantity}
                                        readOnly
                                        className="w-12 h-full text-center font-bold text-slate-900 outline-none"
                                    />
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-2 justify-end font-black text-xl text-primary">
                                ${Number(item.subtotal).toFixed(2)}
                            </div>
                        </div>
                    ))}

                    {/* Continue Design */}
                    <div className="mt-4">
                        <button
                            onClick={() => {
                                const raw = sessionStorage.getItem('pod_designer_draft');
                                let productId = sessionStorage.getItem('pod_tryon_product_id');
                                if (!productId && raw) { try { productId = JSON.parse(raw)?.productId; } catch {} }
                                navigate(productId ? `/design/${productId}` : '/design');
                            }}
                            className="flex items-center text-slate-500 hover:text-primary font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
                            Continue Design
                        </button>
                    </div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 sticky top-24">
                        <h2 className="text-2xl font-black text-slate-900 mb-6">Order Summary</h2>

                        <div className="flex flex-col gap-4 text-slate-600 mb-8 pb-8 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Estimated Tax (8%)</span>
                                <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                            {shipping === 0 ? (
                                <span className="font-bold text-primary uppercase text-xs tracking-wider bg-primary/10 px-2 py-1 rounded">Free</span>
                            ) : (
                                <span className="font-bold text-slate-900">${shipping.toFixed(2)}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-8">
                        <span className="text-xl font-bold text-slate-900">Total</span>
                        <span className="text-4xl font-black text-slate-900">${total.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={() => {
                            if (isAuthenticated) {
                                navigate('/home/checkout');
                            } else {
                                setShowLoginModal(true);
                            }
                        }}
                        className="w-full h-14 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform mb-4 flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <span className="material-symbols-outlined text-[16px]">verified_user</span>
                        Secure encrypted checkout
                    </div>
                </div>
            </div>

            <LoginPromptModal 
                isOpen={showLoginModal} 
                onClose={() => setShowLoginModal(false)}
                onLogin={() => navigate('/login', { state: { from: '/home/cart' } })}
            />
        </div>
    </div>
    );
};

export default Cart;
