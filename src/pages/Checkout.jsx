import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cartService, orderService, giftService } from '../services/api';
import GiftUpgradeModal from '../components/GiftUpgradeModal';

const Checkout = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const step = parseInt(searchParams.get('step') || '1', 10);

    const setStep = (newStep) => {
        setSearchParams({ step: newStep });
    };

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

    // QR Gift Features (Enhanced from Stitch)
    const [isGift, setIsGift] = useState(false);
    const [giftStep, setGiftStep] = useState(1);
    const [recipientName, setRecipientName] = useState('');
    const [giftMessage, setGiftMessage] = useState('');
    const [selectedTheme, setSelectedTheme] = useState('Modern Minimal');
    const [giftFile, setGiftFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [photoUrl, setPhotoUrl] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);

    const THEMES = [
        { name: 'Modern Minimal', color: '#13b9a5', type: 'minimal' },
        { name: 'Festive Floral', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxTzthpeKldR46pYXu-UVgOtUoYd5QLWu8pfhni27z7W3VcQTVlboxHgfo0NtsgSL7cAuxXUblaOiwh8W3wmjI4yOgKbQXu4Fz-48nAx13_jFTcXthqPS0CzaFAEBZoyn5cb-IBs2Kl6cxjJwLyN0gN5LCnQWoai5pyYASrL8xCtUdnf4FrnesVwSCXR27HZtpYcyneFcCMdWrpbgOU0cIHkrGP23yXPIAaLwn4zHIR10OgQG03vC6bMMdjd42I4cg5ulmALs8vA' },
        { name: 'Ocean Breeze', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu3AASf9IglX9y4YK5gGU-vyQXHPyvrz0BBVmHejl4K40-F5t-2hpJ8Nj-79V3VBjLbosS1YJLN_kaTO81g17NKv44ORaoW9uxq7_sKTv8VK12ZasPfGKmif88cvt99cdINUK3UXWq7TNFAS-6Bn9WitZ5OMYj5UFNipYWE_UATcF58hIwqNnZINnsM8Ub5bR4RgWU3fZSt81jgMn2q01T0tK8bWpAeARJZQXxAtYIoT1Nayf01PQz83s7C_5gS_xvZoumdUYoEA' },
        { name: 'Gold Geometric', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj3G3EZCeurThYDIbCzwn3YcWMjRF6GJp-xqJNqrH99cPw_Zl56HyD6OmzbqhGUbsFERNuCMIB5cb8ziKTAhMsS_Ya9KSV3BChNBom7kgci8qSbN4YADakuUwDLfBqb5OHTXo8UT_xen189q5WS8RZQgp67aLaVTGr9zN6_qBnhXNKiLjk-HW0mhoCMiHOKZmBucPnhnHZC8K0x7li1dvC-pvkad56HRIp-6Xf_g9CEsTR2jy4_ON6fZPNMwPG45rg0V7zvdgIfw' },
        { name: 'Artist Soul', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm6h4lgS_yTJGtSxxsfg8iCYbJy-hKPsnKs1mBY8vEoNk8JNU3xvI_zmC-0jyNTrSx1VfWEdDiipJyTD8rosjWqyOcF9iHqw1qwfQwGQVFdbsaTKHasjhGG6gc695Y9hc1HjZ-tRU-w5Z9evrRb-3prsDonIibNxpuq_DKNvXDP1G7yqgejBtjOkAXVI5nQkpRz-VVh5GIKxu5k_X2f8ygH8iMYbJcRaJrTzv-EjdXOxpgtfnpFsPEMh3lpnAoqle6mUwOdKSg3Q' }
    ];

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
        fetchCart();
    }, []);

    // Auto-scroll to top on step change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

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
            const res = await orderService.checkout({
                shippingAddress: fullAddress,
                paymentMethod,
                note: note || undefined,
            });
            const orderData = res.data?.data || res.data;
            
            // If it's a gift, create the gift record linked to this order
            if (isGift && orderData?.id) {
                try {
                    await giftService.create({
                        orderId: orderData.id,
                        recipientName: recipientName,
                        messageText: giftMessage,
                        themeName: selectedTheme,
                        photoUrl: photoUrl,
                        videoUrl: videoUrl
                    });
                } catch (giftErr) {
                    console.error('Failed to create gift record:', giftErr);
                    // We don't block the whole checkout if only the gift record fails, 
                    // but we might want to log it or warn the user.
                }
            }

            if (orderData) localStorage.setItem('lastOrder', JSON.stringify(orderData));
            navigate('/home/order-success');
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
            else setError(err.response?.data?.message || err.message || 'Checkout failed');
        } finally {
            setSubmitting(false);
        }
    };

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const giftFee = isGift ? 30000 / 25000 : 0; // Converting to USD mockly or just keeping it consistent
    const total = subtotal + tax + shipping + giftFee;

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
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900">Contact Information</h2>
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

                                {/* QR Gift Upsell Section - Premium Banner & Modal Trigger */}
                                <div className="pt-8 border-t border-slate-200">
                                    <div 
                                        className={`group relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer shadow-sm hover:shadow-xl ${isGift ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-primary/30'}`}
                                        onClick={() => setShowGiftModal(true)}
                                    >
                                        <div className="flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className={`size-16 rounded-2xl flex items-center justify-center transition-all rotate-3 group-hover:rotate-0 ${isGift ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <span className="material-symbols-outlined text-4xl">{isGift ? 'verified' : 'featured_seasonal'}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-black text-2xl text-slate-900">
                                                            {isGift ? 'Quà tặng đã được nâng cấp' : 'Nâng cấp Quà tặng'}
                                                        </h3>
                                                        <span className="text-[10px] bg-slate-900 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Premium</span>
                                                    </div>
                                                    <p className="text-slate-500 leading-tight max-w-md">
                                                        {isGift 
                                                            ? `Đã thiết lập thiệp "${selectedTheme}" ${photoUrl ? 'với ảnh riêng' : ''} ${videoUrl ? 'và video nhắn gửi' : ''} dành cho ${recipientName || 'người nhận'}.`
                                                            : 'Tạo trải nghiệm mở quà kỹ thuật số với thiệp QR độc quyền, video chúc mừng và chủ đề thiết kế riêng.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {!isGift ? (
                                                    <>
                                                        <div className="text-2xl font-black text-slate-900">+30,000đ</div>
                                                        <div className="px-6 py-2 bg-primary text-white text-xs font-black rounded-full shadow-lg shadow-primary/20">THÊM NGAY</div>
                                                    </>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col items-end mr-2">
                                                            {photoUrl && <span className="text-[10px] font-black text-primary uppercase">Ảnh riêng ✓</span>}
                                                            {videoUrl && <span className="text-[10px] font-black text-primary uppercase">Video ✓</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setIsGift(false); }}
                                                                className="text-slate-400 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-colors"
                                                            >
                                                                Hủy bỏ
                                                            </button>
                                                            <div className="px-6 py-2 bg-slate-900 text-white text-xs font-black rounded-full shadow-lg">CHỈNH SỬA</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full md:w-auto h-14 px-10 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Gift Upgrade Modal */}
                        <GiftUpgradeModal 
                            isOpen={showGiftModal}
                            onClose={() => setShowGiftModal(false)}
                            onApply={(data) => {
                                setIsGift(true);
                                setRecipientName(data.recipientName);
                                setGiftMessage(data.giftMessage);
                                setSelectedTheme(data.selectedTheme);
                                setPhotoUrl(data.photoUrl);
                                setVideoUrl(data.videoUrl);
                            }}
                            initialData={{
                                recipientName,
                                giftMessage,
                                selectedTheme,
                                photoUrl,
                                videoUrl,
                                isGift
                            }}
                        />

                        {/* QR PREVIEW MODAL */}
                        {showQrModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-xl p-4 animate-fade-in" onClick={() => setShowQrModal(false)}>
                                <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 flex flex-col items-center text-center shadow-2xl scale-100 transition-all" onClick={(e) => e.stopPropagation()}>
                                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        <span className="material-symbols-outlined text-4xl">contactless</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Quét thử mã QR</h3>
                                    <p className="text-slate-500 text-xs mb-8">Dùng điện thoại quét mã dưới đây để xem trước trải nghiệm thiệp chúc mừng điện tử.</p>
                                    
                                    <div className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-8">
                                        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl"></div>
                                        
                                        <img 
                                            src={`https://quickchart.io/qr?text=${encodeURIComponent('https://c-shop.vn/gift/demo')}&size=200&light=ffffff&dark=000000`} 
                                            alt="Preview QR Code"
                                            className="w-40 h-40 object-contain relative z-20"
                                        />
                                    </div>

                                    <button 
                                        onClick={() => setShowQrModal(false)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-primary transition-all shadow-xl"
                                    >
                                        Tôi đã quét xong
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900">Payment Method</h2>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-primary font-bold text-sm hover:underline flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                        Back to Shipping
                                    </button>
                                </div>
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
