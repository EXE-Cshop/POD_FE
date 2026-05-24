import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService, categoryService, wishlistService } from '../services/api';
import { useAuth } from '../components/AuthProvider';
import ProductCard from '../components/ProductCard';
import PromotionBanner from '../components/PromotionBanner';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wishlistedIds, setWishlistedIds] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Fetch active categories
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await categoryService.getAll();
                const data = res.data?.data || res.data || [];
                setCategories(data.filter(c => c.active).slice(0, 4));
            } catch (err) {
                console.error('Error fetching categories for home page:', err);
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch trending products
    useEffect(() => {
        const fetchTrending = async () => {
            setLoadingProducts(true);
            try {
                const res = await productService.getTrending();
                const data = res.data?.data || res.data || [];
                setTrendingProducts(data.slice(0, 4));
            } catch (err) {
                console.error('Error fetching trending products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchTrending();
    }, []);

    // Fetch wishlist to pass down to ProductCard
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) return;
            try {
                const res = await wishlistService.get();
                const items = res.data?.data || res.data || [];
                setWishlistedIds(items.map(item => item.product?.id || item.productId));
            } catch (err) {
                console.error('Error fetching wishlist ids for home:', err);
            }
        };
        fetchWishlist();
    }, [user]);

    const handleWishlistToggle = (productId, isAdded) => {
        if (isAdded) {
            setWishlistedIds(prev => [...prev, productId]);
        } else {
            setWishlistedIds(prev => prev.filter(id => id !== productId));
        }
    };

    return (
        <div className="flex flex-col w-full text-slate-900 bg-background-light">

            {/* Hero Section */}
            <section className="relative w-full h-[500px] md:h-[600px] flex items-center bg-slate-900 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2080&auto=format&fit=crop"
                        alt="Trending Fashion"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-10 lg:px-20 animate-fade-in-up">
                    <div className="max-w-2xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30">
                            CShop Streetwear & Trends
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                            Discover Trending Styles That Define You
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
                            Stay ahead of the curve with our curated seasonal releases, premium fabrics, and street culture inspired graphics.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => navigate('/home/catalog')}
                                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-primary text-[#11221c] text-lg font-extrabold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,200,100,0.3)] hover:shadow-[0_0_30px_rgba(20,200,100,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Shop Trending Now <span className="material-symbols-outlined">shopping_cart</span>
                            </button>
                            <button
                                onClick={() => document.getElementById('featured-categories').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white/10 text-white backdrop-blur-sm border border-white/20 text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                                Explore Categories
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 font-display">How CShop Works</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Getting hold of the absolute freshest streetwear drops has never been easier.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">grid_view</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">1. Browse Trends</h3>
                            <p className="text-slate-500 leading-relaxed">Explore catalog categories curated with the hottest streetwear graphics.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">shopping_bag</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">2. Order Securely</h3>
                            <p className="text-slate-500 leading-relaxed">Choose your variant, apply coupon codes, and checkout with easy payments.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">local_shipping</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">3. Fast Delivery</h3>
                            <p className="text-slate-500 leading-relaxed">We package and express ship directly to your doorstep with real-time tracking.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Exclusive Promotions / Banner */}
            <section className="py-10 bg-slate-50 border-t border-slate-200">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <PromotionBanner />
                </div>
            </section>

            {/* Featured Categories */}
            <section id="featured-categories" className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 font-display">Shop by Trend Category</h2>
                            <p className="text-slate-500">Pick from our premium categories to match your vibe.</p>
                        </div>
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="hidden sm:flex text-emerald-600 font-bold hover:text-emerald-700 items-center gap-1 transition-colors"
                        >
                            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>

                    {loadingCategories ? (
                        <div className="w-full py-16 flex items-center justify-center">
                            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500 font-semibold">
                            No active categories found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                            {categories.map((cat, idx) => (
                                <div
                                    key={cat.id}
                                    onClick={() => navigate(`/home/categories/${cat.slug}`)}
                                    className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/5] sm:aspect-square bg-slate-200 shadow-md hover:shadow-xl transition-all duration-300"
                                    style={{ animationDelay: `${idx * 150}ms` }}
                                >
                                    <img
                                        src={cat.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60"}
                                        alt={cat.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col items-center text-center">
                                        <h3 className="text-white text-xl md:text-2xl font-black tracking-wide transform translate-y-1 group-hover:-translate-y-1 transition-all duration-300 font-display">
                                            {cat.name}
                                        </h3>
                                        <p className="text-emerald-400 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1 line-clamp-1">
                                            {cat.description || 'Explore styles'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trending Products Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 font-display">Trending Now</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Our most popular designs, absolute must-haves for this season.</p>
                    </div>

                    {loadingProducts ? (
                        <div className="w-full py-16 flex items-center justify-center">
                            <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : trendingProducts.length === 0 ? (
                        <div className="w-full text-center py-8 text-gray-500 font-semibold">
                            No trending products found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                            {trendingProducts.map((product) => (
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
            </section>
        </div>
    );
};

export default Home;
