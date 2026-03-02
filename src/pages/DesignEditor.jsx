import { useNavigate } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import AIChatbox from '../components/AIChatbox';

const DesignEditor = () => {
    const navigate = useNavigate();
    const [zoom, setZoom] = useState(85);
    const [isAdded, setIsAdded] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [isTryingOn, setIsTryingOn] = useState(false);
    const mockupRef = useRef(null);

    const handleAddToCart = () => {
        setIsAdded(true);
        setShowToast(true);
        setTimeout(() => setIsAdded(false), 2000);
        setTimeout(() => setShowToast(false), 4000);
    };

    const [isReviewingDesign, setIsReviewingDesign] = useState(false);

    // AI Review: capture design and send to chatbot
    const handleAIReview = async () => {
        setIsReviewingDesign(true);
        try {
            if (mockupRef.current) {
                const canvas = await html2canvas(mockupRef.current, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scale: 1,
                });
                const dataUrl = canvas.toDataURL('image/png');
                localStorage.setItem('pod_design_for_review', dataUrl);
                // Dispatch custom event for AIChatbox to pick up
                window.dispatchEvent(new CustomEvent('pod-design-review', { detail: { image: dataUrl } }));
            }
        } catch (err) {
            console.error('Failed to capture design for review:', err);
        } finally {
            setIsReviewingDesign(false);
        }
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
            // Fallback: use the t-shirt image URL directly
            localStorage.setItem('pod_tryon_design', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXOBH11sjOJZgf-HI_Rc11_MqGEZatI6ZyvXVpjSc4O5K7-4lmPWMBlqCnkRFt-oCOHux0yRDIyztvyee1EDDtvHN7aVr6-y318SBpMWwGa4D40v3Jps-iEyByG9wW5rXoXddAAAx3qa8KsIsjD0CiCPwGgYqt9AZy1CfJDFVZw5amtcojSPm3IpY4h5TJcfGtdJMJ2wh4YyRkXfUt5rbXpbNtFm1C1JZq5aor2YYaiRDty8KF_xZYuRgHFWwuO2nxTTSibc2XSVE');
            navigate('/home/virtual-try-on');
        } finally {
            setIsTryingOn(false);
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background-light  font-display text-slate-900 ">
            {/* Top Navigation Bar - Unified with Storefront */}
            <header className="flex items-center justify-between border-b border-solid border-slate-200 px-6 py-3 bg-white z-50">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center size-10 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
                        title="Back to Shop"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    {/* Branding */}
                    <div className="flex items-center gap-3 border-r border-slate-200 pr-4 md:pr-6 cursor-pointer" onClick={() => navigate('/home')}>
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-[#11221c]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight hidden sm:block">POD Print</h2>
                    </div>

                    {/* Editor Info */}
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-sm font-bold leading-tight tracking-tight">Design Editor</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Customizing: Classic Tee</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Editor Tools */}
                    <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 border-r border-slate-200">
                        <button className="hidden sm:flex min-w-[84px] items-center justify-center rounded-lg h-9 px-4 border border-slate-300 hover:bg-slate-100 text-sm font-bold transition-all">
                            <span>Preview</span>
                        </button>
                        <button
                            onClick={handleAIReview}
                            disabled={isReviewingDesign}
                            className="hidden sm:flex min-w-[100px] items-center justify-center rounded-lg h-9 px-4 bg-gradient-to-r from-purple-500/20 to-pink-100 border border-purple-500/30 text-sm font-bold text-purple-900 hover:from-purple-500/30 hover:to-pink-200 transition-all gap-1.5 disabled:opacity-50"
                            title="AI reviews your design"
                        >
                            <span className="material-symbols-outlined text-[16px]">{isReviewingDesign ? 'hourglass_top' : 'auto_awesome'}</span>
                            <span>{isReviewingDesign ? 'Capturing...' : '🤖 AI Review'}</span>
                        </button>
                        <button
                            onClick={handleTryOn}
                            disabled={isTryingOn}
                            className="hidden sm:flex min-w-[100px] items-center justify-center rounded-lg h-9 px-4 bg-gradient-to-r from-primary/20 to-emerald-100 border border-primary/30 text-sm font-bold text-[#11221c] hover:from-primary/30 hover:to-emerald-200 transition-all gap-1.5 disabled:opacity-50"
                            title="Try this design on your photo"
                        >
                            <span className="material-symbols-outlined text-[16px]">{isTryingOn ? 'hourglass_top' : 'checkroom'}</span>
                            <span>{isTryingOn ? 'Capturing...' : 'Try On 👕'}</span>
                        </button>
                        <button
                            onClick={handleAddToCart}
                            disabled={isAdded}
                            className={`flex min-w-[110px] items-center justify-center rounded-lg h-9 px-4 text-sm font-bold transition-all duration-300 gap-2 ${isAdded
                                ? 'bg-primary text-[#11221c] shadow-[0_0_15px_rgba(20,200,100,0.3)]'
                                : 'bg-primary text-[#11221c] shadow-lg shadow-primary/20 hover:scale-105'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {isAdded ? 'check_circle' : 'shopping_cart'}
                            </span>
                            <span>{isAdded ? 'Added!' : 'Finish Design'}</span>
                        </button>
                    </div>

                    {/* Store Links */}
                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <button
                            onClick={() => navigate('/home/cart')}
                            className="relative size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors group cursor-pointer"
                            title="View Cart"
                        >
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">shopping_cart</span>
                            <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[#11221c] text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">3</span>
                        </button>

                        {/* User Profile */}
                        <button
                            onClick={() => navigate('/home/login')}
                            className="flex items-center justify-center size-10 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Sign In / Account"
                        >
                            <span className="material-symbols-outlined text-slate-600 hover:text-primary transition-colors text-[24px]">account_circle</span>
                        </button>
                    </div>
                </div>
            </header>

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
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3aSdC4vc9KQuH_6oHIA-mLUlZs9heuxOFu8sqMPtw4guG5ZMmWTVzFkTwxCtlrTgyK_Xghxcl0cEmKJFfHbD6eYCh2MW8UsHUx-Jy9VPXjfVrrw0avyD-AsfRZ2sawIO3h_1i2-r-v5fTcMcu5dgxpykoVqFvY2kq_qlS9OhAMCgwXGXvKWxvYgL8ZExIVFLWcYc_jIAw7z_oiU9kClc_l_pcpgiMOrXBPU65McC2iQLjpyEoMeNpUed9Y-LslSUBaNI3w6-yu18")' }}></div>
                            </div>
                            <div className="group relative aspect-square bg-white  rounded-lg border border-slate-200  p-2 hover:border-primary transition-all cursor-pointer">
                                <div className="w-full h-full bg-center bg-no-repeat bg-contain" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCIY_6U8Lc_gTrZKu9EReo05GGo-DBtbIde-pflAmomYWSHiT0rsWTnvGvzwJHDgflbaFth7rHZ30DPNvBwIyLBUiHY1-3Dn02VYrG2OlODH8IXP0A1eM2wxRrgkINW6-WYCZinUyIS_xR_YUuy2iO4Y_q5vOUpB5rEzCubGmSgvHFE9qf0DBWYMQ_G6Sxcj198bffbZKfJbNWmNlS572eie64MxVPqBPYM9dh-nelS_R74WFGpkZVK8tbhgaGNlHtgxxe1ZFpHza0")' }}></div>
                            </div>
                        </div>
                        <button className="w-full mt-6 py-2 border-2 border-dashed border-slate-300  rounded-lg text-xs font-medium text-slate-500 hover:text-primary hover:border-primary transition-all">
                            + Upload Custom Asset
                        </button>
                    </div>
                </aside>

                {/* Central Canvas Area */}
                <section className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)]  bg-[length:20px_20px]">
                    {/* Contextual Toolbar */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white  shadow-2xl rounded-xl border border-slate-200  flex items-center p-1 z-10">
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
                        <div className="w-px h-6 bg-slate-200  mx-1"></div>
                        <button className="flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold" title="Reset Canvas">
                            <span className="material-symbols-outlined text-sm">restart_alt</span>
                            <span>Reset</span>
                        </button>
                    </div>

                    {/* Main Mockup Container */}
                    <div ref={mockupRef} className="relative w-full max-w-2xl aspect-[4/5] flex items-center justify-center">
                        {/* T-Shirt Image */}
                        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain drop-shadow-2xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDXOBH11sjOJZgf-HI_Rc11_MqGEZatI6ZyvXVpjSc4O5K7-4lmPWMBlqCnkRFt-oCOHux0yRDIyztvyee1EDDtvHN7aVr6-y318SBpMWwGa4D40v3Jps-iEyByG9wW5rXoXddAAAx3qa8KsIsjD0CiCPwGgYqt9AZy1CfJDFVZw5amtcojSPm3IpY4h5TJcfGtdJMJ2wh4YyRkXfUt5rbXpbNtFm1C1JZq5aor2YYaiRDty8KF_xZYuRgHFWwuO2nxTTSibc2XSVE")' }}>
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
                                {/* Layer Item 3 */}
                                <div className="flex items-center gap-3 p-2 opacity-50 hover:bg-slate-50  border border-transparent rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-sm text-slate-400">drag_indicator</span>
                                    <div className="size-8 bg-slate-100  rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">image</span>
                                    </div>
                                    <span className="text-xs font-medium flex-1 truncate">Logo_Overlay</span>
                                    <div className="flex gap-2">
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">visibility_off</span>
                                        <span className="material-symbols-outlined text-sm cursor-pointer hover:text-primary">lock</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Color Palette / Helper */}
                    <div className="p-4 bg-slate-50  border-t border-slate-200 ">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-wider">Garment Color</p>
                        <div className="flex gap-2">
                            <button className="size-6 rounded-full border-2 border-primary bg-white ring-2 ring-white "></button>
                            <button className="size-6 rounded-full bg-black"></button>
                            <button className="size-6 rounded-full bg-slate-500"></button>
                            <button className="size-6 rounded-full bg-blue-900"></button>
                            <button className="size-6 rounded-full bg-red-800"></button>
                            <button className="size-6 rounded-full border border-slate-300  flex items-center justify-center">
                                <span className="material-symbols-outlined text-[10px]">palette</span>
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
                        <p className="text-xs text-slate-400 mt-0.5">Custom T-Shirt (Project: Summer_Collection_2024)</p>
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
            <AIChatbox />
        </div>
    );
};

export default DesignEditor;
