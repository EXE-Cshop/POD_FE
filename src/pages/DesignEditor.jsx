import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { baseProductService, designFeedService } from '../services/api';
import Header from '../components/common/Header';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1080&auto=format&fit=crop';

const DesignEditor = () => {
    const navigate = useNavigate();
    const { productId } = useParams();
    const location = useLocation();
    const [zoom, setZoom] = useState(85);
    const [isAdded, setIsAdded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isTryingOn, setIsTryingOn] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResetModal, setShowResetModal] = useState(false);
    const [isRemixing, setIsRemixing] = useState(false);
    const [sharedDesign, setSharedDesign] = useState(null);

    // New State for Publishing
    const [shareToCommunity, setShareToCommunity] = useState(true);
    const [copyrightCommit, setCopyrightCommit] = useState(false);

    const mockupRef = useRef(null);

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setLoading(false);
                return;
            }
            try {
                const response = await baseProductService.getById(productId);
                console.log('DesignEditor API Response:', response.data);
                setProduct(response.data?.data || response.data || null);
            } catch (err) {
                console.error('Failed to fetch product:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    // Remix logic: Fetch shared design if id exists in state
    useEffect(() => {
        const sharedDesignId = location.state?.sharedDesignId;
        if (sharedDesignId) {
            setIsRemixing(true);
            designFeedService.getById(sharedDesignId)
                .then(res => {
                    const data = res.data?.data || res.data;
                    setSharedDesign(data);
                    // In a real Fabric.js editor, we would do:
                    // canvas.loadFromJSON(data.canvasData, canvas.renderAll.bind(canvas));
                    console.log('Remixing design:', data.name);
                })
                .catch(err => console.error('Failed to load shared design:', err))
                .finally(() => setIsRemixing(false));
        }
    }, [location.state]);

    const productName = product?.name || 'Custom Product';
    const productImage = product?.imageUrl || DEFAULT_IMAGE;

    const handleAddToCart = () => {
        setIsAdded(true);
        setShowToast(true);
        setTimeout(() => setIsAdded(false), 2000);
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleTryOn = async () => {
        setIsTryingOn(true);
        try {
            if (mockupRef.current) {
                const canvas = await html2canvas(mockupRef.current, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: null,
                    scale: 2,
                });
                const dataUrl = canvas.toDataURL('image/png');
                localStorage.setItem('pod_tryon_design', dataUrl);
                navigate('/home/virtual-try-on');
            }
        } catch (err) {
            console.error('Failed to capture design:', err);
            localStorage.setItem('pod_tryon_design', productImage);
            navigate('/home/virtual-try-on');
        } finally {
            setIsTryingOn(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background-light">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light font-display text-slate-900 ">
            {/* Top Navigation Bar - Unified with Storefront */}
            <Header />


            <main className="flex flex-1 overflow-hidden">
                {/* Left Side Bar Navigation */}
                <aside className="w-16 flex flex-col items-center py-4 gap-4 border-r border-slate-200  bg-white ">
                    <button className="p-3 rounded-xl bg-primary/10 text-primary transition-colors" title="Uploads">
                        <span className="material-symbols-outlined">upload</span>
                    </button>
                    <button className="p-3 rounded-xl hover:bg-slate-100  text-slate-500  transition-colors" title="Text">
                        <span className="material-symbols-outlined">title</span>
                    </button>
                    <button className="p-3 rounded-xl hover:bg-slate-100  text-slate-500  transition-colors" title="Graphics">
                        <span className="material-symbols-outlined">category</span>
                    </button>
                    <button className="p-3 rounded-xl hover:bg-slate-100  text-slate-500  transition-colors" title="Templates">
                        <span className="material-symbols-outlined">dashboard</span>
                    </button>
                    <div className="mt-auto">
                        <button className="p-3 rounded-xl hover:bg-slate-100  text-slate-500  transition-colors">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                </aside>

                {/* Tool Drawer */}
                <aside className="w-72 bg-slate-50  border-r border-slate-200  flex flex-col">
                    <div className="p-4 border-b border-slate-200  flex justify-between items-center">
                        <h3 className="font-bold text-sm">Graphics Library</h3>
                        <span className="material-symbols-outlined text-sm cursor-pointer">search</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnq3Ot7-nElFC6KOZmoJDqS25gKQjQYHiQcl5APK-ch30_2CdcJSX9_oLBylg-2I-NCzJBVe6LuzyxQCST-QxbQoyro4ytXsjWA93orF4IUMuyrr7LPuypaIOyj2cVx3aPdCr512_KfWqjEeCYQIsSpN8VlkJHou6onT0Xw_7jrDLB_ikzlewe3fn_u0pX2iFNSPiw08F7IYgQUTlULJG7n9xZ1xl7T2oPybkIklVIAJfGPA5P0MEREQbvpCf96ztQCp0FahjOadA")' }}></div>
                            </div>
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCKRNlfdi0ms8RUj7HS4Sq6istZZjGABJefD5PbRl8PabKK9OpqF-qpgCkaBquRFN5C0ejWNcoopECqW1OYJmbILzoThxogndAbs4YS6Tr6mdVu_D2_91_l9YbGTbZI9FugC7Hv7OczbkMyE_3dOF0LDixC-ggB-8cDbpe406o7cqLxK8GfoB7iDDQv9Na2myWpMl3eVDhBqEUJgq7mIk0-kuvBm1dbCbWdeWj8NFW1vQfkcPlcd-EiyZtA6WscvcdjrlfeLJyXMxM")' }}></div>
                            </div>
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB4T7iM0bAiqlszTnU8jW56BjGdqVj2VRWl0dK184gCFsSiyyxYUQGEoH01cdod4b_fOZ_C1xE9YgZtjoD6kGPd-e0VSktsxG2KaFL3Q6kNsWEwDq6MeKNfXVq__SadaxVhq8vS2foXZxEZH0Q8q-v52hFEea16RLbiMwaO7lMzzZM9r48a8HGsm0LDw38mlT83afrPExHilyZcqeCBsZynMhZFYbFOC94UxbWTj25hkihzFI47_WPFbevlf1B5STdoylIp84LKOl4")' }}></div>
                            </div>
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuARp2FXhsnMLUhbVvxOhAWZHBjZAraArJhXGQgQ_5bKI43w1TYvBy6k9BDDgD8Vx5HovRPRtfUZc5JPsqV9a3jC7WeuEDgFD3uHGQFBx3ihCJ2BMKBSOmq3GC1otcDT3oy0EHe_jrkTwuMzUA3KgheKnfvWcX4nYILaxKF5-HnhmmT2UIsWmrnjhMJhV80YdSMgzQPMwmMwVoXcmGQc50D-pS0ha7_d75XWF1V74FVCbY9NxROQkLOQ2CrxDqAnkG85AwiMG9mx55w")' }}></div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2 border-2 border-dashed border-slate-300  rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:border-primary transition-all">
                            + Upload Custom Asset
                        </button>
                    </div>
                </aside>

                {/* Central Canvas Area */}
                <section className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]  bg-[length:20px_20px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-6 left-6 size-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm z-10"
                        title="Quay lại"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    {/* Contextual Toolbar */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white  shadow-xl rounded-xl border border-slate-200  flex items-center p-1 z-10">
                        <button className="p-2 hover:bg-slate-100  rounded-lg" title="Move">
                            <span className="material-symbols-outlined text-xl">open_with</span>
                        </button>
                        <div className="w-px h-6 bg-slate-200  mx-1"></div>
                        <button className="p-2 hover:bg-slate-100  rounded-lg" title="Duplicate">
                            <span className="material-symbols-outlined text-xl">content_copy</span>
                        </button>
                        <button className="p-2 hover:bg-slate-100  rounded-lg text-red-500" title="Delete">
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                    </div>

                    {/* Main Mockup Container */}
                    <div ref={mockupRef} className="relative w-full max-w-2xl aspect-[4/5] flex items-center justify-center">
                        {/* T-Shirt Image */}
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain drop-shadow-2xl" style={{ backgroundImage: `url("${productImage}")` }}>
                        </div>
                        {/* Print Area Bounds */}
                        <div className="relative w-1/2 h-2/3 border-2 border-dashed border-primary/40 rounded flex items-center justify-center group">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-primary/60 font-bold">Printable Area</div>
                            {/* Draggable Element Mockup */}
                            <div className="w-32 h-32 relative border-2 border-primary cursor-move">
                                <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-primary rounded-full"></div>
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain opacity-80" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBSHY-URjXSWvQ6-iF7cOxRxQurZjRsh4LPPvqvoRSn0mQPrQ10omfMBo79hH3dxwDUUWKRVhMClS4s_-SeONJtOGypzUtLSslNY13lDFYElBiOu_thTbEArorTkml0mcfllOaixgSV_pbQP75iI2VAcFQfsjSECH4fZA8VJmsaeKvjEyXIwCuXaxq61_y5VRI6c3rPOEm3pt6DEHFCcEe51kV4SWsCP-VBpe5b5tWoiD8QkyKNrBgKHM6ZTySJ5PYYebucnL1jYww")' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white  px-4 py-2 rounded-full border border-slate-200  shadow-lg">
                        <button className="material-symbols-outlined text-sm" onClick={() => setZoom(Math.max(10, zoom - 5))}>remove</button>
                        <span className="text-xs font-bold">{zoom}%</span>
                        <button className="material-symbols-outlined text-sm" onClick={() => setZoom(Math.min(200, zoom + 5))}>add</button>
                    </div>
                </section>

                {/* Right Properties Panel */}
                <aside className="w-80 bg-white  border-l border-slate-200  flex flex-col">
                    {/* Properties Tab */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 border-b border-slate-200 ">
                            <h3 className="font-bold text-sm mb-4">Transform</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">X Position</label>
                                    <input className="w-full bg-slate-50  border-slate-200  rounded text-sm focus:border-primary focus:ring-0" type="text" defaultValue="124px" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Y Position</label>
                                    <input className="w-full bg-slate-50  border-slate-200  rounded text-sm focus:border-primary focus:ring-0" type="text" defaultValue="86px" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Width</label>
                                    <input className="w-full bg-slate-50  border-slate-200  rounded text-sm focus:border-primary focus:ring-0" type="text" defaultValue="200px" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Height</label>
                                    <input className="w-full bg-slate-50  border-slate-200  rounded text-sm focus:border-primary focus:ring-0" type="text" defaultValue="200px" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Scale</label>
                                    <span className="text-xs font-medium">100%</span>
                                </div>
                                <input className="w-full accent-primary h-1 bg-slate-200  rounded-lg appearance-none cursor-pointer" type="range" />
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-slate-500 uppercase font-bold">Rotation</label>
                                    <span className="text-xs font-medium">0°</span>
                                </div>
                                <input className="w-full accent-primary h-1 bg-slate-200  rounded-lg appearance-none cursor-pointer" type="range" />
                            </div>
                        </div>
                        {/* Layers Section */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm">Layers</h3>
                                <span className="material-symbols-outlined text-sm">layers</span>
                            </div>
                            <div className="space-y-2">
                                {/* Layer Item 1 (Selected) */}
                                <div className="flex items-center gap-3 p-2 bg-primary/10 border border-primary/30 rounded-lg">
                                    <span className="material-symbols-outlined text-sm text-slate-400">drag_indicator</span>
                                    <div className="size-8 bg-white  rounded flex items-center justify-center p-1">
                                        <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBq4k5_5jgHEHxHE9su38NoVW_VdpMgzTTku8wXUk98MLvs4JmFt1xqXxdolboAmv1tFJbAguQcK7ii59Jbc8I7cX62azN_R33_2sDJZrg9GxzuaDhglLYfRXd-Ay7e820zjU9YR5NEU2F9FXILhNFKvd0b1kuITBeDuQJIdEDYjucrIj-eVSqultx-HfjvxWxpAlPdkKRwJynxsQ0NbydKjDAI6I2LhONkHHMteg1CX9uY-fkEatjWzNZ6fz2I9NPL_P_1viqe5U")' }}></div>
                                    </div>
                                    <span className="text-xs font-bold flex-1 truncate">Mountain_Graphic_01</span>
                                    <div className="flex gap-2">
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">visibility</span>
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">lock_open</span>
                                    </div>
                                </div>
                                {/* Layer Item 2 */}
                                <div className="flex items-center gap-3 p-2 hover:bg-slate-50  border border-transparent rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-sm text-slate-400">drag_indicator</span>
                                    <div className="size-8 bg-slate-100  rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">title</span>
                                    </div>
                                    <span className="text-xs font-medium flex-1 truncate">Adventure Text</span>
                                    <div className="flex gap-2 text-slate-400">
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">visibility</span>
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">lock_open</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Action Area */}
                    <div className="p-4 bg-slate-50  border-t border-slate-200 space-y-3">
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-bold transition-all duration-300 ${isAdded
                                ? 'bg-slate-100 text-slate-400 cursor-default'
                                : 'bg-primary text-[#11221c] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0'
                                }`}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {isAdded ? 'check_circle' : 'shopping_cart'}
                            </span>
                            <span>{isAdded ? 'Design Finished' : 'Add to Cart'}</span>
                        </button>

                        {/* Remix / Shared Info Badge */}
                        {sharedDesign && (
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                <div className="size-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-500 text-sm">auto_fix_high</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-blue-400 font-bold uppercase">Remixing</p>
                                    <p className="text-xs font-bold text-slate-700 truncate">{sharedDesign.name}</p>
                                </div>
                            </div>
                        )}

                        {/* Publish Options */}
                        <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">public</span>
                                    <span className="text-xs font-bold text-slate-700">Chia sẻ thiết kế</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={shareToCommunity}
                                        onChange={() => setShareToCommunity(!shareToCommunity)}
                                    />
                                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {shareToCommunity && (
                                <div className="flex items-start gap-2 animate-fade-in">
                                    <input
                                        type="checkbox"
                                        id="copyright"
                                        className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary w-3.5 h-3.5"
                                        checked={copyrightCommit}
                                        onChange={() => setCopyrightCommit(!copyrightCommit)}
                                    />
                                    <label htmlFor="copyright" className="text-[10px] text-slate-500 leading-tight">
                                        Tôi cam kết sở hữu bản quyền hình ảnh và đồng ý chia sẻ với cộng đồng.
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleTryOn}
                                disabled={isTryingOn}
                                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-white transition-all text-xs font-bold shadow-sm disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">{isTryingOn ? 'sync' : 'shirt'}</span>
                                <span>{isTryingOn ? 'Đang chuẩn bị...' : 'Try On (3D)'}</span>
                            </button>
                            <button
                                onClick={() => setShowResetModal(true)}
                                className="flex items-center justify-center aspect-square h-10 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                                title="Reset thiết kế"
                            >
                                <span className="material-symbols-outlined text-lg">restart_alt</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </main>

            {/* Toast Notification */}
            <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="bg-slate-900 border border-slate-700 text-white p-4 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center gap-4 min-w-[320px]">
                    <div className="size-10 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">check_circle</span>
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-white text-sm">Design Saved & Added</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Custom {productName}</p>
                    </div>
                    <button
                        onClick={() => navigate('/home/cart')}
                        className="px-4 py-2 bg-primary text-[#11221c] text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        View Cart
                    </button>
                    <button onClick={() => setShowToast(false)} className="text-slate-500 hover:text-white transition-colors absolute top-2 right-2">
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
            </div>

            {/* ── Reset Confirmation Modal ────────────────────────────── */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowResetModal(false)}>
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="size-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-3xl">restart_alt</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Reset thiết kế?</h3>
                        <p className="text-sm text-slate-500 mb-6">Bạn có chắc chắn muốn xóa toàn bộ thiết kế hiện tại không? Hành động này không thể hoàn tác.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => {
                                    // In this mock editor, reset just means closing the modal
                                    // or resetting the zoom if needed.
                                    setZoom(85);
                                    setShowResetModal(false);
                                }}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                            >
                                Reset ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesignEditor;
