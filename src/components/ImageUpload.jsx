import React, { useState, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8080';

const ImageUpload = ({ onUploadSuccess, onUploadError, maxSizeMB = 10 }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Only JPEG and PNG images are allowed.';
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File size must be under ${maxSizeMB}MB.`;
        }
        return null;
    };

    const handleFile = (file) => {
        if (!file) return;
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
        uploadFile(file);
    };

    const uploadFile = async (file) => {
        setUploading(true);
        setError(null);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || `Upload failed (${response.status})`);
            }

            const data = await response.json();
            setUploadResult(data);
            onUploadSuccess?.(data);
        } catch (err) {
            setError(err.message);
            setPreview(null);
            onUploadError?.(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!uploadResult?.publicId) return;
        setDeleting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/upload?publicId=${encodeURIComponent(uploadResult.publicId)}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete image');

            setUploadResult(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleInputChange = (e) => {
        handleFile(e.target.files?.[0]);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    }, []);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div className="w-full">
            {/* Upload Zone */}
            {!uploadResult && !uploading && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                        isDragging
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-300 hover:border-primary hover:bg-slate-50'
                    }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleInputChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[32px] text-slate-400">cloud_upload</span>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 mb-1">
                                {isDragging ? 'Drop your image here' : 'Click or drag to upload'}
                            </p>
                            <p className="text-sm text-slate-500">JPEG, PNG — Max {maxSizeMB}MB</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Uploading State */}
            {uploading && (
                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center bg-primary/5">
                    <div className="flex flex-col items-center gap-4">
                        <span className="material-symbols-outlined text-[40px] text-primary animate-spin">progress_activity</span>
                        <p className="text-lg font-bold text-slate-900">Uploading...</p>
                        {preview && (
                            <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-200 mt-2">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <div className="relative aspect-video bg-slate-100 flex items-center justify-center">
                        <img
                            src={uploadResult.url}
                            alt="Uploaded"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="size-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm border border-slate-200 disabled:opacity-50"
                                title="Delete image"
                            >
                                <span className="material-symbols-outlined text-[20px]">{deleting ? 'progress_activity' : 'delete'}</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900">Upload successful</p>
                            <p className="text-xs text-slate-500 truncate">{uploadResult.url}</p>
                        </div>
                        <button
                            onClick={() => { navigator.clipboard.writeText(uploadResult.url); }}
                            className="text-sm font-bold text-primary hover:underline shrink-0"
                        >
                            Copy URL
                        </button>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm font-medium">
                    <span className="material-symbols-outlined text-[20px]">error</span>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
