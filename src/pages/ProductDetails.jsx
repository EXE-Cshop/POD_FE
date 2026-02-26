import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ProductDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedColor, setSelectedColor] = useState('Black');
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Mock data for a single product
    const product = {
        id: id || 1,
        title: "Classic Heavyweight Tee",
        price: 24.00,
        description: "Ultra-soft 100% ringspun cotton with a modern relaxed fit and durable stitching. Perfect for everyday wear or as a blank canvas for your custom designs.",
        features: [
            "Seamless double-needle 7/8\" collar",
            "Taped neck and shoulders",
            "Double-needle sleeve and bottom hems",
            "Quarter-turned to eliminate center crease"
        ],
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU",
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop"
        ],
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "White", hex: "#ffffff" },
            { name: "Navy", hex: "#1e3a8a" },
            { name: "Heather Gray", hex: "#9ca3af" }
        ],
        sizes: ["S", "M", "L", "XL", "2XL"]
    };

    const handleAddToCart = () => {
        setIsAdded(true);
        setShowToast(true);
        setTimeout(() => setIsAdded(false), 2000);
        setTimeout(() => setShowToast(false), 4000);
    };

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-sm">
                <span className="text-slate-500 hover:text-primary cursor-pointer" onClick={() => navigate('/home')}>Home</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-slate-500 hover:text-primary cursor-pointer" onClick={() => navigate('/home/catalog')}>Catalog</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-slate-900 font-semibold truncate">{product.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <div className="aspect-[4/5] md:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img, idx) => (
                            <div key={idx} className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${idx === 0 ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}>
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info & Actions */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2">Premium Cotton</span>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{product.title}</h1>
                    <div className="text-3xl font-black text-slate-900 mb-6">${product.price.toFixed(2)}</div>

                    <p className="text-slate-600 text-lg leading-relaxed mb-8 border-b border-slate-200 pb-8">
                        {product.description}
                    </p>

                    {/* Color Selection */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-slate-900">Color</span>
                            <span className="text-slate-500 text-sm">{selectedColor}</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {product.colors.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => setSelectedColor(color.name)}
                                    className={`size-10 rounded-full border-2 focus:outline-none transition-all ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/30 ring-offset-2' : 'border-slate-300 hover:border-slate-400'}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold text-slate-900">Size</span>
                            <span className="text-primary text-sm font-semibold hover:underline cursor-pointer">Size Guide</span>
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                            {product.sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-12 rounded-lg border focus:outline-none transition-all font-bold ${selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity & Add to Cart */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white h-14">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                readOnly
                                className="w-14 h-full text-center font-bold text-slate-900 outline-none"
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex-1 h-14 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                                    ? 'bg-primary text-[#11221c] shadow-[0_0_20px_rgba(20,200,100,0.3)]'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {isAdded ? 'check_circle' : 'shopping_cart'}
                            </span>
                            {isAdded ? 'Added to Cart!' : 'Add to Cart'}
                        </button>
                    </div>

                    {/* Alternative CTA */}
                    <div className="relative flex items-center justify-center w-full my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative px-4 bg-background-light text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Or
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/design')}
                        className="w-full h-14 border-2 border-primary text-[#11221c] bg-primary/10 rounded-lg font-black text-lg hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">palette</span>
                        Customize This Product
                    </button>

                    {/* Features List */}
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Product Details</h3>
                        <ul className="space-y-2">
                            {product.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-slate-600">
                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            {/* Toast Notification */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[320px]">
                    <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">Successfully Added</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{quantity}x {product.title} ({selectedSize})</p>
                    </div>
                    <button
                        onClick={() => navigate('/home/cart')}
                        className="px-4 py-2 bg-primary text-[#11221c] text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        View Cart
                    </button>
                    <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors absolute top-2 right-2">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
