import React, { useState, useRef } from 'react';
import axios from 'axios';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';

const UploadStoryModal = ({ isOpen, onClose, onUploadSuccess }) => {
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [type, setType] = useState('image');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        setFile(selected);
        setType(selected.type.startsWith('video') ? 'video' : 'image');
        setPreview(URL.createObjectURL(selected));
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('media', file);
        formData.append('type', type);

        try {
            const { data } = await axios.post('/api/stories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
            });
            onUploadSuccess(data);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Upload failed. Make sure you provided correct AWS credentials in backend .env if using S3.");
        } finally {
            setLoading(false);
            setFile(null);
            setPreview(null);
        }
    };

    const resetSelection = () => {
        setFile(null);
        setPreview(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Add to Story</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    {!preview ? (
                        <>
                            <div className="w-32 h-32 rounded-full bg-indigo-50 dark:bg-gray-700 flex items-center justify-center mb-6 shadow-inner ring-4 ring-indigo-100 dark:ring-gray-600">
                                <ImageIcon className="w-12 h-12 text-indigo-400 dark:text-gray-400" />
                            </div>
                            <input 
                                type="file" 
                                accept="image/*,video/*"
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                            >
                                <ImageIcon className="w-4 h-4"/> Select Media
                            </button>
                            <p className="text-xs text-gray-500 mt-4 text-center">Supported formats: JPG, PNG, GIF, MP4</p>
                        </>
                    ) : (
                        <div className="w-full flex flex-col items-center">
                            <div className="relative w-full max-h-72 bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4">
                                {type === 'image' ? (
                                    <img src={preview} className="max-h-72 object-contain" />
                                ) : (
                                    <video src={preview} controls className="max-h-72 object-contain" />
                                )}
                                <button onClick={resetSelection} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition"><X className="w-4 h-4"/></button>
                            </div>
                            <button 
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Share to Story'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadStoryModal;
