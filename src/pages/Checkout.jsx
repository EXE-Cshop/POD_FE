import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cartService, orderService, promotionService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [addressFields, setAddressFields] = useState({
        firstName: '', lastName: '', street: '', apt: '', city: '', state: '', zip: '',
    });
    const [email, setEmail] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [note, setNote] = useState('');

    // Promotion states
    const [appliedPromo, setAppliedPromo] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await cartService.get();
                const items = res.data?.data?.items || res.data?.items || [];
                if (items.length === 0) {
                    navigate('/home/cart');
                    return;
                }
                setCartItems(items);
            } catch (err) {
                if (err.response?.status === 401 || err.response?.status === 403) {
                    navigate('/login', { state: { from: location } });
                } else {
                    setError(err.message);
                }
            } finally {
                setLoading(false);
            }
        };

        // Load applied coupon from sessionStorage
        const savedCoupon = sessionStorage.getItem('applied_coupon');
        if (savedCoupon) {
            try {
                setAppliedPromo(JSON.parse(savedCoupon));
            } catch (e) {
                sessionStorage.removeItem('applied_coupon');
            }
        }

        fetchCart();
    }, [navigate, location]);

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            const res = await promotionService.validate(promoCode);
            const promo = res.data?.data || res.data;
            if (subtotal < promo.minOrderAmount) {
                setPromoError(`Mã giảm giá yêu cầu đơn hàng tối thiểu ${formatCurrency(promo.minOrderAmount)}`);
                setAppliedPromo(null);
            } else {
                setAppliedPromo(promo);
                sessionStorage.setItem('applied_coupon', JSON.stringify(promo));
                setPromoCode('');
            }
        } catch (err) {
            setPromoError(err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            setAppliedPromo(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const handleRemovePromo = () => {
        setAppliedPromo(null);
        sessionStorage.removeItem('applied_coupon');
    };

    const buildShippingAddress = () => {
        const { firstName, lastName, street, apt, city, state, zip } = addressFields;
        const fullName = `${firstName} ${lastName}`.trim();
        const addressParts = [street, apt, city, state, zip].filter(Boolean);
        return `${fullName} | ${addressParts.join(', ')}`;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const fullAddress = buildShippingAddress();

        try {
            const res = await orderService.checkout({
                shippingAddress: fullAddress,
                paymentMethod,
                note: note || undefined,
                promotionCode: appliedPromo?.code || undefined,
            });
            const orderData = res.data?.data || res.data;
            if (orderData) {
                localStorage.setItem('lastOrder', JSON.stringify(orderData));
            }
            // Clear checkout promo
            sessionStorage.removeItem('applied_coupon');
            navigate('/home/order-success', { state: { order: orderData } });
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else {
                setError(err.response?.data?.message || err.message || 'Thanh toán thất bại. Vui lòng thử lại.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || item.price * item.quantity), 0);

    // Calculate discount
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.discountType === 'PERCENTAGE') {
            discount = subtotal * (Number(appliedPromo.discountValue) / 100);
        } else if (appliedPromo.discountType === 'FIXED_AMOUNT') {
            discount = Number(appliedPromo.discountValue);
        }
        discount = Math.min(discount, subtotal);
    }

    const discountedSubtotal = subtotal - discount;
    const tax = 0;
    const shipping = 0;
    const total = discountedSubtotal;

    if (loading) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center bg-background-light min-h-[60vh] font-display">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin">progress_activity</span>
                <p className="text-slate-500 mt-4 font-bold text-sm tracking-wide uppercase">Preparing checkout...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light font-display">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Main Checkout Form Area */}
                <div className="w-full lg:w-2/3">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">SECURE CHECKOUT</h1>
                        {/* Progress Tracker */}
                        <div className="flex items-center gap-4 text-xs font-black uppercase tracking-wider">
                            <span className={step >= 1 ? "text-primary flex items-center gap-2" : "text-slate-400 flex items-center gap-2"}>
                                <div className={`size-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 1 ? 'bg-primary text-[#11221c]' : 'bg-slate-200 text-slate-500'}`}>1</div>
                                Shipping
                            </span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className={step >= 2 ? "text-primary flex items-center gap-2" : "text-slate-400 flex items-center gap-2"}>
                                <div className={`size-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${step >= 2 ? 'bg-primary text-[#11221c]' : 'bg-slate-200 text-slate-500'}`}>2</div>
                                Payment
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-sm font-bold">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePlaceOrder} className="space-y-10">
                        {/* Step 1: Contact & Shipping */}
                        <div className={`space-y-6 transition-all duration-300 ${step !== 1 ? 'opacity-40 pointer-events-none' : ''}`}>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Contact Information</h2>
                                {step === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-primary font-black text-xs uppercase tracking-wider hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                                    <input
                                        id="checkout-email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-400 font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight pt-6">Shipping Address</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">First Name</label>
                                    <input
                                        id="checkout-first-name"
                                        type="text"
                                        required
                                        value={addressFields.firstName}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, firstName: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Last Name</label>
                                    <input
                                        id="checkout-last-name"
                                        type="text"
                                        required
                                        value={addressFields.lastName}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, lastName: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                                    <input
                                        id="checkout-street"
                                        type="text"
                                        required
                                        value={addressFields.street}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, street: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                        placeholder="123 Street Name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Apartment, suite, etc. (optional)</label>
                                    <input
                                        id="checkout-apt"
                                        type="text"
                                        value={addressFields.apt}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, apt: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                        placeholder="Apt, Suite, Room (e.g. Suite 4B)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">City</label>
                                    <input
                                        id="checkout-city"
                                        type="text"
                                        required
                                        value={addressFields.city}
                                        onChange={(e) => setAddressFields(prev => ({ ...prev, city: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">State</label>
                                        <select
                                            id="checkout-state"
                                            required
                                            value={addressFields.state}
                                            onChange={(e) => setAddressFields(prev => ({ ...prev, state: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="CA">California (CA)</option>
                                            <option value="NY">New York (NY)</option>
                                            <option value="TX">Texas (TX)</option>
                                            <option value="WA">Washington (WA)</option>
                                            <option value="OR">Oregon (OR)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">ZIP Code</label>
                                        <input
                                            id="checkout-zip"
                                            type="text"
                                            required
                                            value={addressFields.zip}
                                            onChange={(e) => setAddressFields(prev => ({ ...prev, zip: e.target.value }))}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {step === 1 && (
                                <div className="pt-4">
                                    <button
                                        id="checkout-continue-button"
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="h-12 px-8 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div className="space-y-6 pt-6 border-t border-slate-200 animate-fade-in">
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment Method</h2>
                                <p className="text-slate-500 text-sm mb-4">Select your preferred payment option.</p>

                                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                                    {/* COD Option */}
                                    <div
                                        className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('COD')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" id="cod" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="cod" className="font-bold text-slate-900 flex-1 cursor-pointer text-sm">Cash on Delivery (COD)</label>
                                            <span className="material-symbols-outlined text-slate-400">local_shipping</span>
                                        </div>
                                    </div>

                                    {/* Banking Option */}
                                    <div
                                        className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${paymentMethod === 'BANKING' ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                        onClick={() => setPaymentMethod('BANKING')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input type="radio" id="banking" name="payment" checked={paymentMethod === 'BANKING'} onChange={() => setPaymentMethod('BANKING')} className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="banking" className="font-bold text-slate-900 flex-1 cursor-pointer text-sm">Bank Transfer</label>
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
                                            <label htmlFor="wallet" className="font-bold text-slate-900 flex-1 cursor-pointer text-sm">E-Wallet</label>
                                            <span className="material-symbols-outlined text-slate-400">account_balance_wallet</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Note */}
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Order Note (optional)</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-primary/50 outline-none transition-all placeholder:text-slate-400 font-bold text-sm text-slate-800 focus:ring-4 focus:ring-primary/10 resize-none"
                                        placeholder="Any special instructions or comments regarding your shipment..."
                                    />
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="h-14 px-8 border border-slate-200 text-slate-600 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 h-14 bg-gray-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[16px]">lock</span>
                                                Place Order - {formatCurrency(total)}
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
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-24 flex flex-col gap-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Order Summary</h2>

                        {/* Cart Items Summary */}
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                                    <div className="relative w-16 h-20 bg-white border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-sm">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-400 text-[20px]">checkroom</span>
                                        )}
                                        <span className="absolute -top-1 -right-1 size-5 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm">
                                            {item.quantity}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{item.productName}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">{item.colorName} / {item.size}</p>
                                    </div>
                                    <div className="text-sm font-black text-slate-900 shrink-0">{formatCurrency(item.subtotal || item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Promo / Discount Coupon Section */}
                        <div className="border-t border-slate-100 pt-6">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Discount Coupon</label>
                            
                            {appliedPromo ? (
                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-2.5 rounded-xl text-xs font-bold">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px]">sell</span>
                                        <span>{appliedPromo.code} Applied</span>
                                        <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black">
                                            {appliedPromo.discountType === 'PERCENTAGE' ? `-${appliedPromo.discountValue}%` : `-${formatCurrency(appliedPromo.discountValue)}`}
                                        </span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={handleRemovePromo} 
                                        className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-black text-xs uppercase"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="PROMO CODE" 
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        className="flex-grow bg-white border border-slate-200 focus:border-primary/50 text-xs font-black uppercase rounded-xl px-3 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-800 placeholder:text-slate-400"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleApplyPromo}
                                        disabled={promoLoading || !promoCode.trim()}
                                        className="px-4 py-2.5 bg-gray-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                                    >
                                        Apply
                                    </button>
                                </div>
                            )}

                            {promoError && (
                                <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">error</span>
                                    {promoError}
                                </p>
                            )}
                        </div>

                        {/* Order Calculations */}
                        <div className="border-t border-slate-100 pt-6 flex flex-col gap-3 text-xs font-bold text-slate-500">
                            <div className="flex justify-between items-center">
                                <span>Subtotal</span>
                                <span className="font-black text-slate-900">{formatCurrency(subtotal)}</span>
                            </div>
                            
                            {discount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span>Discount</span>
                                    <span className="font-black">-{formatCurrency(discount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span>Tax</span>
                                <span className="font-black text-slate-900">{formatCurrency(tax)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                                <span>Shipping</span>
                                <span className="font-black text-primary uppercase text-[10px] tracking-wider bg-primary/10 px-2 py-0.5 rounded">Free</span>
                            </div>
                        </div>

                        {/* Final Total */}
                        <div className="border-t border-slate-100 pt-6 flex justify-between items-end">
                            <span className="text-sm font-black text-slate-900 uppercase tracking-wide">Total</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(total)}</span>
                        </div>

                        {/* Trust Badges */}
                        <div className="p-4 bg-slate-50 rounded-2xl space-y-3 mt-2 border border-slate-100">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-emerald-500 text-[16px]">verified</span>
                                <span>Secure 256-bit encryption</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-emerald-500 text-[16px]">local_shipping</span>
                                <span>Free shipping for all orders</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-emerald-500 text-[16px]">workspace_premium</span>
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
