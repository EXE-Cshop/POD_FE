import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { designProductService } from '../services/api';

const TAB_PUBLIC = 'public';
const TAB_MY = 'my';

const CommunityDesigns = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialTab = location.state?.tab === 'my' ? TAB_MY : TAB_PUBLIC;
    const [tab, setTab] = useState(initialTab);
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        const fetchFn = tab === TAB_PUBLIC ? designProductService.getPublic : designProductService.getMyDesigns;
        fetchFn()
            .then((res) => {
                const list = res.data?.data ?? res.data ?? [];
                setDesigns(Array.isArray(list) ? list : []);
            })
            .catch((err) => {
                setError(err.response?.status === 401 ? 'Đăng nhập để xem thiết kế của bạn.' : err.message || 'Không thể tải.');
            })
            .finally(() => setLoading(false));
    }, [tab]);

    const handleUseDesign = (design) => {
        const productId = design.baseProductId || null;
        const path = productId ? `/design/${productId}` : '/design';
        const editingDesign = tab === TAB_MY ? { id: design.id, name: design.name, isPublic: design.isPublic } : null;
        navigate(path, { state: { sharedDesignId: design.id, editingDesign } });
    };

    const handleTogglePublic = async (d) => {
        try {
            await designProductService.setPublic(d.id, !d.isPublic);
            setDesigns((prev) => prev.map((x) => (x.id === d.id ? { ...x, isPublic: !x.isPublic } : x)));
        } catch (_) {}
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xóa thiết kế này?')) return;
        try {
            await designProductService.delete(id);
            setDesigns((prev) => prev.filter((x) => x.id !== id));
        } catch (_) {}
    };

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900">Thiết kế cộng đồng</h1>
                    <p className="text-slate-500 text-sm mt-1">Khám phá và sử dụng thiết kế từ cộng đồng cho sản phẩm của bạn.</p>
                </div>
            </div>

            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setTab(TAB_PUBLIC)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${tab === TAB_PUBLIC ? 'bg-primary text-[#11221c]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Cộng đồng
                </button>
                <button
                    onClick={() => setTab(TAB_MY)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${tab === TAB_MY ? 'bg-primary text-[#11221c]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    Thiết kế của tôi
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && designs.length === 0 && (
                <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">design_services</span>
                    <p className="text-slate-500 font-medium">
                        {tab === TAB_PUBLIC ? 'Chưa có thiết kế nào được chia sẻ.' : 'Bạn chưa lưu thiết kế nào.'}
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        {tab === TAB_PUBLIC ? 'Hãy tạo thiết kế và chia sẻ để mọi người sử dụng!' : 'Hãy tạo thiết kế và nhấn "Lưu thiết kế" trong trang thiết kế.'}
                    </p>
                    <button
                        onClick={() => navigate('/home/catalog')}
                        className="mt-6 px-6 py-3 bg-primary text-[#11221c] font-bold rounded-lg hover:brightness-110 transition-all"
                    >
                        Khám phá sản phẩm
                    </button>
                </div>
            )}

            {!loading && !error && designs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {designs.map((d) => (
                        <div
                            key={d.id}
                            className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all"
                        >
                            <div className="aspect-square bg-slate-100 relative">
                                {d.previewImageUrl ? (
                                    <img
                                        src={d.previewImageUrl}
                                        alt={d.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-6xl text-slate-300">image</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => handleUseDesign(d)}
                                        className="px-4 py-2 bg-primary text-[#11221c] font-bold rounded-lg text-sm hover:brightness-110 transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">edit</span>
                                        Sử dụng thiết kế
                                    </button>
                                    {tab === TAB_MY && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleTogglePublic(d)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${d.isPublic ? 'bg-emerald-500/90 text-white' : 'bg-slate-600 text-white'}`}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">{d.isPublic ? 'public' : 'lock'}</span>
                                                {d.isPublic ? 'Công khai' : 'Riêng tư'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(d.id)}
                                                className="px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">delete</span>
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-3">
                                <h3 className="font-bold text-slate-900 truncate text-sm">{d.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Người chia sẻ: {d.creatorName || 'Ẩn danh'}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{d.isPublic ? 'Công khai' : 'Riêng tư'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommunityDesigns;
