import React from 'react';

const PrintAreas = () => {
    // Mock data for print areas
    const printAreas = [
        { id: 'PA-001', name: 'Standard Front Chest', dimensions: '12" x 16"', type: 'DTG', compatibility: ['T-Shirts', 'Hoodies'], status: 'Active' },
        { id: 'PA-002', name: 'Back Large', dimensions: '14" x 18"', type: 'DTG', compatibility: ['T-Shirts', 'Hoodies', 'Jackets'], status: 'Active' },
        { id: 'PA-003', name: 'Left Sleeve', dimensions: '4" x 4"', type: 'DTG/Embroidery', compatibility: ['Long Sleeve Tees', 'Hoodies'], status: 'Active' },
        { id: 'PA-004', name: 'Pocket Logo', dimensions: '3.5" x 3.5"', type: 'Embroidery', compatibility: ['Polos', 'Jackets'], status: 'Active' },
        { id: 'PA-005', name: 'Inside Label', dimensions: '2.5" x 2.5"', type: 'DTF', compatibility: ['All Apparel'], status: 'Inactive' },
    ];

    return (
        <div className="flex-1 overflow-auto bg-background-light min-h-screen font-display text-slate-900">
            <main className="max-w-[1200px] mx-auto px-6 py-10">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">Print Areas</h1>
                        <p className="text-slate-500">Manage standard print zones and dimensions for your product catalog.</p>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background-dark rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                        <span className="material-symbols-outlined text-[20px]">add_box</span>
                        New Print Area
                    </button>
                </div>

                {/* Stats / Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                                <span className="material-symbols-outlined">aspect_ratio</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Areas</p>
                                <p className="text-2xl font-black text-slate-900">{printAreas.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Zones</p>
                                <p className="text-2xl font-black text-slate-900">{printAreas.filter(p => p.status === 'Active').length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                                <span className="material-symbols-outlined">print</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Print Types</p>
                                <p className="text-2xl font-black text-slate-900">4</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input 
                                className="w-full h-12 pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                                placeholder="Search print areas..." 
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button className="h-12 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filter
                        </button>
                    </div>
                </div>

                {/* Print Areas Table */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="px-6 py-4">Name / ID</th>
                                    <th className="px-6 py-4">Dimensions</th>
                                    <th className="px-6 py-4">Technique</th>
                                    <th className="px-6 py-4">Compatible Products</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {printAreas.map((area) => (
                                    <tr key={area.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-900">{area.name}</p>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{area.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-400 text-[18px]">square_foot</span>
                                                <span className="text-sm font-medium text-slate-700">{area.dimensions}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                                                {area.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {area.compatibility.map((item, idx) => (
                                                    <span key={idx} className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                area.status === 'Active' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                                <span className={`size-1.5 rounded-full ${area.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {area.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="border-t border-slate-200 p-4 flex items-center justify-between">
                        <p className="text-sm text-slate-500">Showing 1-5 of 5 areas</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrintAreas;
