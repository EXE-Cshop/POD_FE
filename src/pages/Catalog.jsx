import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseProductService } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop';

const Catalog = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch base products from API
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await baseProductService.getAll({ page: 1, size: 50 });
                console.log('API Response:', response.data);
                // ApiResponse<Page<BaseProductDTO>> => response.data = { code, message, data: { content: [...] } }
                const apiData = response.data;
                let productList = [];
                if (apiData?.data?.content) {
                    // Paginated response
                    productList = apiData.data.content;
                } else if (Array.isArray(apiData?.data)) {
                    // Direct array response
                    productList = apiData.data;
                } else if (Array.isArray(apiData)) {
                    productList = apiData;
                }
                setProducts(productList);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                if (err.response) {
                    console.error('Error response:', err.response.status, err.response.data);
                    setError(`Lỗi server: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
                } else if (err.request) {
                    setError('Không thể kết nối đến server. Hãy kiểm tra backend đã chạy chưa.');
                } else {
                    setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="flex-1 overflow-auto max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-8 text-slate-900 bg-background-light w-full">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-slate-500 text-sm font-medium hover:text-primary cursor-pointer" onClick={() => navigate('/home')}>Home</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-primary text-sm font-semibold">Catalog</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                <div className="max-w-2xl">
                    <h1 className="text-slate-900 text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
                        All Products
                    </h1>
                    <p className="text-slate-600 text-lg mt-2">Find the perfect blank canvas for your art.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-200 p-1 rounded-lg">
                    <button className="px-4 py-2 rounded-md bg-primary text-[#11221c] text-sm font-bold shadow-sm">Grid View</button>
                    <button className="px-4 py-2 rounded-md text-slate-600 text-sm font-bold hover:text-white transition-colors">List View</button>
                </div>
            </div>

            {/* Product Grid - No Category Sidebar */}
            <div className="w-full">
                {loading ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        <p className="text-slate-500 text-sm font-medium">Đang tải sản phẩm...</p>
                    </div>
                ) : error ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                        <p className="text-red-500 font-medium text-center max-w-md">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                        <span className="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                        <p className="text-slate-500 font-medium text-lg">Chưa có sản phẩm nào</p>
                        <p className="text-slate-400 text-sm">Hãy thêm sản phẩm base từ trang Admin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, idx) => (
                            <div
                                key={product.id}
                                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2"
                                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate(`/home/product/${product.id}`)}>
                                    <img
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        src={product.imageUrl || DEFAULT_IMAGE}
                                        alt={product.name}
                                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                                    />
                                </div>
                                <div className="p-5 flex flex-col grow">
                                    {product.material && (
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.material}</p>
                                    )}
                                    <h3
                                        className="text-slate-900 text-lg font-bold leading-tight mb-2 cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => navigate(`/home/product/${product.id}`)}
                                    >
                                        {product.name}
                                    </h3>
                                    {product.description && (
                                        <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                                    )}
                                    <span className="text-primary text-xl font-black mb-4">{formatPrice(product.basePrice)}</span>
                                    <div className="mt-auto flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/design/${product.id}`)}
                                                className="flex-[3] flex items-center justify-center gap-2 rounded-lg h-11 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-primary hover:text-[#11221c] transition-colors"
                                            >
                                                Tuỳ chỉnh thiết kế
                                            </button>
                                            <button
                                                onClick={() => navigate(`/home/product/${product.id}`, { state: { autoAddToCart: true } })}
                                                className="flex-[1] flex items-center justify-center rounded-lg h-11 bg-primary text-[#11221c] hover:brightness-110 transition-all"
                                                title="Thêm vào giỏ hàng"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;
