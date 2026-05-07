import React from 'react';
import { useSelector } from 'react-redux';
import { Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const userInfo = useSelector((state) => state.auth.userInfo);
    const navigate = useNavigate();

    if (!userInfo) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-500">
                
                {/* Header Banner */}
                <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                    <button onClick={() => navigate('/chats')} className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition">
                        <ArrowLeft className="w-5 h-5"/>
                    </button>
                    <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition">
                        <Settings className="w-5 h-5"/>
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 relative flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 shadow-xl -mt-16 z-10 relative">
                        <img src={userInfo.profilePic} alt="avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center cursor-pointer hover:bg-black/70 transition">
                            <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-extrabold mt-4 text-gray-800 dark:text-gray-100 capitalize">{userInfo.username}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{userInfo.email}</p>

                    <div className="mt-6 flex flex-col items-center max-w-md text-center">
                        <p className="text-gray-700 dark:text-gray-300 font-light italic bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                            "{userInfo.bio || 'Hey there! I am using NexusChat.'}"
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-12 mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 w-full justify-center">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">0</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">Stories</p>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Active</h3>
                            <p className="text-xs text-green-500 uppercase tracking-widest font-semibold mt-1">Status</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
