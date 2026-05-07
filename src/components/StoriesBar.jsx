import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import UploadStoryModal from './UploadStoryModal';
import StoryViewer from './StoryViewer';

const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const userInfo = useSelector(state => state.auth.userInfo);
    
    // Modal states
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [viewerProps, setViewerProps] = useState(null);

    const fetchStories = async () => {
        try {
            const { data } = await axios.get('/api/stories', { withCredentials: true });
            setStories(data);
        } catch (err) {
            console.error(err);
        }
    };
    
    useEffect(() => {
        fetchStories();
    }, []);

    const openViewer = (index) => {
        setViewerProps({ stories, initialIndex: index });
    };

    return (
        <div className="w-full h-24 border-b border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm flex items-center px-4 overflow-x-auto no-scrollbar gap-4 z-10 sticky top-0 flex-shrink-0">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 cursor-pointer min-w-fit" onClick={() => setIsUploadOpen(true)}>
                <div className="relative">
                    <img src={userInfo?.profilePic} className="w-14 h-14 rounded-full object-cover p-0.5 border-2 border-transparent" />
                    <div className="absolute bottom-0 right-0 bg-indigo-500 rounded-full p-0.5 border-2 border-white dark:border-gray-800">
                        <Plus className="w-3 h-3 text-white" />
                    </div>
                </div>
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate w-14 text-center">Your Story</span>
            </div>

            {/* Stories Mapped out */}
            {stories.map((story, i) => (
                <div key={story._id} onClick={() => openViewer(i)} className="flex flex-col items-center gap-1 cursor-pointer min-w-fit group">
                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 group-hover:scale-105 transition-transform">
                        <img src={story.user.profilePic} className="w-13 h-13 rounded-full object-cover border-2 border-white dark:border-gray-800" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate w-14 text-center">{story.user.username}</span>
                </div>
            ))}
            
            <UploadStoryModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploadSuccess={() => fetchStories()} />
            {viewerProps && <StoryViewer {...viewerProps} onClose={() => setViewerProps(null)} />}
        </div>
    );
};

export default StoriesBar;
