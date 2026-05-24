import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productService, wishlistService } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../components/AuthProvider';

const Catalog = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters and search states from URL or state
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
    );
    const [keyword, setKeyword] = useState(searchParams.get('q') || '');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0);
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 0);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'id,desc');

    const [products, setProducts] = useState([]);
    const [wishlistedIds, setWishlistedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Sync state with URL search params
    useEffect(() => {
        const params = {};
        if (selectedCategory) params.categoryId = selectedCategory;
        if (keyword) params.q = keyword;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (sortBy !== 'id,desc') params.sort = sortBy;
        setSearchParams(params);
    }, [selectedCategory, keyword, minPrice, maxPrice, sortBy]);

    // Fetch wishlist items if user logged in
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) return;
            try {
                const res = await wishlistService.get();
                const items = res.data?.data || res.data || [];
                setWishlistedIds(items.map(item => item.product?.id || item.productId));
            } catch (err) {
                console.error('Error fetching wishlist ids:', err);
            }
        };
        fetchWishlist();
    }, [user]);

    // Fetch products from API based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    page: 0,
                    size: 24,
                    sort: sortBy,
                };
                if (selectedCategory) params.categoryId = selectedCategory;
                if (keyword) params.keyword = keyword;

                const response = await productService.getAll(params);
                const apiData = response.data;
                
                let productList = [];
                if (apiData?.data?.content) {
                    productList = apiData.data.content;
                } else if (Array.isArray(apiData?.data)) {
                    productList = apiData.data;
                } else if (Array.isArray(apiData)) {
                    productList = apiData;
                }

                // Client-side price filter if needed (or if API supports it, here we filter locally as a robust fallback)
                if (minPrice > 0) {
                    productList = productList.filter(p => p.basePrice >= minPrice);
                }
                if (maxPrice > 0) {
                    productList = productList.filter(p => p.basePrice <= maxPrice);
                }

                setProducts(productList);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Could not load products. Please check if backend is running.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce search input
        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timer);
    }, [selectedCategory, keyword, minPrice, maxPrice, sortBy]);

    const handleWishlistToggle = (productId, isAdded) => {
        if (isAdded) {
            setWishlistedIds(prev => [...prev, productId]);
        } else {
            setWishlistedIds(prev => prev.filter(id => id !== productId));
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-50/50 w-full min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 font-display">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/home')}>Home</span>
                    <span className="material-symbols-outlined text-[10px] font-black">chevron_right</span>
                    <span className="text-emerald-600">Catalog</span>
                </div>

                {/* Page Heading & Search */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-gray-900 text-4xl font-black leading-none tracking-tight mb-2">
                            Trend Catalog
                        </h1>
                        <p className="text-gray-500 text-sm font-semibold">
                            Explore our curated streetwear designs crafted for modern fashion aesthetics.
                        </p>
                    </div>
                    <SearchBar value={keyword} onChange={setKeyword} />
                </div>

                {/* Main Content Layout */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    
                    {/* Left Filter Sidebar */}
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <CategoryFilter
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onPriceChange={(min, max) => {
                                setMinPrice(min);
                                setMaxPrice(max);
                            }}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </div>

                    {/* Right Product Grid */}
                    <div className="flex-grow w-full">
                        {loading ? (
                            <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Curating products...</p>
                            </div>
                        ) : error ? (
                            <div className="w-full py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                                <p className="text-rose-500 font-bold text-center">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors border border-gray-100"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 border-dashed">
                                <span className="material-symbols-outlined text-5xl text-gray-300">inventory_2</span>
                                <p className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">No matching styles found</p>
                                <p className="text-gray-400 text-xs mt-[-5px]">Try adjusting your search filters or price ranges.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                                {products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isWishlistedInitial={wishlistedIds.includes(product.id)}
                                        onWishlistToggle={handleWishlistToggle}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Catalog;
