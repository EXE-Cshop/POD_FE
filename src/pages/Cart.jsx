import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Cart = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mock cart data
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            productId: 1,
            title: "Classic Heavyweight Tee",
            color: "Black",
            size: "L",
            price: 24.00,
            quantity: 2,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU"
        },
        {
            id: 2,
            productId: 3,
            title: "Ceramic Coffee Mug (11oz)",
            color: "White",
            size: "One Size",
            price: 12.00,
            quantity: 1,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcWFjI8XBegFLDDWDZmE_USMLx2E278vt7nuRFKQwDt6mDO_INQVvwxHjFlac8n_VpvMAD4X7iZbMlVBoZLEVqbM77yqesWevjAqElTJiwZQHBCaE4jDz3wMYt6NitdZSmp608ooYkJURN7g74yPAcVI9KDfIt2hKN2dV2DCcQ_X-55PyveyOSQXNvgtlPCzwWrLIORxEr1YVCYF_YGz4dG6MSdw_EyI2GCvDTu137wLiN367HCLGLHv9xTyBODrOR-8711xgY-4s"
        }
    ]);

    useEffect(() => {
        const newItem = location.state?.newDesignItem;
        if (newItem) {
            setCartItems((prev) => [newItem, ...prev]);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    const updateQuantity = (id, delta) => {
        setCartItems(items => items.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCartItems(items => items.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    if (cartItems.length === 0) {
        return (
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center bg-background-light">
                <div className="size-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[48px] text-slate-300">shopping_cart</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Your Cart is Empty</h2>
                <p className="text-slate-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Let's get you set up with some premium custom gear.</p>
                <button
                    onClick={() => navigate('/home/catalog')}
                    className="h-12 px-8 bg-primary text-[#11221c] font-extrabold rounded-lg hover:bg-primary/90 transition-all shadow-md"
                >
                    Start Shopping
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
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center py-6 border-b border-slate-200">
                            {/* Product Info */}
                            <div className="col-span-1 md:col-span-6 flex gap-6 items-start">
                                <div className="w-24 h-32 md:w-32 md:h-40 bg-slate-100 rounded-xl overflow-hidden shrink-0 cursor-pointer" onClick={() => navigate(`/home/product/${item.productId}`)}>
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <h3
                                        className="text-lg font-bold text-slate-900 mb-1 cursor-pointer hover:text-primary transition-colors hover:underline"
                                        onClick={() => navigate(`/home/product/${item.productId}`)}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">Color: <span className="text-slate-900 font-medium">{item.color}</span> | Size: <span className="text-slate-900 font-medium">{item.size}</span></p>

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
                                <span className="font-bold text-lg">${item.price.toFixed(2)}</span>
                                <div className="flex items-center border border-slate-200 rounded-lg bg-white h-10 w-28">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                                    <span className="flex-1 text-center font-bold">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 flex justify-center text-slate-500"><span className="material-symbols-outlined text-[18px]">add</span></button>
                                </div>
                                <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined">delete</span></button>
                            </div>

                            {/* Desktop Columns */}
                            <div className="hidden md:flex col-span-2 justify-center font-bold text-lg text-slate-900">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className="hidden md:flex col-span-2 justify-center">
                                <div className="flex items-center border border-slate-200 rounded-lg bg-white h-12 w-32 shadow-sm">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
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
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:flex col-span-2 justify-end font-black text-xl text-primary">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}

                    {/* Continue Shopping */}
                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="flex items-center text-slate-500 hover:text-primary font-bold text-sm transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px] mr-2">arrow_back</span>
                            Continue Shopping
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
                            onClick={() => navigate('/home/checkout')}
                            className="w-full h-14 bg-slate-900 text-white rounded-lg font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform mb-4 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                            Proceed to Checkout
                        </button>

                        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
                            <span className="material-symbols-outlined text-[16px]">verified_user</span>
                            Secure encrypted checkout
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
