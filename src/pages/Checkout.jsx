import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Mock cart summary
    const subtotal = 60.00;
    const tax = 4.80;
    const shipping = 0.00; // Free over $50
    const total = subtotal + tax + shipping;

    const handlePlaceOrder = (e) => {
        e.preventDefault();
        // Simulate API call for payment processing
        setTimeout(() => {
            navigate('/home/order-success');
        }, 1500);
    };

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
                                    <input type="email" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-slate-400" placeholder="you@example.com" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 pt-6">Shipping Address</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                    <input type="text" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                    <input type="text" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                                    <input type="text" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="123 Main St" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Apartment, suite, etc. (optional)</label>
                                    <input type="text" className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Apt 4B" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                                    <input type="text" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">State</label>
                                        <select required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all bg-white">
                                            <option value="">Select...</option>
                                            <option value="CA">CA</option>
                                            <option value="NY">NY</option>
                                            <option value="TX">TX</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">ZIP Code</label>
                                        <input type="text" required className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
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
                                <p className="text-slate-500 text-sm mb-4">All transactions are secure and encrypted.</p>

                                <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                                    {/* Credit Card Option */}
                                    <div className="p-4 border-b border-slate-200 bg-primary/5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <input type="radio" id="cc" name="payment" defaultChecked className="w-4 h-4 text-primary focus:ring-primary" />
                                            <label htmlFor="cc" className="font-bold text-slate-900 flex-1 cursor-pointer">Credit Card</label>
                                            <div className="flex gap-2">
                                                <div className="w-10 h-6 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold text-slate-500">VISA</div>
                                                <div className="w-10 h-6 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold text-slate-500">MC</div>
                                                <div className="w-10 h-6 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold text-slate-500">AMEX</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4 px-7">
                                            <div>
                                                <input type="text" required placeholder="Card number" className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                            </div>
                                            <div>
                                                <input type="text" required placeholder="Name on card" className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input type="text" required placeholder="Expiration date (MM / YY)" className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                                <input type="text" required placeholder="Security code (CVV)" className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PayPal Option */}
                                    <div className="p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input type="radio" id="paypal" name="payment" className="w-4 h-4 text-primary focus:ring-primary" />
                                        <label htmlFor="paypal" className="font-bold text-slate-900 flex-1 cursor-pointer">PayPal</label>
                                        <div className="w-16 h-6 bg-[#003087] rounded flex items-center justify-center font-bold text-white text-[10px] italic tracking-tighter">PayPal</div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button
                                        type="submit"
                                        className="w-full h-16 bg-primary text-[#11221c] rounded-lg font-black text-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,200,100,0.3)] hover:shadow-[0_0_30px_rgba(20,200,100,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">lock</span>
                                        Pay ${total.toFixed(2)}
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
                            {[1, 2].map((_, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 border border-slate-300">
                                        <span className="absolute -top-2 -right-2 size-5 bg-slate-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                                            {idx === 0 ? '2' : '1'}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{idx === 0 ? "Classic Heavyweight Tee" : "Ceramic Coffee Mug"}</h4>
                                        <p className="text-xs text-slate-500">Black / M</p>
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">${idx === 0 ? "48.00" : "12.00"}</div>
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
                                <span className="font-bold text-primary uppercase text-[10px] tracking-wider bg-primary/10 px-2 py-0.5 rounded">Free</span>
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
                                <span>Free shipping on all orders</span>
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
