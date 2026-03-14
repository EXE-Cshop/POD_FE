import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService, orderService } from '../services/api';

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

    // QR Gift Features
    const [isGift, setIsGift] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [giftFile, setGiftFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);

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

                        {/* QR Gift Upsell Section - Redesigned */}
                        <div className="pt-8 border-t border-slate-200">
                            <div 
                                className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isGift ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10' : 'border-slate-200 bg-white hover:border-primary/30'}`}
                                onClick={() => setIsGift(!isGift)}
                            >
                                {/* Background Accent */}
                                {isGift && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] -mr-16 -mt-16 rounded-full animate-pulse"></div>
                                )}
                                
                                <div className="relative z-10 flex items-start justify-between gap-4 cursor-pointer">
                                    <div className="flex items-center gap-5">
                                        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${isGift ? 'bg-primary text-[#11221c] rotate-6' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                                            <span className="material-symbols-outlined text-3xl font-variation-fill">qr_code_2</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-xl text-slate-900">Nâng cấp Quà tặng</h3>
                                                <span className="text-[10px] bg-[#11221c] text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Premium</span>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-tight max-w-md">Kèm thiệp in mã QR bí mật. Người nhận quét để mở video/audio chúc mừng đầy cảm xúc.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="text-xl font-black text-slate-900">+30,000đ</div>
                                        <div className={`size-7 rounded-full border-2 flex items-center justify-center transition-all ${isGift ? 'border-primary bg-primary text-[#11221c]' : 'border-slate-300 bg-white'}`}>
                                            {isGift && <span className="material-symbols-outlined text-lg font-bold">check</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Gift Form */}
                                {isGift && (
                                    <div className="mt-8 space-y-6 pt-8 border-t border-primary/20 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                                        {/* File Upload Area */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Upload Video hoặc Audio chúc mừng</label>
                                            <div className="relative group">
                                                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 transition-all hover:border-primary/50 flex flex-col items-center justify-center bg-white cursor-pointer overflow-hidden">
                                                    {previewUrl ? (
                                                        <div className="w-full max-w-xs space-y-3">
                                                            <video src={previewUrl} className="w-full aspect-video rounded-lg object-cover bg-black" />
                                                            <button 
                                                                onClick={() => {setPreviewUrl(null); setGiftFile(null);}}
                                                                className="w-full py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
                                                            >
                                                                Xóa file và chọn lại
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-primary transition-colors">cloud_upload</span>
                                                            <p className="text-sm font-bold text-slate-600 mt-2">Kéo thả hoặc Click để tải lên</p>
                                                            <p className="text-[10px] text-slate-400 mt-1">MP4, MOV, MP3 (Tối đa 50MB)</p>
                                                        </>
                                                    )}
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                setGiftFile(file);
                                                                setPreviewUrl(URL.createObjectURL(file));
                                                                // Simulate Upload
                                                                setIsUploading(true);
                                                                setUploadProgress(0);
                                                                const interval = setInterval(() => {
                                                                    setUploadProgress(prev => {
                                                                        if (prev >= 100) { clearInterval(interval); setIsUploading(false); return 100; }
                                                                        return prev + 10;
                                                                    });
                                                                }, 200);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                
                                                {/* Progress Bar Overlay */}
                                                {isUploading && (
                                                    <div className="absolute inset-x-0 -bottom-1">
                                                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Message Textbox */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-bold text-slate-700">Thông điệp ý nghĩa</label>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{giftMessage.length}/200 ký tự</span>
                                            </div>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none h-24 text-sm"
                                                placeholder="Nhập lời nhắn gửi đến người yêu thương..."
                                                maxLength={200}
                                                value={giftMessage}
                                                onChange={(e) => setGiftMessage(e.target.value)}
                                            />
                                        </div>

                                        <button 
                                            type="button"
                                            className="w-full py-4 bg-[#11221c] text-white rounded-2xl font-black text-sm hover:brightness-125 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                                            onClick={() => setShowQrModal(true)}
                                            disabled={!giftMessage && !giftFile}
                                        >
                                            <span className="material-symbols-outlined text-lg text-primary">qr_code</span>
                                            Xem trước mã QR quà tặng
                                        </button>
                                        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mã QR này sẽ được in trực tiếp lên thiệp vật lý</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* QR PREVIEW MODAL */}
                        {showQrModal && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#11221c]/90 backdrop-blur-xl p-4 animate-fade-in" onClick={() => setShowQrModal(false)}>
                                <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 flex flex-col items-center text-center shadow-2xl scale-100 transition-transform" onClick={(e) => e.stopPropagation()}>
                                    <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                        <span className="material-symbols-outlined text-4xl">contactless</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Quét thử mã QR</h3>
                                    <p className="text-slate-500 text-sm mb-8">Dùng điện thoại quét mã dưới đây để xem trước trải nghiệm thiệp chúc mừng điện tử.</p>
                                    
                                    <div className="relative p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 mb-6">
                                        {/* Corner Accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary -ml-1 -mt-1 rounded-tl-xl"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary -mr-1 -mt-1 rounded-tr-xl"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary -ml-1 -mb-1 rounded-bl-xl"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary -mr-1 -mb-1 rounded-br-xl"></div>
                                        
                                        <img 
                                            src={`https://quickchart.io/qr?text=${encodeURIComponent('https://c-shop.vn/gift/demo-emotional-card')}&size=300&light=ffffff&dark=000000`} 
                                            alt="Preview QR Code"
                                            className="w-48 h-48 object-contain relative z-20"
                                        />
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-8">
                                        <p className="text-[10px] text-amber-700 font-bold leading-tight">
                                            💡 MẸO: Để quét thử chính xác trang web đang chạy trên máy bạn, hãy đổi 'localhost' thành địa chỉ IP local (VD: 192.168.1.x) hoặc dùng ngrok.
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setShowQrModal(false)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all"
                                    >
                                        Đóng lại
                                    </button>
                                </div>
                            </div>
                        )}

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
