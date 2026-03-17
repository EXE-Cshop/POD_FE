import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const THEMES = [
    { name: 'Modern Minimal', color: '#13b9a5', type: 'minimal' },
    { name: 'Festive Floral', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxTzthpeKldR46pYXu-UVgOtUoYd5QLWu8pfhni27z7W3VcQTVlboxHgfo0NtsgSL7cAuxXUblaOiwh8W3wmjI4yOgKbQXu4Fz-48nAx13_jFTcXthqPS0CzaFAEBZoyn5cb-IBs2Kl6cxjJwLyN0gN5LCnQWoai5pyYASrL8xCtUdnf4FrnesVwSCXR27HZtpYcyneFcCMdWrpbgOU0cIHkrGP23yXPIAaLwn4zHIR10OgQG03vC6bMMdjd42I4cg5ulmALs8vA' },
    { name: 'Ocean Breeze', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAu3AASf9IglX9y4YK5gGU-vyQXHPyvrz0BBVmHejl4K40-F5t-2hpJ8Nj-79V3VBjLbosS1YJLN_kaTO81g17NKv44ORaoW9uxq7_sKTv8VK12ZasPfGKmif88cvt99cdINUK3UXWq7TNFAS-6Bn9WitZ5OMYj5UFNipYWE_UATcF58hIwqNnZINnsM8Ub5bR4RgWU3fZSt81jgMn2q01T0tK8bWpAeARJZQXxAtYIoT1Nayf01PQz83s7C_5gS_xvZoumdUYoEA' },
    { name: 'Gold Geometric', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj3G3EZCeurThYDIbCzwn3YcWMjRF6GJp-xqJNqrH99cPw_Zl56HyD6OmzbqhGUbsFERNuCMIB5cb8ziKTAhMsS_Ya9KSV3BChNBom7kgci8qSbN4YADakuUwDLfBqb5OHTXo8UT_xen189q5WS8RZQgp67aLaVTGr9zN6_qBnhXNKiLjk-HW0mhoCMiHOKZmBucPnhnHZC8K0x7li1dvC-pvkad56HRIp-6Xf_g9CEsTR2jy4_ON6fZPNMwPG45rg0V7zvdgIfw' },
    { name: 'Artist Soul', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm6h4lgS_yTJGtSxxsfg8iCYbJy-hKPsnKs1mBY8vEoNk8JNU3xvI_zmC-0jyNTrSx1VfWEdDiipJyTD8rosjWqyOcF9iHqw1qwfQwGQVFdbsaTKHasjhGG6gc695Y9hc1HjZ-tRU-w5Z9evrRb-3prsDonIibNxpuq_DKNvXDP1G7yqgejBtjOkAXVI5nQkpRz-VVh5GIKxu5k_X2f8ygH8iMYbJcRaJrTzv-EjdXOxpgtfnpFsPEMh3lpnAoqle6mUwOdKSg3Q' }
];

const GiftUpgradeModal = ({ isOpen, onClose, onApply, initialData = {} }) => {
    const [recipientName, setRecipientName] = useState(initialData.recipientName || '');
    const [giftMessage, setGiftMessage] = useState(initialData.giftMessage || '');
    const [selectedTheme, setSelectedTheme] = useState(initialData.selectedTheme || 'Modern Minimal');
    const [photoUrl, setPhotoUrl] = useState(initialData.photoUrl || null);
    const [videoUrl, setVideoUrl] = useState(initialData.videoUrl || null);
    
    // QR Code Public Host simulation
    const [publicHost, setPublicHost] = useState(window.location.origin);
    const qrUrl = `${publicHost}/gift/preview?n=${encodeURIComponent(recipientName)}&m=${encodeURIComponent(giftMessage)}&t=${encodeURIComponent(selectedTheme)}&p=${encodeURIComponent(photoUrl || '')}&v=${encodeURIComponent(videoUrl || '')}`;

    // Legacy previewUrl might be mapped to videoUrl if it was used for video before
    useEffect(() => {
        if (initialData.previewUrl && !videoUrl) {
            setVideoUrl(initialData.previewUrl);
        }
    }, [initialData.previewUrl]);

    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileUpload = async (file, type) => {
        const isVideo = type === 'video';
        if (isVideo) setIsUploadingVideo(true);
        else setIsUploadingPhoto(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('http://localhost:8080/api/v1/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            const data = await response.json();
            if (isVideo) {
                setVideoUrl(data.url);
            } else {
                setPhotoUrl(data.url);
                setSelectedTheme('Custom Photo');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Có lỗi xảy ra khi tải lên tệp tin. Vui lòng thử lại.');
        } finally {
            if (isVideo) setIsUploadingVideo(false);
            else setIsUploadingPhoto(false);
            setUploadProgress(100);
        }
    };

    // Scroll Lock Mechanism
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to restore scrolling when component unmounts or modal closes
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply({
            recipientName,
            giftMessage,
            selectedTheme,
            photoUrl,
            videoUrl,
            isGift: true
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 md:p-8 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-white rounded-[2.5rem] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl scale-100 transition-all border border-white/20" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-3xl font-black text-slate-900">Nâng cấp Quà tặng</h2>
                            <span className="bg-primary text-white text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg shadow-primary/20">Elite Service</span>
                        </div>
                        <p className="text-slate-500 font-medium">Cá nhân hóa trải nghiệm mở quà kỹ thuật số cho người thân yêu.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="size-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Left: Configuration */}
                        <div className="space-y-12">
                            {/* Step 1: Info */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">1</div>
                                    <h3 className="text-2xl font-black text-slate-900">Chi tiết người nhận</h3>
                                </div>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Tên người nhận</label>
                                        <input 
                                            type="text"
                                            value={recipientName}
                                            onChange={(e) => setRecipientName(e.target.value)}
                                            className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-slate-900 shadow-sm"
                                            placeholder="Ai sẽ nhận món quà này?"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Lời chúc của bạn</label>
                                        <textarea 
                                            value={giftMessage}
                                            onChange={(e) => setGiftMessage(e.target.value)}
                                            rows="4"
                                            className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none shadow-sm"
                                            placeholder="Viết lời chúc ngọt ngào nhất..."
                                        ></textarea>
                                        <div className="flex justify-end mt-2">
                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${giftMessage.length > 200 ? 'text-orange-500' : 'text-slate-400'}`}>
                                                {giftMessage.length} / 250 characters
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Step 2: Theme Select */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">2</div>
                                    <h3 className="text-2xl font-black text-slate-900">Phong cách thiệp</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {/* Custom Photo Upload Option */}
                                    <div 
                                        className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all group flex flex-col items-center justify-center bg-slate-50 ${selectedTheme === 'Custom Photo' ? 'border-primary shadow-xl scale-95' : 'border-transparent hover:border-slate-200'}`}
                                        onClick={() => {
                                            if (photoUrl) setSelectedTheme('Custom Photo');
                                            else document.getElementById('photo-upload').click();
                                        }}
                                    >
                                        {photoUrl ? (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${photoUrl}')` }}>
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setPhotoUrl(null); if (selectedTheme === 'Custom Photo') setSelectedTheme('Modern Minimal'); }}
                                                    className="absolute top-2 right-2 size-6 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-red-500 transition-colors flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-3xl">add_a_photo</span>
                                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest group-hover:text-primary">Tải ảnh lên</p>
                                            </div>
                                        )}
                                        <input 
                                            id="photo-upload"
                                            type="file" 
                                            accept="image/*"
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) handleFileUpload(file, 'image');
                                            }}
                                        />
                                        {isUploadingPhoto && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                                            </div>
                                        )}
                                    </div>

                                    {THEMES.map(theme => (
                                        <div 
                                            key={theme.name}
                                            onClick={() => setSelectedTheme(theme.name)}
                                            className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all group ${selectedTheme === theme.name ? 'border-primary shadow-xl scale-95' : 'border-transparent hover:border-slate-200'}`}
                                        >
                                            {theme.type === 'minimal' ? (
                                                <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4 text-center">
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{theme.name}</p>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${theme.image}')` }}>
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                                </div>
                                            )}
                                            {selectedTheme === theme.name && (
                                                <div className="absolute top-2 right-2 size-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                                    <span className="material-symbols-outlined text-[14px] font-black">check</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Step 3: Media Upload */}
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20">3</div>
                                    <h3 className="text-2xl font-black text-slate-900">Đính kèm cảm xúc (Video)</h3>
                                </div>
                                <div className="relative">
                                    <div 
                                        className={`w-full border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center transition-all cursor-pointer group shadow-inner ${videoUrl ? 'border-primary/30 bg-white' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-primary/50'}`}
                                        onClick={() => document.getElementById('video-upload').click()}
                                    >
                                        {videoUrl ? (
                                            <div className="w-full space-y-4">
                                                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                                    <video src={videoUrl} className="w-full h-full object-contain" controls />
                                                    <button 
                                                        onClick={(e) => {e.stopPropagation(); setVideoUrl(null);}}
                                                        className="absolute top-4 right-4 size-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-red-500 transition-colors flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                </div>
                                                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã tải lên video chúc mừng</p>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="size-20 rounded-full bg-white text-slate-200 flex items-center justify-center mb-4 group-hover:text-primary transition-all shadow-sm">
                                                    <span className="material-symbols-outlined text-4xl">movie</span>
                                                </div>
                                                <h4 className="font-black text-slate-900 mb-1">Tải lên Video chúc mừng</h4>
                                                <p className="text-slate-500 text-sm mb-4 text-center">Làm món quà thêm ý nghĩa với lời nhắn trực tiếp.</p>
                                                <div className="px-6 py-2 bg-white rounded-full text-[10px] font-black text-slate-400 uppercase border border-slate-200 shadow-sm group-hover:border-primary/30 transition-all">Chọn Video</div>
                                            </>
                                        )}
                                        <input 
                                            id="video-upload"
                                            type="file" 
                                            accept="video/*"
                                            className="hidden" 
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) handleFileUpload(file, 'video');
                                            }}
                                        />
                                    </div>
                                    {isUploadingVideo && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex flex-col items-center justify-center gap-4 z-10">
                                            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                                            <p className="text-xs font-black text-primary uppercase tracking-widest">Đang tải video lên Cloudinary...</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right: Preview & Action */}
                        <div className="lg:block">
                            <div className="sticky top-0 space-y-8">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">visibility</span>
                                    Xem trước trải nghiệm
                                </h3>
                                
                                <div className="bg-slate-900 rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden group/card min-h-[400px] flex flex-col justify-between">
                                    {/* Backgroud Image logic */}
                                    {selectedTheme === 'Custom Photo' && photoUrl ? (
                                        <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]" style={{ backgroundImage: `url('${photoUrl}')` }}></div>
                                    ) : (
                                        <>
                                            {THEMES.find(t => t.name === selectedTheme)?.image && (
                                                <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.5]" style={{ backgroundImage: `url('${THEMES.find(t => t.name === selectedTheme).image}')` }}></div>
                                            )}
                                            <div className="absolute -top-20 -right-20 size-64 bg-primary/10 rounded-full blur-3xl"></div>
                                            <div className="absolute -bottom-20 -left-20 size-64 bg-primary/10 rounded-full blur-3xl"></div>
                                        </>
                                    )}
                                    
                                    <div className="relative z-10 space-y-10">
                                        <div className="flex justify-between items-start">
                                            <div className="size-16 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                                <span className="material-symbols-outlined text-white text-3xl">qr_code_2</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">C-Shop Digital</p>
                                                <h4 className="text-white font-black text-xl">QR Gift Card</h4>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-[#11221c] font-black text-[10px]">TO</div>
                                                <p className="text-white font-bold truncate">{recipientName || 'Họ và tên người nhận'}</p>
                                            </div>
                                            <div className="h-px bg-white/10 w-full"></div>
                                            <p className="text-slate-200 text-sm leading-relaxed italic line-clamp-4">
                                                "{giftMessage || 'Lời nhắn yêu thương của bạn sẽ xuất hiện tại đây khi người nhận quét mã QR gắn trên gói quà...'}"
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 px-2">
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Design Theme</p>
                                                    <p className="text-white font-bold">{selectedTheme}</p>
                                                </div>
                                                <div className="size-12 rounded-2xl bg-white flex items-center justify-center shadow-xl transform rotate-6 group-hover/card:rotate-0 transition-all duration-500">
                                                    <span className="material-symbols-outlined text-slate-900">{videoUrl ? 'play_circle' : 'celebration'}</span>
                                                </div>
                                            </div>
                                            {videoUrl && (
                                                <div className="px-4 py-2 bg-primary/20 backdrop-blur-md rounded-xl border border-primary/30 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary text-sm animate-pulse">videocam</span>
                                                    <span className="text-[10px] font-black text-white uppercase">Đã đính kèm video</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* QR Code Scan Preview */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <span className="material-symbols-outlined">qr_code_scanner</span>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-sm">Quét thử với điện thoại</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Trải nghiệm thực tế</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <input 
                                                type="text" 
                                                value={publicHost}
                                                onChange={(e) => setPublicHost(e.target.value)}
                                                placeholder="Nhập IP/Domain (VD: 192.168.1.10:5173)"
                                                className="text-[10px] px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary focus:ring-0 outline-none w-48 font-mono text-slate-600 transition-all"
                                            />
                                            <p className="text-[9px] text-slate-400 font-medium">Đổi 'localhost' thành IP để quét bằng điện thoại</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xl">
                                            <QRCodeCanvas 
                                                value={qrUrl}
                                                size={160} // Tăng kích thước để dễ quét hơn
                                                level="M"   // Giảm level xuống M để giảm mật độ điểm, giúp QR thưa hơn
                                                includeMargin={true} // Thêm lề trắng để tách biệt với nền
                                            />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <span className="material-symbols-outlined text-xl">sensors</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">Sẵn sàng kết nối</span>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                Quét bằng camera điện thoại. Đảm bảo điện thoại và máy tính dùng chung một mạng WiFi.
                                            </p>
                                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="material-symbols-outlined text-slate-400 text-sm">link</span>
                                                <span className="text-[9px] font-mono text-slate-500 truncate max-w-[150px]">{qrUrl}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-900 font-black text-xl">+30,000đ</p>
                                            <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">Phí dịch vụ ưu tiên</p>
                                        </div>
                                        <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-symbols-outlined">luxury</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleApply}
                                        className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3"
                                    >
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Áp dụng Nâng cấp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftUpgradeModal;
