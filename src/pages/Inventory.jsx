import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await productService.getAll({ page: 1, size: 50 });
                console.log('Admin Products API Response:', response.data);
                const apiData = response.data;
                let productList = [];
                if (apiData?.data?.content) {
                    productList = apiData.data.content;
                } else if (Array.isArray(apiData?.data)) {
                    productList = apiData.data;
                } else if (Array.isArray(apiData)) {
                    productList = apiData;
                }
                setProducts(productList);
            } catch (err) {
                console.error('Failed to fetch products:', err);
                setError('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="flex-1 overflow-auto max-w-[1200px] mx-auto py-8 px-4 text-slate-900 font-display">
            {/* Section Header */}
            <div className="mb-6">
                <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight uppercase">PRODUCT CATALOG MANAGEMENT</h1>
                <p className="text-slate-500 mt-1">View and manage CShop's physical merchandise catalog, colorways, size tiers, and inventory.</p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading products...</p>
                </div>
            ) : error ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                    <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                    <p className="text-red-500 font-medium">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                        Retry
                    </button>
                </div>
            ) : products.length === 0 ? (
                <div className="w-full py-20 flex flex-col items-center justify-center gap-4">
                    <span className="material-symbols-outlined text-5xl text-slate-300">inventory_2</span>
                    <p className="text-slate-500 font-medium text-lg">No products yet</p>
                    <p className="text-slate-400 text-sm">Add your first streetwear product to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                            <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                        style={{ backgroundImage: `url("${DEFAULT_IMAGE}")` }}
                                    ></div>
                                )}
                                <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${product.active ? 'bg-background-dark/85 text-primary' : 'bg-red-100 text-red-600'}`}>
                                    {product.active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-slate-900 text-base font-black truncate uppercase mb-1">{product.name}</h3>
                                <p className="text-primary text-sm font-black uppercase tracking-wider mb-2">
                                    {formatCurrency(product.basePrice)}
                                </p>
                                <div className="flex items-center gap-2 mb-4 flex-wrap text-xs text-slate-500 font-bold">
                                    {product.material && (
                                        <>
                                            <span>{product.material}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        </>
                                    )}
                                    {product.slug && (
                                        <span className="truncate">slug: {product.slug}</span>
                                    )}
                                </div>
                                <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-wider hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Inventory;
