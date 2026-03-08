import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { baseProductService, productVariantService, cartService } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop';

const ProductDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch product + variants from API
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [productRes, variantsRes] = await Promise.all([
                    baseProductService.getById(id),
                    productVariantService.getByBaseProductId(id),
                ]);
                const productData = productRes.data?.data || productRes.data || null;
                setProduct(productData);

                const variantList = variantsRes.data?.data?.content || variantsRes.data?.data || [];
                setVariants(variantList);

                // Auto-select first color & size
                if (variantList.length > 0) {
                    const firstColor = variantList[0].colorName;
                    setSelectedColor(firstColor);
                    const sizesForColor = variantList.filter(v => v.colorName === firstColor);
                    if (sizesForColor.length > 0) {
                        setSelectedSize(sizesForColor[0].size);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch product:', err);
                setError('Không thể tải thông tin sản phẩm.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    // Derive unique colors from variants
    const colors = useMemo(() => {
        const colorMap = new Map();
        variants.forEach(v => {
            if (!colorMap.has(v.colorName)) {
                colorMap.set(v.colorName, { name: v.colorName, hex: v.colorHex, frontImageUrl: v.frontImageUrl });
            }
        });
        return Array.from(colorMap.values());
    }, [variants]);

    // Derive available sizes for selected color
    const sizesForSelectedColor = useMemo(() => {
        return variants
            .filter(v => v.colorName === selectedColor)
            .sort((a, b) => {
                const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
                return order.indexOf(a.size) - order.indexOf(b.size);
            });
    }, [variants, selectedColor]);

    // Get the currently selected variant
    const selectedVariant = useMemo(() => {
        return variants.find(v => v.colorName === selectedColor && v.size === selectedSize) || null;
    }, [variants, selectedColor, selectedSize]);

    // Calculate total price
    const totalPrice = useMemo(() => {
        if (!product) return 0;
        const base = Number(product.basePrice) || 0;
        const adj = selectedVariant ? Number(selectedVariant.priceAdjustment) || 0 : 0;
        return base + adj;
    }, [product, selectedVariant]);

    // When color changes, update size selection & image
    const handleColorChange = (colorName) => {
        setSelectedColor(colorName);
        const sizesAvailable = variants.filter(v => v.colorName === colorName);
        if (sizesAvailable.length > 0 && !sizesAvailable.find(v => v.size === selectedSize)) {
            setSelectedSize(sizesAvailable[0].size);
        }
    };

    // Get display image: variant image > product image > default
    const displayImage = useMemo(() => {
        if (selectedVariant?.frontImageUrl) return selectedVariant.frontImageUrl;
        const colorData = colors.find(c => c.name === selectedColor);
        if (colorData?.frontImageUrl) return colorData.frontImageUrl;
        return product?.imageUrl || DEFAULT_IMAGE;
    }, [selectedVariant, colors, selectedColor, product]);

    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const autoAddTriggered = React.useRef(false);

    useEffect(() => {
        if (location.state?.autoAddToCart && !loading && selectedVariant && !autoAddTriggered.current) {
            autoAddTriggered.current = true;
            handleAddToCart();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loading, selectedVariant, location.state]);

    const handleAddToCart = async () => {
        if (!selectedVariant) {
            setCartError('Vui lòng chọn màu sắc và kích cỡ.');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/home/login', { state: { from: `/home/product/${id}` } });
            return;
        }
        setCartLoading(true);
        setCartError(null);
        try {
            await cartService.addItem(selectedVariant.id, quantity);
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

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    if (loading) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading product...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                    <p className="text-red-500 font-medium">{error || 'Product not found'}</p>
                    <button onClick={() => navigate('/home/catalog')} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                        Back to Catalog
                    </button>
                </div>
            </div>
        );
    }

    const hasVariants = variants.length > 0;

    return (
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 mb-8 text-sm">
                <span className="text-slate-500 hover:text-primary cursor-pointer" onClick={() => navigate('/home')}>Home</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-slate-500 hover:text-primary cursor-pointer" onClick={() => navigate('/home/catalog')}>Catalog</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-slate-900 font-semibold truncate">{product.name}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                {/* Image Gallery */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    <div className="aspect-[4/5] md:aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover transition-all duration-300"
                            onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                        />
                    </div>
                    {/* Color thumbnail strip */}
                    {colors.length > 1 && (
                        <div className="flex gap-3">
                            {colors.map(color => (
                                <button
                                    key={color.name}
                                    onClick={() => handleColorChange(color.name)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 hover:border-slate-400'}`}
                                >
                                    {color.frontImageUrl ? (
                                        <img src={color.frontImageUrl} alt={color.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full" style={{ backgroundColor: color.hex }}></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info & Actions */}
                <div className="w-full lg:w-1/2 flex flex-col">
                    {product.material && (
                        <span className="text-primary font-bold text-sm tracking-widest uppercase mb-2">{product.material}</span>
                    )}
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
                    <div className="text-3xl font-black text-slate-900 mb-2">{formatPrice(totalPrice)}</div>
                    {selectedVariant?.priceAdjustment > 0 && (
                        <p className="text-sm text-slate-500 mb-4">
                            Giá gốc {formatPrice(product.basePrice)} + phụ thu size {formatPrice(selectedVariant.priceAdjustment)}
                        </p>
                    )}

                    <p className="text-slate-600 text-lg leading-relaxed mb-8 border-b border-slate-200 pb-8">
                        {product.description || 'A high-quality base product perfect for custom printing and design.'}
                    </p>

                    {/* Color Selection */}
                    {hasVariants && colors.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-900">Màu sắc</span>
                                <span className="text-slate-500 text-sm">{selectedColor}</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {colors.map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleColorChange(color.name)}
                                        className={`size-10 rounded-full border-2 focus:outline-none transition-all ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/30 ring-offset-2' : 'border-slate-300 hover:border-slate-400'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    {hasVariants && sizesForSelectedColor.length > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-slate-900">Kích cỡ</span>
                                <span className="text-primary text-sm font-semibold hover:underline cursor-pointer">Size Guide</span>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                                {sizesForSelectedColor.map(variant => (
                                    <button
                                        key={variant.size}
                                        onClick={() => setSelectedSize(variant.size)}
                                        disabled={variant.stockQuantity <= 0}
                                        className={`h-12 rounded-lg border focus:outline-none transition-all font-bold relative
                                            ${variant.stockQuantity <= 0
                                                ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
                                                : selectedSize === variant.size
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                                            }`}
                                    >
                                        {variant.size}
                                        {variant.stockQuantity > 0 && variant.stockQuantity <= 10 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                {variant.stockQuantity}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            {selectedVariant && (
                                <p className="text-sm text-slate-500 mt-2">
                                    Còn {selectedVariant.stockQuantity} sản phẩm • SKU: {selectedVariant.sku}
                                </p>
                            )}
                        </div>
                    )}

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
                                onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || 999, quantity + 1))}
                                className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded || cartLoading || !selectedVariant || selectedVariant.stockQuantity <= 0}
                            className={`flex-1 h-14 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isAdded
                                ? 'bg-primary text-[#11221c] shadow-[0_0_20px_rgba(20,200,100,0.3)]'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {cartLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[20px]">
                                    {isAdded ? 'check_circle' : 'shopping_cart'}
                                </span>
                            )}
                            {cartLoading ? 'Đang thêm...' : isAdded ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
                        </button>
                    </div>
                    {cartError && (
                        <p className="text-red-500 text-sm font-medium -mt-4 mb-4">{cartError}</p>
                    )}

                    {/* Alternative CTA */}
                    <div className="relative flex items-center justify-center w-full my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative px-4 bg-background-light text-slate-400 text-sm font-bold uppercase tracking-wider">
                            Hoặc
                        </div>
                    </div>

                    <button
                        onClick={() => navigate(`/design/${product.id}`)}
                        className="w-full h-14 border-2 border-primary text-[#11221c] bg-primary/10 rounded-lg font-black text-lg hover:bg-primary transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">palette</span>
                        Tuỳ chỉnh thiết kế
                    </button>

                    {/* Product Details */}
                    <div className="mt-12">
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Chi tiết sản phẩm</h3>
                        <ul className="space-y-2">
                            {product.material && (
                                <li className="flex items-start gap-2 text-slate-600">
                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    Chất liệu: {product.material}
                                </li>
                            )}
                            {product.printTechnology && (
                                <li className="flex items-start gap-2 text-slate-600">
                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    Công nghệ in: {product.printTechnology}
                                </li>
                            )}
                            {hasVariants && (
                                <li className="flex items-start gap-2 text-slate-600">
                                    <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                    {colors.length} màu sắc • {sizesForSelectedColor.length} kích cỡ
                                </li>
                            )}
                            <li className="flex items-start gap-2 text-slate-600">
                                <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                Sản phẩm cao cấp dành cho in theo yêu cầu (POD)
                            </li>
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
                        <h4 className="font-bold text-white text-sm">Thêm thành công</h4>
                        <p className="text-xs text-slate-400 mt-0.5">{quantity}x {product.name} ({selectedColor} / {selectedSize})</p>
                    </div>
                    <button
                        onClick={() => navigate('/home/cart')}
                        className="px-4 py-2 bg-primary text-[#11221c] text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        Xem giỏ
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

