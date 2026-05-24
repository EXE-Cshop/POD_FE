import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { productService, cartService, wishlistService } from '../services/api';
import { guestCartStorage } from '../utils/guestCartStorage';
import { useAuth } from '../components/AuthProvider';
import ReviewSection from '../components/ReviewSection';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=60';

const ProductDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const { slug } = useParams();

    const [product, setProduct] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    // Active image displayed in the main viewport
    const [activeImage, setActiveImage] = useState(null);

    // Fetch product details by slug
    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await productService.getBySlug(slug);
                const productData = res.data?.data || res.data || null;
                
                if (!productData) {
                    throw new Error('Sản phẩm không tồn tại.');
                }
                
                setProduct(productData);
                setActiveImage(productData.imageUrl || DEFAULT_IMAGE);

                // Auto-select first available color & size from variants
                const variantList = productData.variants || [];
                if (variantList.length > 0) {
                    const firstColor = variantList[0].colorName;
                    setSelectedColor(firstColor);
                    
                    const sizesForColor = variantList.filter(v => v.colorName === firstColor && v.stockQuantity > 0);
                    if (sizesForColor.length > 0) {
                        setSelectedSize(sizesForColor[0].size);
                    } else {
                        setSelectedSize(variantList.find(v => v.colorName === firstColor)?.size || null);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch product details:', err);
                setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchProductData();
        }
    }, [slug]);

    // Check wishlist status
    useEffect(() => {
        const checkWishlistStatus = async () => {
            if (!user || !product) return;
            try {
                const res = await wishlistService.get();
                const items = res.data?.data || res.data || [];
                const found = items.some(item => (item.product?.id || item.productId) === product.id);
                setIsWishlisted(found);
            } catch (err) {
                console.error('Error checking wishlist status:', err);
            }
        };
        checkWishlistStatus();
    }, [user, product]);

    // Derive unique colors from variants
    const colors = useMemo(() => {
        if (!product?.variants) return [];
        const colorMap = new Map();
        product.variants.forEach(v => {
            if (!colorMap.has(v.colorName)) {
                colorMap.set(v.colorName, { 
                    name: v.colorName, 
                    hex: v.colorHex || '#cccccc', 
                    frontImageUrl: v.frontImageUrl,
                    backImageUrl: v.backImageUrl
                });
            }
        });
        return Array.from(colorMap.values());
    }, [product]);

    // Derive available sizes for the selected color
    const sizesForSelectedColor = useMemo(() => {
        if (!product?.variants) return [];
        return product.variants
            .filter(v => v.colorName === selectedColor)
            .sort((a, b) => {
                const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
                return order.indexOf(a.size) - order.indexOf(b.size);
            });
    }, [product, selectedColor]);

    // Get the currently selected variant
    const selectedVariant = useMemo(() => {
        if (!product?.variants) return null;
        return product.variants.find(v => v.colorName === selectedColor && v.size === selectedSize) || null;
    }, [product, selectedColor, selectedSize]);

    // Update main image when color or variant changes
    useEffect(() => {
        if (selectedVariant?.frontImageUrl) {
            setActiveImage(selectedVariant.frontImageUrl);
        } else {
            const colorData = colors.find(c => c.name === selectedColor);
            if (colorData?.frontImageUrl) {
                setActiveImage(colorData.frontImageUrl);
            }
        }
    }, [selectedVariant, selectedColor, colors]);

    // Calculate final price (basePrice + priceAdjustment)
    const finalPrice = useMemo(() => {
        if (!product) return 0;
        const base = Number(product.basePrice) || 0;
        const adj = selectedVariant ? Number(selectedVariant.priceAdjustment) || 0 : 0;
        return base + adj;
    }, [product, selectedVariant]);

    // Generate list of all images for the gallery
    const galleryImages = useMemo(() => {
        if (!product) return [];
        const imgs = [];
        
        // Add primary product image
        if (product.imageUrl) imgs.push(product.imageUrl);

        // Add additional images from product.images
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                if (img.imageUrl && !imgs.includes(img.imageUrl)) {
                    imgs.push(img.imageUrl);
                }
            });
        }

        // Add variant front/back images
        if (product.variants) {
            product.variants.forEach(v => {
                if (v.frontImageUrl && !imgs.includes(v.frontImageUrl)) imgs.push(v.frontImageUrl);
                if (v.backImageUrl && !imgs.includes(v.backImageUrl)) imgs.push(v.backImageUrl);
            });
        }

        return imgs.slice(0, 6); // Max 6 gallery images
    }, [product]);

    const handleWishlistToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setWishlistLoading(true);
        try {
            if (isWishlisted) {
                await wishlistService.remove(product.id);
                setIsWishlisted(false);
            } else {
                await wishlistService.add(product.id);
                setIsWishlisted(true);
            }
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            setCartError('Vui lòng chọn màu sắc và kích cỡ.');
            return;
        }
        
        setCartLoading(true);
        setCartError(null);
        try {
            if (isAuthenticated) {
                await cartService.addItem(selectedVariant.id, quantity);
            } else {
                // Anonymous Cart storage
                guestCartStorage.addItem({
                    productVariantId: selectedVariant.id,
                    productName: product.name,
                    price: finalPrice,
                    quantity: quantity,
                    colorName: selectedColor,
                    size: selectedSize,
                    imageUrl: activeImage,
                    availableSizes: sizesForSelectedColor.map(v => v.size)
                });
            }
            
            setIsAdded(true);
            setShowToast(true);
            setTimeout(() => setIsAdded(false), 2000);
            setTimeout(() => setShowToast(false), 4000);
        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.';
            setCartError(msg);
        } finally {
            setCartLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 flex items-center justify-center min-h-[60vh] font-display">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Curating streetwear style...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 flex items-center justify-center min-h-[60vh] font-display">
                <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm max-w-md w-full text-center">
                    <span className="material-symbols-outlined text-5xl text-rose-500 mb-2">error</span>
                    <p className="text-rose-500 font-extrabold">{error || 'Style not found'}</p>
                    <button onClick={() => navigate('/home/catalog')} className="mt-4 px-6 py-2.5 bg-primary text-background-dark text-xs uppercase font-black tracking-wider rounded-xl transition-all shadow-md">
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 py-12 font-display">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/home')}>Home</span>
                <span className="material-symbols-outlined text-[10px] font-black">chevron_right</span>
                <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/home/catalog')}>Catalog</span>
                <span className="material-symbols-outlined text-[10px] font-black">chevron_right</span>
                <span className="text-emerald-600 truncate">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
                
                {/* Left: Images Gallery Grid */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                    {/* Active Main Product View */}
                    <div className="relative aspect-[3/4] bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center group">
                        <img
                            src={activeImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-500 ease-out"
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />
                        {product.isTrending && (
                            <span className="absolute top-6 left-6 bg-emerald-500 text-white text-xs uppercase font-black px-3 py-1.5 rounded-full tracking-wider shadow-md animate-pulse">
                                Trending Drop
                            </span>
                        )}

                        {/* Wishlist Button */}
                        <button
                            onClick={handleWishlistToggle}
                            disabled={wishlistLoading}
                            className={`absolute top-6 right-6 size-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                                isWishlisted 
                                ? 'bg-rose-50 text-rose-500 scale-110' 
                                : 'bg-white/85 text-gray-400 hover:text-rose-500 hover:scale-110 hover:bg-white'
                            }`}
                        >
                            <span className={`material-symbols-outlined transition-all ${isWishlisted ? 'fill-current' : ''}`}>
                                favorite
                            </span>
                        </button>
                    </div>

                    {/* Gallery Thumbnails */}
                    {galleryImages.length > 1 && (
                        <div className="grid grid-cols-6 gap-3">
                            {galleryImages.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(imgUrl)}
                                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                                        activeImage === imgUrl 
                                        ? 'border-primary ring-2 ring-primary/20 scale-105' 
                                        : 'border-transparent hover:border-slate-300 hover:scale-102'
                                    }`}
                                >
                                    <img src={imgUrl} alt={`Gallery-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Details Details */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                    <div>
                        {/* Material/Tags */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                                {product.material || 'Premium Cotton'}
                            </span>
                            {product.category?.name && (
                                <span className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                                    {product.category.name}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                            {product.name}
                        </h1>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-gray-900 font-black text-3xl md:text-4xl">
                                {formatCurrency(finalPrice)}
                            </span>
                            {selectedVariant?.priceAdjustment > 0 && (
                                <span className="text-gray-400 text-xs font-bold bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                                    Includes size upcharge (+{formatCurrency(selectedVariant.priceAdjustment)})
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-500 text-sm font-semibold leading-relaxed mb-8 border-b border-gray-100 pb-8">
                            {product.description || 'A timeless streetwear blank designed for comfortable all-day wear, using durable heavy cotton stitching.'}
                        </p>

                        {/* Color Options */}
                        {colors.length > 0 && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-900 text-sm">Select Color</span>
                                    <span className="text-emerald-600 text-xs font-black uppercase tracking-wider">{selectedColor}</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => {
                                                setSelectedColor(color.name);
                                                const availableSizes = product.variants.filter(v => v.colorName === color.name);
                                                if (availableSizes.length > 0 && !availableSizes.some(v => v.size === selectedSize)) {
                                                    setSelectedSize(availableSizes[0].size);
                                                }
                                            }}
                                            className={`size-10 rounded-full border-2 transition-all ${
                                                selectedColor === color.name 
                                                ? 'border-primary ring-2 ring-primary/20 ring-offset-2 scale-110 shadow-md' 
                                                : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Options */}
                        {sizesForSelectedColor.length > 0 && (
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-900 text-sm">Select Size</span>
                                    <span className="text-gray-400 text-xs font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-0.5">
                                        <span className="material-symbols-outlined text-sm">straighten</span>
                                        Size Guide
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                    {sizesForSelectedColor.map(variant => {
                                        const isOutOfStock = variant.stockQuantity <= 0;
                                        const isSelected = selectedSize === variant.size;
                                        return (
                                            <button
                                                key={variant.size}
                                                onClick={() => setSelectedSize(variant.size)}
                                                disabled={isOutOfStock}
                                                className={`h-12 rounded-xl border focus:outline-none transition-all font-bold text-xs relative ${
                                                    isOutOfStock
                                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                                                    : isSelected
                                                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:scale-102'
                                                }`}
                                            >
                                                {variant.size}
                                                {variant.stockQuantity > 0 && variant.stockQuantity <= 5 && (
                                                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black scale-90">
                                                        {variant.stockQuantity} Left
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedVariant && (
                                    <div className="flex justify-between items-center mt-3 text-xs font-semibold text-gray-400">
                                        <span>SKU: {selectedVariant.sku}</span>
                                        <span>Stock: {selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} units` : 'Out of stock'}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quantity & Add to Cart Container */}
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            {/* Quantity Picker */}
                            <div className="flex items-center border border-gray-200 rounded-2xl bg-white h-14 shadow-sm shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg font-bold">remove</span>
                                </button>
                                <input
                                    type="number"
                                    value={quantity}
                                    readOnly
                                    className="w-10 h-full text-center font-black text-gray-900 outline-none text-sm"
                                />
                                <button
                                    onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || 99, quantity + 1))}
                                    className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg font-bold">add</span>
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded || cartLoading || !selectedVariant || selectedVariant.stockQuantity <= 0}
                                className={`flex-grow h-14 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                                    isAdded
                                    ? 'bg-primary text-[#11221c] shadow-[0_0_25px_rgba(20,200,100,0.35)]'
                                    : 'bg-gray-900 text-white hover:bg-slate-800 shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                            >
                                {cartLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined">
                                        {isAdded ? 'done' : 'shopping_bag'}
                                    </span>
                                )}
                                {cartLoading ? 'Securing Item...' : isAdded ? 'Added Drop!' : 'Add to Bag'}
                            </button>
                        </div>

                        {cartError && (
                            <p className="text-rose-500 text-xs font-bold mb-4 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                {cartError}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="border-t border-gray-100 pt-16 mt-16 max-w-4xl">
                <ReviewSection productId={product.id} />
            </div>

            {/* Toast Notification */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-slate-900 border border-slate-800 text-white p-5 rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.35)] flex items-center gap-4 min-w-[340px]">
                    <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-extrabold text-white text-sm">Added successfully</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{quantity}x {product.name} ({selectedColor} / {selectedSize})</p>
                    </div>
                    <button
                        onClick={() => navigate('/home/cart')}
                        className="px-4 py-2 bg-primary text-[#11221c] text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-colors shadow-sm"
                    >
                        View Bag
                    </button>
                    <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors absolute top-3 right-3">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
