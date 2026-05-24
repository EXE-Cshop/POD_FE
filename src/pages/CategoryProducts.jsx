import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, categoryService, wishlistService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../components/AuthProvider';

const CategoryProducts = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [wishlistedIds, setWishlistedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const fetchCategoryAndProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                // Get category by slug
                const catRes = await categoryService.getBySlug(slug);
                const catData = catRes.data?.data || catRes.data;
                
                if (!catData) {
                    setError('Category not found.');
                    setLoading(false);
                    return;
                }
                setCategory(catData);

                // Get products by category id
                const prodRes = await productService.getAll({ categoryId: catData.id });
                const prodData = prodRes.data;
                let list = [];
                if (prodData?.data?.content) {
                    list = prodData.data.content;
                } else if (Array.isArray(prodData?.data)) {
                    list = prodData.data;
                } else if (Array.isArray(prodData)) {
                    list = prodData;
                }
                setProducts(list);
            } catch (err) {
                console.error('Failed to load category products:', err);
                setError('Failed to load category products.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCategoryAndProducts();
        }
    }, [slug]);

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
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/home/catalog')}>Collections</span>
                    <span className="material-symbols-outlined text-[10px] font-black">chevron_right</span>
                    <span className="text-emerald-600">{category?.name || 'Category'}</span>
                </div>

                {loading ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                        <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Loading collection...</p>
                    </div>
                ) : error ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                        <p className="text-rose-500 font-bold text-center">{error}</p>
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors border border-gray-100"
                        >
                            Back to Catalog
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {/* Category Hero Banner */}
                        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-emerald-600 to-teal-800 text-white min-h-[220px] flex items-center p-8 sm:p-12">
                            {/* Decorative background visual */}
                            {category?.imageUrl && (
                                <div 
                                    className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25"
                                    style={{ backgroundImage: `url(${category.imageUrl})` }}
                                ></div>
                            )}
                            <div className="relative z-10 max-w-2xl">
                                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-3 block">
                                    Collection
                                </span>
                                <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">{category.name}</h1>
                                <p className="text-white/80 text-sm sm:text-base font-semibold leading-relaxed">
                                    {category.description || `Browse the best custom selected t-shirts from our ${category.name} style trend catalog.`}
                                </p>
                            </div>
                        </div>

                        {/* Category Products Grid */}
                        <div className="flex flex-col gap-6">
                            <h2 className="text-gray-900 font-extrabold text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">grid_view</span>
                                Showing {products.length} items
                            </h2>

                            {products.length === 0 ? (
                                <div className="w-full py-24 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 border-dashed">
                                    <span className="material-symbols-outlined text-5xl text-gray-300">inventory_2</span>
                                    <p className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">No products in this category yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
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
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;
