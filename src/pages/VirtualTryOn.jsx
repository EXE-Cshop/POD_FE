import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

const SAMPLE_PRODUCTS = [
    {
        id: 1,
        name: 'Classic Tee - Mountain',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXOBH11sjOJZgf-HI_Rc11_MqGEZatI6ZyvXVpjSc4O5K7-4lmPWMBlqCnkRFt-oCOHux0yRDIyztvyee1EDDtvHN7aVr6-y318SBpMWwGa4D40v3Jps-iEyByG9wW5rXoXddAAAx3qa8KsIsjD0CiCPwGgYqt9AZy1CfJDFVZw5amtcojSPm3IpY4h5TJcfGtdJMJ2wh4YyRkXfUt5rbXpbNtFm1C1JZq5aor2YYaiRDty8KF_xZYuRgHFWwuO2nxTTSibc2XSVE',
    },
    {
        id: 2,
        name: 'Classic Heavyweight Tee',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU',
    },
];

const VirtualTryOn = () => {
    const navigate = useNavigate();
    const personFileRef = useRef(null);
    const garmentFileRef = useRef(null);
    const personInputRef = useRef(null);
    const garmentInputRef = useRef(null);

    const [personPhoto, setPersonPhoto] = useState(null);
    const [garmentImage, setGarmentImage] = useState(null);
    const [garmentSource, setGarmentSource] = useState(null); // 'upload', 'sample', 'editor'

    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState('');
    const [aiResultImage, setAiResultImage] = useState(null);
    const [aiError, setAiError] = useState(null);
    const [originalPersonSize, setOriginalPersonSize] = useState({ width: 0, height: 0 });

    // Load design from localStorage (from DesignEditor)
    useEffect(() => {
        const savedDesign = localStorage.getItem('pod_tryon_design');
        if (savedDesign) {
            setGarmentImage(savedDesign);
            setGarmentSource('editor');
        }
    }, []);

    // Handle person photo upload
    const handlePersonUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        personFileRef.current = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setPersonPhoto(dataUrl);
            resetResult();
            // Đọc kích thước ảnh gốc
            const img = new Image();
            img.onload = () => {
                setOriginalPersonSize({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Handle garment image upload
    const handleGarmentUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        garmentFileRef.current = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setGarmentImage(ev.target.result);
            setGarmentSource('upload');
            resetResult();
        };
        reader.readAsDataURL(file);
    };

    // Select sample product
    const handleSelectSample = (product) => {
        setGarmentImage(product.image);
        setGarmentSource('sample');
        garmentFileRef.current = null;
        resetResult();
    };

    // Person photo drag & drop
    const handlePersonDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            personFileRef.current = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                setPersonPhoto(dataUrl);
                resetResult();
                // Đọc kích thước ảnh gốc
                const img = new Image();
                img.onload = () => {
                    setOriginalPersonSize({ width: img.naturalWidth, height: img.naturalHeight });
                };
                img.src = dataUrl;
            };
            reader.readAsDataURL(file);
        }
    }, []);

    // Garment drag & drop
    const handleGarmentDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            garmentFileRef.current = file;
            const reader = new FileReader();
            reader.onload = (ev) => {
                setGarmentImage(ev.target.result);
                setGarmentSource('upload');
                resetResult();
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    const resetResult = () => {
        setAiResultImage(null);
        setAiError(null);
    };

    // Resize ảnh kết quả về kích thước ảnh gốc của khách hàng
    const resizeImageToMatch = (blobUrl, targetWidth, targetHeight) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                canvas.toBlob((blob) => {
                    resolve(URL.createObjectURL(blob));
                }, 'image/png');
            };
            img.src = blobUrl;
        });
    };

    // Helper: Convert data URL to Blob
    const dataUrlToBlob = async (dataUrl) => {
        const res = await fetch(dataUrl);
        return res.blob();
    };

    // Helper: Fetch image URL as Blob
    const fetchImageAsBlob = async (url) => {
        if (url.startsWith('data:')) {
            return dataUrlToBlob(url);
        }
        try {
            const res = await fetch(url);
            return res.blob();
        } catch {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    canvas.toBlob(resolve, 'image/png');
                };
                img.onerror = reject;
                img.src = url;
            });
        }
    };

    // Process AI try-on
    const handleAITryOn = async () => {
        if (!personPhoto || !garmentImage) return;

        setIsProcessing(true);
        setAiError(null);
        setAiResultImage(null);
        setProcessingStep('upload');

        try {
            const formData = new FormData();

            // Person image
            if (personFileRef.current) {
                formData.append('personImage', personFileRef.current);
            } else {
                const personBlob = await dataUrlToBlob(personPhoto);
                formData.append('personImage', personBlob, 'person.png');
            }

            // Garment image
            if (garmentFileRef.current) {
                formData.append('garmentImage', garmentFileRef.current);
            } else {
                const garmentBlob = await fetchImageAsBlob(garmentImage);
                formData.append('garmentImage', garmentBlob, 'garment.png');
            }

            setProcessingStep('describe');

            // Simulate step progress (backend does both steps)
            const progressTimer = setTimeout(() => {
                setProcessingStep('generate');
            }, 5000);

            const response = await fetch(`${API_BASE_URL}/api/v1/virtual-tryon`, {
                method: 'POST',
                body: formData,
            });

            clearTimeout(progressTimer);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `Lỗi server: ${response.status}`);
            }

            const blob = await response.blob();
            let resultUrl = URL.createObjectURL(blob);

            // Resize ảnh kết quả về kích thước ảnh gốc của khách hàng
            if (originalPersonSize.width > 0 && originalPersonSize.height > 0) {
                resultUrl = await resizeImageToMatch(resultUrl, originalPersonSize.width, originalPersonSize.height);
            }

            setAiResultImage(resultUrl);

        } catch (err) {
            console.error('AI Try-On failed:', err);
            setAiError(err.message || 'Đã xảy ra lỗi khi xử lý AI Try-On');
        } finally {
            setIsProcessing(false);
            setProcessingStep('');
        }
    };

    // Download result
    const handleDownload = () => {
        if (!aiResultImage) return;
        const link = document.createElement('a');
        link.download = 'virtual-tryon-result.png';
        link.href = aiResultImage;
        link.click();
    };

    // Reset everything
    const handleReset = () => {
        setPersonPhoto(null);
        setGarmentImage(null);
        setGarmentSource(null);
        setAiResultImage(null);
        setAiError(null);
        personFileRef.current = null;
        garmentFileRef.current = null;
    };

    const stepMessages = {
        upload: { icon: '📤', text: 'Đang tải ảnh lên server...' },
        describe: { icon: '🔍', text: 'Bước 1: AI đang phân tích quần áo...' },
        generate: { icon: '🎨', text: 'Bước 2: AI đang tạo ảnh thử đồ... (30-60s)' },
    };

    const currentStep = stepMessages[processingStep] || stepMessages.upload;

    return (
        <div className="min-h-screen bg-background-light">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-background-dark via-slate-900 to-emerald-950 py-12 md:py-16">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-emerald-400/20 rounded-full blur-[80px]"></div>
                </div>
                <div className="relative max-w-[1440px] mx-auto px-6 md:px-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                        <span className="material-symbols-outlined text-primary text-sm">checkroom</span>
                        <span className="text-primary text-xs font-bold uppercase tracking-widest">AI Virtual Try-On</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                        Phòng Thử Đồ <span className="text-primary">Ảo AI</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Thử đồ tại nhà — không cần đến cửa hàng. Tiết kiệm thời gian, chọn đúng sản phẩm yêu thích trước khi đặt mua.
                    </p>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[
                        { num: 1, label: 'Upload ảnh bạn', icon: 'person', done: !!personPhoto },
                        { num: 2, label: 'Chọn quần áo', icon: 'checkroom', done: !!garmentImage },
                        { num: 3, label: 'Xem kết quả AI', icon: 'auto_awesome', done: !!aiResultImage },
                    ].map((step, i) => (
                        <React.Fragment key={step.num}>
                            <div className="flex items-center gap-2">
                                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step.done
                                    ? 'bg-primary text-[#11221c] shadow-lg shadow-primary/30'
                                    : 'bg-slate-200 text-slate-500'
                                    }`}>
                                    {step.done ? (
                                        <span className="material-symbols-outlined text-[18px]">check</span>
                                    ) : step.num}
                                </div>
                                <span className={`text-sm font-semibold hidden md:block ${step.done ? 'text-primary' : 'text-slate-500'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {i < 2 && <div className={`w-12 md:w-20 h-0.5 ${step.done ? 'bg-primary' : 'bg-slate-200'} rounded-full`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Main Content: If we have AI result, show it full width */}
                {aiResultImage ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Result Display */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                                    Kết quả AI Virtual Try-On
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">download</span>
                                        Tải ảnh
                                    </button>
                                    <button
                                        onClick={() => navigate('/home/cart')}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-[#11221c] rounded-lg text-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>

                            {/* Before/After display */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                                {/* Before - Person */}
                                <div className="relative bg-slate-50 p-4 border-r border-slate-100">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Ảnh gốc</p>
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-slate-200">
                                        <img src={personPhoto} alt="Original" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                                {/* + Garment */}
                                <div className="relative bg-slate-50 p-4 border-r border-slate-100 flex flex-col">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Quần áo</p>
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center">
                                        <img src={garmentImage} alt="Garment" className="max-w-full max-h-full object-contain" />
                                    </div>
                                </div>
                                {/* = Result */}
                                <div className="relative bg-gradient-to-br from-primary/5 to-emerald-50 p-4">
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                        Kết quả AI
                                    </p>
                                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border-2 border-primary/20 shadow-lg shadow-primary/10">
                                        <img src={aiResultImage} alt="AI Result" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                    Thử lại từ đầu
                                </button>
                                <button
                                    onClick={() => { resetResult(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-[#11221c] rounded-lg text-sm font-black hover:brightness-110 transition-all shadow-lg shadow-primary/30"
                                >
                                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                    Thử đồ AI lần nữa
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Upload & Selection UI */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Person Photo Upload */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="size-7 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                                    </span>
                                    1. Upload ảnh của bạn
                                </h3>
                                <div
                                    onClick={() => personInputRef.current?.click()}
                                    onDrop={handlePersonDrop}
                                    onDragOver={handleDragOver}
                                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary/5 ${personPhoto ? 'border-primary bg-primary/5' : 'border-slate-300'}`}
                                >
                                    {personPhoto ? (
                                        <div className="space-y-3">
                                            <div className="w-full aspect-[3/4] max-h-[300px] rounded-xl overflow-hidden bg-white border border-primary/20 mx-auto">
                                                <img src={personPhoto} alt="Your photo" className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-sm text-primary font-semibold">✓ Ảnh đã upload</p>
                                            <p className="text-xs text-slate-400">Click để đổi ảnh khác</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 py-6">
                                            <div className="size-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-slate-400 text-[32px]">cloud_upload</span>
                                            </div>
                                            <p className="text-sm text-slate-600 font-medium">Kéo thả hoặc click để upload</p>
                                            <p className="text-xs text-slate-400">Ảnh chân dung/toàn thân • PNG, JPG (max 10MB)</p>
                                        </div>
                                    )}
                                    <input
                                        ref={personInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePersonUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Tips for best results */}
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-start gap-2.5">
                                        <span className="material-symbols-outlined text-amber-500 text-[20px] mt-0.5 flex-shrink-0">tips_and_updates</span>
                                        <div>
                                            <p className="text-sm font-bold text-amber-800 mb-2">Mẹo để có kết quả đẹp nhất</p>
                                            <ul className="text-xs text-amber-700 space-y-1.5 list-none">
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-amber-500 mt-0.5">✓</span>
                                                    <span>Dùng ảnh <strong>toàn thân hoặc nửa thân trên</strong>, đứng thẳng, mặt hướng về phía trước</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-amber-500 mt-0.5">✓</span>
                                                    <span>Nền ảnh <strong>đơn giản, sáng màu</strong> (tường trắng, nền trơn)</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-amber-500 mt-0.5">✓</span>
                                                    <span>Ánh sáng <strong>đều, rõ ràng</strong> — tránh ảnh tối hoặc ngược sáng</span>
                                                </li>
                                                <li className="flex items-start gap-1.5">
                                                    <span className="text-amber-500 mt-0.5">✗</span>
                                                    <span>Tránh ảnh <strong>bị cắt xén</strong>, tay khoanh, hoặc đang ngồi</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Garment Upload */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="size-7 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[16px]">checkroom</span>
                                    </span>
                                    2. Chọn quần áo
                                </h3>

                                {/* Upload garment */}
                                <div
                                    onClick={() => garmentInputRef.current?.click()}
                                    onDrop={handleGarmentDrop}
                                    onDragOver={handleDragOver}
                                    className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary/5 mb-4 ${garmentSource === 'upload' ? 'border-primary bg-primary/5' : 'border-slate-300'}`}
                                >
                                    {garmentSource === 'upload' && garmentImage ? (
                                        <div className="flex items-center gap-3">
                                            <div className="size-16 rounded-lg overflow-hidden bg-white border border-primary/20 flex-shrink-0">
                                                <img src={garmentImage} alt="Garment" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-bold text-slate-900">Ảnh áo đã upload</p>
                                                <p className="text-xs text-primary font-medium">Click để đổi ảnh khác</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 py-1">
                                            <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                <span className="material-symbols-outlined text-slate-400 text-[20px]">upload</span>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm text-slate-600 font-medium">Upload ảnh quần áo</p>
                                                <p className="text-xs text-slate-400">PNG, JPG, WEBP</p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={garmentInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleGarmentUpload}
                                        className="hidden"
                                    />
                                </div>

                                {/* Design from Editor */}
                                {garmentSource === 'editor' && garmentImage && (
                                    <div className="mb-4 p-3 bg-gradient-to-r from-primary/10 to-emerald-50 border border-primary/20 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 rounded-lg border border-primary/30 overflow-hidden bg-white flex-shrink-0">
                                                <img src={garmentImage} alt="Design" className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900">Thiết kế của bạn</p>
                                                <p className="text-xs text-primary font-medium">Từ Design Editor ✓</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sample Products */}
                                <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
                                    {garmentImage ? 'Hoặc chọn mẫu:' : 'Hoặc chọn sản phẩm mẫu:'}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {SAMPLE_PRODUCTS.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelectSample(product)}
                                            className={`rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.02] ${garmentSource === 'sample' && garmentImage === product.image
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            <div className="aspect-square bg-slate-50">
                                                <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                            </div>
                                            <p className="text-[11px] font-semibold text-center py-2 px-1 truncate">{product.name}</p>
                                        </button>
                                    ))}
                                </div>

                                {!garmentImage && (
                                    <button
                                        onClick={() => navigate('/design')}
                                        className="w-full mt-4 py-3 border-2 border-dashed border-primary/40 rounded-xl text-primary text-sm font-bold hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">palette</span>
                                        Tự thiết kế áo mới
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Center + Right: Preview / Processing */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-[20px]">preview</span>
                                        Preview
                                    </h3>
                                </div>

                                {/* Canvas Area */}
                                <div className="relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] min-h-[500px] flex items-center justify-center overflow-hidden">
                                    {!personPhoto && !garmentImage ? (
                                        /* Empty State */
                                        <div className="text-center p-8" style={{ animation: 'fade-in 0.5s ease-out' }}>
                                            <div className="size-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-50 flex items-center justify-center border border-primary/20">
                                                <span className="material-symbols-outlined text-primary text-[48px]">auto_awesome</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">AI Virtual Try-On</h3>
                                            <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
                                                Upload ảnh của bạn và chọn quần áo để AI tạo ảnh bạn mặc trang phục đó.
                                                Sử dụng công nghệ <span className="font-semibold text-slate-700">Google Gemini</span> với phương pháp 2 bước.
                                            </p>
                                            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">search</span>
                                                    Bước 1: Phân tích quần áo
                                                </span>
                                                <span className="hidden sm:block">→</span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">brush</span>
                                                    Bước 2: Tạo ảnh try-on
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Preview both images */
                                        <div className="w-full p-8">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                                {/* Person preview */}
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Ảnh của bạn</p>
                                                    <div className={`aspect-[3/4] rounded-xl overflow-hidden border-2 ${personPhoto ? 'border-primary/30 bg-white' : 'border-dashed border-slate-300 bg-slate-50'} flex items-center justify-center`}>
                                                        {personPhoto ? (
                                                            <img src={personPhoto} alt="You" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <span className="material-symbols-outlined text-slate-300 text-[40px]">person</span>
                                                                <p className="text-xs text-slate-400 mt-2">Chưa có ảnh</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Garment preview */}
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quần áo</p>
                                                    <div className={`aspect-[3/4] rounded-xl overflow-hidden border-2 ${garmentImage ? 'border-primary/30 bg-white' : 'border-dashed border-slate-300 bg-slate-50'} flex items-center justify-center`}>
                                                        {garmentImage ? (
                                                            <img src={garmentImage} alt="Garment" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <div className="text-center p-4">
                                                                <span className="material-symbols-outlined text-slate-300 text-[40px]">checkroom</span>
                                                                <p className="text-xs text-slate-400 mt-2">Chưa chọn áo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Processing Overlay */}
                                    {isProcessing && (
                                        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-20">
                                            <div className="text-center max-w-sm">
                                                <div className="flex flex-col items-center">
                                                    <span className="material-symbols-outlined text-4xl mb-4 text-primary animate-bounce">auto_awesome</span>
                                                    <h3 className="text-xl font-black text-slate-900 mb-2">Đang xử lý AI Try-On</h3>

                                                    <div className="flex gap-4 mb-6">
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${processingStep === 'upload' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {processingStep === 'upload' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                                            1. Upload ảnh
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${processingStep === 'describe' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {processingStep === 'describe' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                                                            2. Phân tích áo
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${processingStep === 'generate' ? 'bg-primary/20 text-primary-dark' : 'bg-slate-100 text-slate-500'}`}>
                                                            {processingStep === 'generate' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                                            3. Đang tạo ảnh
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error display */}
                                    {aiError && (
                                        <div className="absolute bottom-4 left-4 right-4 z-20 bg-red-500/90 text-white p-4 rounded-xl text-sm">
                                            <div className="flex items-start gap-3">
                                                <span className="material-symbols-outlined text-[20px] mt-0.5">error</span>
                                                <div className="flex-1">
                                                    <p className="font-bold mb-1">AI Try-On thất bại</p>
                                                    <p className="text-red-100 text-xs">{aiError}</p>
                                                </div>
                                                <button onClick={() => setAiError(null)} className="flex-shrink-0">
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                            {(aiError.includes('rate') || aiError.includes('quota') || aiError.includes('429') || aiError.includes('đợi')) && (
                                                <div className="mt-3 flex items-center gap-2">
                                                    <p className="text-red-100 text-xs flex-1">💡 API bị giới hạn tốc độ. Backend sẽ tự động retry, nếu vẫn lỗi hãy đợi 30s rồi thử lại.</p>
                                                    <button
                                                        onClick={() => { setAiError(null); handleAITryOn(); }}
                                                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
                                                    >
                                                        🔄 Thử lại
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Bar */}
                                {(personPhoto || garmentImage) && (
                                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                            Đặt lại
                                        </button>

                                        <button
                                            onClick={handleAITryOn}
                                            disabled={isProcessing || !personPhoto || !garmentImage}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-[#11221c] rounded-lg text-sm font-black hover:brightness-110 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                                            {isProcessing ? 'Đang xử lý...' : '🤖 Thử đồ bằng AI'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Info card */}
                            <div className="mt-6 bg-gradient-to-r from-primary/5 to-emerald-50 border border-primary/10 rounded-2xl p-5">
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                                    Cách hoạt động
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary font-bold text-xs">1</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Phân tích áo</p>
                                            <p className="text-xs text-slate-500">AI nhận diện loại, màu sắc, chất liệu của quần áo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary font-bold text-xs">2</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Tạo ảnh</p>
                                            <p className="text-xs text-slate-500">AI ghép quần áo lên người bạn một cách tự nhiên</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-primary font-bold text-xs">3</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Xem kết quả</p>
                                            <p className="text-xs text-slate-500">Tải ảnh về hoặc thêm sản phẩm vào giỏ hàng</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VirtualTryOn;
