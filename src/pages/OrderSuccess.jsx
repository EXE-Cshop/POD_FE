import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const savedOrder = localStorage.getItem('lastOrder');
        if (savedOrder) {
            try {
                setOrder(JSON.parse(savedOrder));
            } catch { /* ignore parse errors */ }
            localStorage.removeItem('lastOrder');
        }
    }, []);

    const orderNumber = order?.id ? `ORD-${String(order.id).padStart(4, '0')}` : `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getEstimatedDelivery = () => {
        const start = new Date();
        start.setDate(start.getDate() + 5);
        const end = new Date();
        end.setDate(end.getDate() + 8);
        const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${fmt(start)} - ${fmt(end)}, ${end.getFullYear()}`;
    };

    return (
        <div className="flex-1 w-full min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-12 text-center bg-background-light">
            <div className="animate-fade-in-up flex flex-col items-center max-w-xl mx-auto">

                {/* Success Icon */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse-slow"></div>
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(20,200,100,0.4)]">
                        <span className="material-symbols-outlined text-[48px] text-[#11221c]">done</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Order Confirmed!</h1>

                <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
                    Thank you for your purchase. We've received your order and we are getting it ready to be shipped.
                </p>

                {/* Order Details Card */}
                <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-10 shadow-sm text-left">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Order Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Order Number</span>
                            <span className="text-lg font-black text-slate-900">{orderNumber}</span>
                        </div>
                        <div>
                            <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</span>
                            <span className="text-lg font-bold text-slate-700">{getEstimatedDelivery()}</span>
                        </div>
                        {order?.totalAmount && (
                            <div>
                                <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                                <span className="text-lg font-black text-primary">${Number(order.totalAmount).toFixed(2)}</span>
                            </div>
                        )}
                        {order?.paymentMethod && (
                            <div>
                                <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method</span>
                                <span className="text-lg font-bold text-slate-700">{order.paymentMethod}</span>
                            </div>
                        )}
                        {order?.shippingAddress && (
                            <div className="md:col-span-2">
                                <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Shipping Address</span>
                                <span className="text-lg font-bold text-slate-700">{order.shippingAddress}</span>
                            </div>
                        )}
                        {order?.status && (
                            <div>
                                <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Status</span>
                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full">{order.status}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Steps List */}
                <div className="w-full text-left space-y-4 mb-12">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">What's Next?</h3>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-primary text-[18px]">receipt</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Order Receipt</h4>
                            <p className="text-sm text-slate-500 mt-1">We've just sent a detailed receipt to your email address.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-primary text-[18px]">inventory_2</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Printing & Packing</h4>
                            <p className="text-sm text-slate-500 mt-1">Our team is preparing your custom items. This usually takes 1-2 business days.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <button
                        onClick={() => navigate('/home/my-orders')}
                        className="flex-1 h-16 bg-slate-900 text-white rounded-lg font-black text-lg hover:bg-slate-800 transition-all shadow-lg hover:-translate-y-1 transform"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/home/catalog')}
                        className="flex-1 h-16 bg-white text-slate-900 rounded-lg font-bold text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
                    >
                        Continue Shopping
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
