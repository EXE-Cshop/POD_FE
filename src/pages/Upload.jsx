import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';

const Upload = () => {
    const navigate = useNavigate();
    const [uploads, setUploads] = useState([]);

    const handleUploadSuccess = (data) => {
        setUploads(prev => [data, ...prev]);
    };

    return (
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="size-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900">Upload Image</h1>
                    <p className="text-slate-500 text-sm mt-1">Upload your design images to use in your products.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Upload Area */}
                <div className="w-full lg:w-2/3">
                    <ImageUpload
                        onUploadSuccess={handleUploadSuccess}
                    />

                    {/* Upload History */}
                    {uploads.length > 0 && (
                        <div className="mt-10">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Recent Uploads</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {uploads.map((item, idx) => (
                                    <div key={idx} className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                                        <img src={item.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(item.url)}
                                                className="h-10 px-4 bg-white rounded-lg font-bold text-sm text-slate-900 shadow-lg flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="w-full lg:w-1/3">
                    <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border border-slate-200 sticky top-24">
                        <h2 className="text-xl font-black text-slate-900 mb-6">Upload Guidelines</h2>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-primary text-[16px]">image</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Supported Formats</h4>
                                    <p className="text-xs text-slate-500 mt-1">JPEG, JPG, PNG files only</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-primary text-[16px]">straighten</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Max File Size</h4>
                                    <p className="text-xs text-slate-500 mt-1">Up to 10MB per image</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-primary text-[16px]">high_quality</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Best Quality</h4>
                                    <p className="text-xs text-slate-500 mt-1">Use high-resolution images (300 DPI) for the best print results</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-primary text-[16px]">cloud_done</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Cloud Storage</h4>
                                    <p className="text-xs text-slate-500 mt-1">Images are securely stored on Cloudinary CDN</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
