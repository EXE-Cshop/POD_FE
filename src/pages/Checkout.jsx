import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [shippingAddress, setShippingAddress] = useState('');
    const [addressFields, setAddressFields] = useState({
        firstName: '', lastName: '', street: '', apt: '', city: '', state: '', zip: '',
    });
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [note, setNote] = useState('');

    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
        };
    };

    useEffect(() => {
        const fetchCart = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/home/login');
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/cart`, {
                    headers: getAuthHeaders(),
                });
                if (response.status === 401 || response.status === 403) {
                    navigate('/home/login');
                    return;
                }
                if (!response.ok) throw new Error('Failed to load cart');
                const result = await response.json();
                const items = result.data?.items || [];
                if (items.length === 0) {
                    navigate('/home/cart');
                    return;
                }
                setCartItems(items);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const buildShippingAddress = () => {
        const { street, apt, city, state, zip } = addressFields;
        const parts = [street, apt, city, state, zip].filter(Boolean);
        return parts.join(', ');
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const fullAddress = buildShippingAddress();

        try {
            const response = await fetch(`${API_BASE_URL}/api/checkout`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    shippingAddress: fullAddress,
                    paymentMethod,
                    note: note || undefined,
                }),
            });

            if (response.status === 401) {
                navigate('/home/login');
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Checkout failed');
            }

            const result = await response.json();
            localStorage.setItem('lastOrder', JSON.stringify(result.data));
            navigate('/home/order-success');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    if (loading) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center bg-background-light">
                <span className="material-symbols-outlined text-[48px] text-slate-300 animate-spin">progress_activity</span>
                <p className="text-slate-500 mt-4 font-bold">Preparing checkout...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Main Checkout Form Area */}
                <div className="w-full lg:w-2/3">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Secure Checkout</h1>
                        {/* Progress Tracker */}
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <span className={step >= 1 ? "text-primary flex items-center gap-2" : "text-slate-400 flex items-center gap-2"}>
                                <div className={`size-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-primary text-[#11221c]' : 'bg-slate-200 text-slate-500'}`}>1</div>
                                Shipping
                            </span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className={step >= 2 ? "text-primary flex items-center gap-2" : "text-slate-400 flex items-center gap-2"}>
                                <div className={`size-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-primary text-[#11221c]' : 'bg-slate-200 text-slate-500'}`}>2</div>
                                Payment
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm font-medium">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="space-y-10">
                        {/* Step 1: Contact & Shipping */}
                        <div className={`space-y-6 ${step !== 1 && 'opacity-50 pointer-events-none'}`}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900">Contact Information</h2>
                                {step === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-primary font-bold text-sm hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 pt-6">Shipping Address</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFields.firstName}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFields.lastName}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFields.street}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, street: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="123 Main St"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Apartment, suite, etc. (optional)</label>
                                    <input
                                        type="text"
                                        value={addressFields.apt}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, apt: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Apt 4B"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressFields.city}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                                        <select
                                            required
                                            value={addressFields.state}
                                            onChange={(e) => setAddressFields(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white"
                                        >
                                            <option value="">Select...</option>
                                            <option value="CA">CA</option>
                                            <option value="NY">NY</option>
                                            <option value="TX">TX</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">ZIP Code</label>
                                        <input
                                            type="text"
                                            required
                                            value={addressFields.zip}
                                            onChange={(e) => setAddressFields(prev => ({ ...prev, zip: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {step === 1 && (
                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full md:w-auto h-14 px-10 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div className="space-y-6 pt-6 border-t border-slate-200 animate-fade-in">
                                <h2 className="text-2xl font-black text-slate-900">Payment Method</h2>
                                <p className="text-slate-500 text-sm mb-4">Select your preferred payment method.</p>

                                <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                                    {/* COD Option */}
                                    <div
                                        className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" id="cod" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="cod" className="font-bold text-slate-900 flex-1 cursor-pointer">Cash on Delivery (COD)</label>
                                            <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                                        </div>
                                    </div>

                                    {/* Banking Option */}
                                    <div
                                        className={`p-4 border-b border-slate-200 cursor-pointer transition-colors ${paymentMethod === 'BANKING' ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('BANKING')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" id="banking" name="payment" checked={paymentMethod === 'BANKING'} onChange={() => setPaymentMethod('BANKING')} className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="banking" className="font-bold text-slate-900 flex-1 cursor-pointer">Bank Transfer</label>
                                            <span className="material-symbols-outlined text-slate-400">account_balance</span>
                                        </div>
                                    </div>

                                    {/* Wallet Option */}
                                    <div
                                        className={`p-4 cursor-pointer transition-colors ${paymentMethod === 'WALLET' ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('WALLET')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" id="wallet" name="payment" checked={paymentMethod === 'WALLET'} onChange={() => setPaymentMethod('WALLET')} className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="wallet" className="font-bold text-slate-900 flex-1 cursor-pointer">E-Wallet</label>
                                            <span className="material-symbols-outlined text-slate-400">account_balance_wallet</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Note */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Order Note (optional)</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400 resize-none"
                                        placeholder="Any special instructions for your order..."
                                    />
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full h-16 bg-primary text-[#11221c] rounded-lg font-black text-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,200,100,0.3)] hover:shadow-[0_0_30px_rgba(20,200,100,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined">lock</span>
                                                Place Order — ${total.toFixed(2)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Vertical Separator (Desktop) */}
                <div className="hidden lg:block w-px bg-slate-200"></div>

                {/* Simple Order Summary */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-200 sticky top-24">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>

                        {/* Cart Items Summary */}
                        <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 border border-slate-300 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">checkroom</span>
                                        <span className="absolute -top-2 -right-2 size-5 bg-slate-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.productName}</h4>
                                        <p className="text-xs text-slate-500">{item.colorName} / {item.size}</p>
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">${Number(item.subtotal).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 text-slate-600 mb-6 pb-6 border-b border-slate-200 text-sm">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Estimated Tax</span>
                                <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                {shipping === 0 ? (
                                    <span className="font-bold text-primary uppercase text-[10px] tracking-wider bg-primary/10 px-2 py-0.5 rounded">Free</span>
                                ) : (
                                    <span className="font-bold text-slate-900">${shipping.toFixed(2)}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-end mb-6">
                            <span className="text-lg font-bold text-slate-900">Total</span>
                            <span className="text-3xl font-black text-slate-900">${total.toFixed(2)}</span>
                        </div>

                        {/* Trust Badges */}
                        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">verified</span>
                                <span>Secure 256-bit encryption</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">local_shipping</span>
                                <span>Free shipping on orders over $50</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <span className="material-symbols-outlined text-green-500 text-[18px]">workspace_premium</span>
                                <span>100% Quality Guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
