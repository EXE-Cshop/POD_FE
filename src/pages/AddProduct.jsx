import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    // Form State
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        category: 'T-shirts',
        basePrice: '',
        images: [''],
        variants: [
            { id: Date.now(), color: '', size: '', stock: '', price: '' }
        ],
        printAreas: []
    });

    const categories = ['T-shirts', 'Hoodies', 'Accessories', 'Headwear'];
    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'OS'];

    const validateStep1 = () => {
        const newErrors = {};
        if (!productData.name.trim()) newErrors.name = 'Product name is required';
        if (!productData.basePrice || isNaN(productData.basePrice) || parseFloat(productData.basePrice) <= 0) {
            newErrors.basePrice = 'Please enter a valid positive price';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep3 = () => {
        const variantErrors = productData.variants.map(v => {
            const err = {};
            if (!v.color.trim()) err.color = 'Color is required';
            if (!v.size) err.size = 'Size is required';
            if (v.stock === '' || isNaN(v.stock) || parseInt(v.stock) < 0) err.stock = 'Invalid stock';
            if (v.price && (isNaN(v.price) || parseFloat(v.price) < 0)) err.price = 'Invalid price';
            return err;
        });

        const hasErrors = variantErrors.some(err => Object.keys(err).length > 0);
        if (hasErrors) {
            setErrors({ variants: variantErrors });
            return false;
        }
        setErrors({});
        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 3 && !validateStep3()) return;
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const updateVariant = (id, field, value) => {
        setProductData(prev => ({
            ...prev,
            variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
        }));
    };

    const addVariant = () => {
        setProductData(prev => ({
            ...prev,
            variants: [...prev.variants, { id: Date.now(), color: '', size: '', stock: '', price: '' }]
        }));
    };

    const removeVariant = (id) => {
        setProductData(prev => ({
            ...prev,
            variants: prev.variants.filter(v => v.id !== id)
        }));
    };

    const handleSubmit = () => {
        console.log('Submitting Product:', productData);
        // Simulate API call
        setTimeout(() => {
            navigate('/admin/base-products');
        }, 1000);
    };

    const steps = [
        { id: 1, name: 'Basic Info', icon: 'info' },
        { id: 2, name: 'Media', icon: 'image' },
        { id: 3, name: 'Variants', icon: 'style' },
        { id: 4, name: 'Print Zones', icon: 'layers' }
    ];

    return (
        <div className="flex-1 overflow-auto max-w-[1000px] mx-auto py-8 px-4 text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Add New Base Product</h1>
                    <p className="text-slate-500 mt-1">Create a new merchandise item for the catalog.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/base-products')}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Stepper */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    ></div>

                    {steps.map((step) => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                size-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
                                ${currentStep >= step.id ? 'bg-primary text-[#11221c]' : 'bg-white border-2 border-slate-200 text-slate-400'}
                                ${currentStep === step.id ? 'ring-4 ring-primary/20' : ''}
                            `}>
                                {currentStep > step.id ? (
                                    <span className="material-symbols-outlined text-xl">check</span>
                                ) : (
                                    <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                )}
                            </div>
                            <span className={`text-xs font-bold mt-2 uppercase tracking-wider ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm min-h-[400px]">
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Product Name</label>
                                <input
                                    type="text"
                                    value={productData.name}
                                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                                    placeholder="e.g. Premium Heavyweight Tee"
                                    className={`h-12 px-4 rounded-xl border outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-200 focus:border-primary'}`}
                                />
                                {errors.name && <span className="text-xs text-red-500 font-medium">{errors.name}</span>}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700">Category</label>
                                <select
                                    value={productData.category}
                                    onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                                    className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary transition-all appearance-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Description</label>
                            <textarea
                                rows="4"
                                value={productData.description}
                                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                                placeholder="Describe the material, fit, and feel..."
                                className="p-4 rounded-xl border border-slate-200 outline-none focus:border-primary transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="w-1/2 flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700">Base Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={productData.basePrice}
                                onChange={(e) => setProductData({ ...productData, basePrice: e.target.value })}
                                placeholder="0.00"
                                className={`h-12 px-4 rounded-xl border outline-none transition-all ${errors.basePrice ? 'border-red-500' : 'border-slate-200 focus:border-primary'}`}
                            />
                            {errors.basePrice && <span className="text-xs text-red-500 font-medium">{errors.basePrice}</span>}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Product Media</h3>
                            <button
                                onClick={() => setProductData({ ...productData, images: [...productData.images, ''] })}
                                className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Image URL
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {productData.images.map((url, idx) => (
                                <div key={idx} className="flex gap-4 items-end">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <label className="text-sm font-bold text-slate-700">Image URL {idx + 1}</label>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => {
                                                const newImages = [...productData.images];
                                                newImages[idx] = e.target.value;
                                                setProductData({ ...productData, images: newImages });
                                            }}
                                            placeholder="https://..."
                                            className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    {productData.images.length > 1 && (
                                        <button
                                            onClick={() => {
                                                const newImages = productData.images.filter((_, i) => i !== idx);
                                                setProductData({ ...productData, images: newImages });
                                            }}
                                            className="h-12 px-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            {productData.images.filter(url => url).map((url, idx) => (
                                <div key={idx} className="aspect-square rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Variant Configuration</h3>
                            <button
                                onClick={addVariant}
                                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Add Variant
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 italic">
                                        <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Color</th>
                                        <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Size</th>
                                        <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Stock</th>
                                        <th className="text-left py-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Price Adjust</th>
                                        <th className="text-right py-4 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {productData.variants.map((v, idx) => (
                                        <tr key={v.id}>
                                            <td className="py-4 px-2">
                                                <input
                                                    type="text"
                                                    placeholder="Red"
                                                    value={v.color}
                                                    onChange={(e) => updateVariant(v.id, 'color', e.target.value)}
                                                    className={`w-full h-10 px-3 rounded-lg border outline-none text-sm transition-all ${errors.variants?.[idx]?.color ? 'border-red-500' : 'border-slate-200 focus:border-primary'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-2">
                                                <select
                                                    value={v.size}
                                                    onChange={(e) => updateVariant(v.id, 'size', e.target.value)}
                                                    className={`w-full h-10 px-3 rounded-lg border outline-none text-sm transition-all appearance-none ${errors.variants?.[idx]?.size ? 'border-red-500' : 'border-slate-200 focus:border-primary'}`}
                                                >
                                                    <option value="">Size</option>
                                                    {availableSizes.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="py-4 px-2">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    value={v.stock}
                                                    onChange={(e) => updateVariant(v.id, 'stock', e.target.value)}
                                                    className={`w-24 h-10 px-3 rounded-lg border outline-none text-sm transition-all ${errors.variants?.[idx]?.stock ? 'border-red-500' : 'border-slate-200 focus:border-primary'}`}
                                                />
                                            </td>
                                            <td className="py-4 px-2">
                                                <input
                                                    type="number"
                                                    placeholder="+0.00"
                                                    value={v.price}
                                                    onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                                                    className={`w-24 h-10 px-3 rounded-lg border border-slate-200 outline-none text-sm focus:border-primary transition-all`}
                                                />
                                            </td>
                                            <td className="py-4 px-2 text-right">
                                                <button
                                                    onClick={() => removeVariant(v.id)}
                                                    className="w-10 h-10 text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-bold">Print Area Configuration</h3>
                        <p className="text-slate-500">Select which areas of the product can be customized by the user.</p>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {['Front Chest', 'Back (Large)', 'Left Sleeve', 'Right Sleeve', 'Neck Label'].map(zone => (
                                <label
                                    key={zone}
                                    className={`
                                        cursor-pointer flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                                        ${productData.printAreas.includes(zone) ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}
                                    `}
                                >
                                    <input
                                        type="checkbox"
                                        className="size-5 rounded border-slate-300 text-primary focus:ring-primary accent-primary"
                                        checked={productData.printAreas.includes(zone)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setProductData({ ...productData, printAreas: [...productData.printAreas, zone] });
                                            } else {
                                                setProductData({ ...productData, printAreas: productData.printAreas.filter(z => z !== zone) });
                                            }
                                        }}
                                    />
                                    <span className="font-bold text-slate-700">{zone}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="font-bold mb-2">Summary</h4>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><span className="font-bold">Name:</span> {productData.name || '---'}</p>
                                <p><span className="font-bold">Category:</span> {productData.category}</p>
                                <p><span className="font-bold">Base Price:</span> ${productData.basePrice || '0.00'}</p>
                                <p><span className="font-bold">Variants:</span> {productData.variants.length} configurations</p>
                                <p><span className="font-bold">Zones:</span> {productData.printAreas.join(', ') || 'None selected'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mt-8 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`h-12 px-8 rounded-xl font-bold flex items-center gap-2 transition-all ${currentStep === 1 ? 'opacity-0' : 'hover:bg-slate-100'}`}
                >
                    <span className="material-symbols-outlined">arrow_back</span> Back
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={handleNext}
                        className="h-12 px-8 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                    >
                        Continue <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        className="h-12 px-10 bg-primary text-[#11221c] rounded-xl font-black text-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(20,200,100,0.3)]"
                    >
                        Create Product <span className="material-symbols-outlined">check_circle</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default AddProduct;
