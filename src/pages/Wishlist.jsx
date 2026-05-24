import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../components/AuthProvider';

const Wishlist = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await wishlistService.get();
            setWishlistItems(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
            setError('Could not load wishlist. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            navigate('/login');
        }
    }, [user]);

    const handleWishlistToggle = (productId, isAdded) => {
        if (!isAdded) {
            // Remove item from UI immediately
            setWishlistItems(prev => prev.filter(item => (item.product?.id || item.productId) !== productId));
        }
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-50/50 w-full min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 font-display">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider text-gray-400">
                    <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/home')}>Home</span>
                    <span className="material-symbols-outlined text-[10px] font-black">chevron_right</span>
                    <span className="text-emerald-600">Wishlist</span>
                </div>

                <div className="flex flex-col gap-8 mb-10">
                    <div>
                        <h1 className="text-gray-900 text-4xl font-black leading-none tracking-tight mb-2 flex items-center gap-2.5">
                            <span className="material-symbols-outlined text-rose-500 fill-current text-3xl">favorite</span>
                            My Wishlist
                        </h1>
                        <p className="text-gray-500 text-sm font-semibold">
                            Save your favorite trending apparel here. Click details to check sizing or add to cart.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse">
                        <div className="size-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Retrieving wishlist...</p>
                    </div>
                ) : error ? (
                    <div className="w-full py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                        <p className="text-rose-500 font-bold text-center">{error}</p>
                        <button
                            onClick={fetchWishlist}
                            className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors border border-gray-100"
                        >
                            Retry
                        </button>
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className="w-full py-32 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 border-dashed text-center">
                        <span className="material-symbols-outlined text-5xl text-gray-300">favorite_border</span>
                        <p className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">Your wishlist is empty</p>
                        <p className="text-gray-400 text-xs mt-[-5px]">Explore the catalog and save styles you love!</p>
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-6 rounded-2xl shadow-lg transition-colors mt-4"
                        >
                            Browse Catalog
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                        {wishlistItems.map((item) => {
                            const product = item.product || item;
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isWishlistedInitial={true}
                                    onWishlistToggle={handleWishlistToggle}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
