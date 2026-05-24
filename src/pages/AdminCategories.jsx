import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/api';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({
        name: '',
        description: '',
        imageUrl: '',
        sortOrder: 0,
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await categoryService.getAll();
            setCategories(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Could not load categories. Please check if you have admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openAddModal = () => {
        setCurrentCategory({
            name: '',
            description: '',
            imageUrl: '',
            sortOrder: 0,
            active: true
        });
        setEditingId(null);
        setError('');
        setModalOpen(true);
    };

    const openEditModal = (cat) => {
        setCurrentCategory({
            name: cat.name,
            description: cat.description || '',
            imageUrl: cat.imageUrl || '',
            sortOrder: cat.sortOrder || 0,
            active: cat.active ?? true
        });
        setEditingId(cat.id);
        setError('');
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentCategory.name.trim()) {
            setError('Category name is required.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            if (editingId) {
                await categoryService.update(editingId, currentCategory);
            } else {
                await categoryService.create(currentCategory);
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err) {
            console.error('Error saving category:', err);
            setError(err.response?.data?.message || 'Error saving category.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? All products under it will be unlinked.')) {
            return;
        }

        try {
            await categoryService.delete(id);
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            alert(err.response?.data?.message || 'Could not delete category. Make sure you have appropriate rights.');
        }
    };

    return (
        <div className="p-6 font-display w-full h-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-gray-900 font-extrabold text-2xl tracking-tight">Category Collections</h1>
                    <p className="text-gray-500 text-xs mt-1">Manage active style categories for the trend catalog.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-5 rounded-2xl shadow-lg transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Category
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                    {error}
                </div>
            )}

            {/* Category Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-grow flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Image</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Name / Slug</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Description</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Sort Order</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Status</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Retrieving categories...</span>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                                        No categories found. Click 'New Category' to create one.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((cat) => (
                                    <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="size-12 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center border border-gray-200/50">
                                                {cat.imageUrl ? (
                                                    <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-gray-400">category</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold text-sm">{cat.name}</span>
                                                <span className="text-gray-400 text-xs mt-0.5">{cat.slug}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs truncate text-gray-500 text-xs">
                                            {cat.description || 'No description provided.'}
                                        </td>
                                        <td className="p-4 text-gray-900 font-bold text-sm text-center sm:text-left">
                                            {cat.sortOrder}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                cat.active 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                                {cat.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(cat)}
                                                    className="size-8 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary/10 hover:text-emerald-700 transition-colors flex items-center justify-center"
                                                    title="Edit Category"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="size-8 rounded-xl bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center"
                                                    title="Delete Category"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-gray-900 font-extrabold text-base">
                                {editingId ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-4">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category Name</label>
                                <input
                                    type="text"
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                                    placeholder="Streetwear, Minimalist, Vintage..."
                                    className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    rows="3"
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                                    placeholder="Category description for customer banner..."
                                    className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                                ></textarea>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Image URL</label>
                                <input
                                    type="text"
                                    value={currentCategory.imageUrl}
                                    onChange={(e) => setCurrentCategory({...currentCategory, imageUrl: e.target.value})}
                                    placeholder="Image link (Unsplash or Cloudinary)..."
                                    className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sort Order</label>
                                    <input
                                        type="number"
                                        value={currentCategory.sortOrder}
                                        onChange={(e) => setCurrentCategory({...currentCategory, sortOrder: Number(e.target.value) || 0})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 justify-end">
                                    <label className="flex items-center gap-2 cursor-pointer py-3 select-none text-xs font-bold text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={currentCategory.active}
                                            onChange={(e) => setCurrentCategory({...currentCategory, active: e.target.checked})}
                                            className="size-4 border-gray-300 rounded focus:ring-primary"
                                        />
                                        Category Active
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-3 border border-gray-100 hover:bg-gray-50 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-6 rounded-2xl shadow-lg transition-colors flex items-center gap-1.5"
                                >
                                    {submitting ? 'Saving...' : 'Save Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
