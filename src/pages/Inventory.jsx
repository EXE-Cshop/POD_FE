import React, { useState, useEffect } from 'react';
import { baseProductService } from '../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        basePrice: '',
        material: '',
        printTechnology: '',
        imageUrl: '',
        active: true
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await baseProductService.getAll({ page: 1, size: 50 });
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
            console.error('Failed to fetch base products:', err);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await baseProductService.create({
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0
            });
            setIsModalOpen(false);
            setFormData({
                name: '',
                code: '',
                basePrice: '',
                material: '',
                printTechnology: '',
                imageUrl: '',
                active: true
            });
            fetchProducts();
        } catch (err) {
            console.error('Failed to create product:', err);
            alert('Failed to create product. Please check console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        if (!price) return '0₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="flex-1 overflow-auto max-w-[1200px] mx-auto py-8 px-4 text-slate-900 ">
            {/* Section Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-slate-900  text-3xl font-extrabold tracking-tight">Base Product Management</h1>
                    <p className="text-slate-500  mt-1">Configure blank merchandise and define printable zones for the customization engine.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <span className="material-symbols-outlined text-[20px]">add_box</span>
                    Add Base Product
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">Add New Base Product</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="e.g. Classic T-Shirt"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Code</label>
                                    <input
                                        required
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="TS-001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Price</label>
                                    <input
                                        required
                                        type="number"
                                        name="basePrice"
                                        value={formData.basePrice}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="150000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Material</label>
                                    <input
                                        name="material"
                                        value={formData.material}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="100% Cotton"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Print Tech</label>
                                    <input
                                        name="printTechnology"
                                        value={formData.printTechnology}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="DTG"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                                    <input
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/50 outline-none"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-11 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 h-11 rounded-lg bg-primary text-background-dark font-bold hover:brightness-110 disabled:opacity-50 transition-all"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


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
                    <p className="text-slate-500 font-medium text-lg">No base products yet</p>
                    <p className="text-slate-400 text-sm">Add your first base product to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-primary/50 transition-all duration-300">
                            <div className="relative w-full aspect-square bg-white flex items-center justify-center overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-center bg-no-repeat bg-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                    style={{ backgroundImage: `url("${product.imageUrl || DEFAULT_IMAGE}")` }}
                                ></div>
                                <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${product.active ? 'bg-background-dark/80 text-primary' : 'bg-red-100 text-red-600'}`}>
                                    {product.active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-slate-900 text-lg font-bold mb-1">{product.name}</h3>
                                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-1">
                                    {formatPrice(product.basePrice)}
                                </p>
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    {product.material && (
                                        <>
                                            <span className="text-slate-500 text-sm">{product.material}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        </>
                                    )}
                                    {product.printTechnology && (
                                        <span className="text-slate-500 text-sm">{product.printTechnology}</span>
                                    )}
                                </div>
                                <button className="mt-auto w-full py-2.5 rounded-lg bg-slate-100 text-slate-900 text-sm font-bold hover:bg-primary hover:text-background-dark transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">design_services</span>
                                    Manage Print Areas
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
