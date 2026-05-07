import React, { useEffect, useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';

const StoryViewer = ({ stories, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);

    useEffect(() => {
        if (!stories || stories.length === 0) return;
        const currentStory = stories[currentIndex];
        
        // Log view
        axios.put(`/api/stories/${currentStory._id}/view`, {}, { withCredentials: true }).catch(err => console.log(err));

        const timer = setTimeout(() => {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                onClose();
            }
        }, 5000); // 5 sec per story

        return () => clearTimeout(timer);
    }, [currentIndex, stories]);

    if (!stories || stories.length === 0) return null;
    const currentStory = stories[currentIndex];

    // Ensure we trigger reflow for css animation reset
    const progressKey = `${currentIndex}-${Date.now()}`;

    const handleNext = () => {
        if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
        else onClose();
    };

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 text-white flex items-center justify-center animate-in fade-in duration-300">
            {/* Progress Bars */}
            <div className="absolute top-4 left-0 w-full px-2 sm:px-4 flex gap-1 z-10">
                {stories.map((s, i) => (
                    <div key={s._id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div 
                            className={`h-full bg-white ${i === currentIndex ? 'transition-all ease-linear' : ''}`}
                            style={{ 
                                width: i === currentIndex ? '100%' : (i < currentIndex ? '100%' : '0%'),
                                transitionDuration: i === currentIndex ? '5000ms' : '0ms',
                            }}
                            key={i === currentIndex ? progressKey : i} // Forces dom re-render to restart animation
                        />
                    </div>
                ))}
            </div>

            {/* Header info */}
            <div className="absolute top-8 left-4 flex items-center gap-2 z-10">
                <img src={currentStory.user.profilePic} className="w-10 h-10 rounded-full border border-white/50" />
                <span className="font-semibold shadow-sm text-sm">{currentStory.user.username}</span>
                <span className="text-white/70 text-xs ml-2">{new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Close */}
            <button onClick={onClose} className="absolute top-8 right-4 z-10 p-2 hover:bg-white/10 rounded-full transition"><X className="w-6 h-6"/></button>

            {/* Navigation Areas */}
            <div className="absolute inset-y-0 left-0 w-1/3 z-5 cursor-pointer" onClick={handlePrev}></div>
            <div className="absolute inset-y-0 right-0 w-1/3 z-5 cursor-pointer" onClick={handleNext}></div>

            {/* Media */}
            <div className="relative w-full max-w-lg h-full max-h-[85vh] flex items-center justify-center rounded-xl overflow-hidden mt-8 px-2 sm:px-0 pointer-events-none">
                {currentStory.type === 'image' ? (
                    <img src={currentStory.mediaUrl} className="w-full h-full object-contain pointer-events-auto" />
                ) : (
                    <video src={currentStory.mediaUrl} autoPlay playsInline className="w-full h-full object-contain pointer-events-auto" />
                )}
            </div>

            {/* Navigation arrows (desktop) */}
            {currentIndex > 0 && <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/80 transition hidden sm:block z-10"><ChevronLeft/></button>}
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/80 transition hidden sm:block z-10"><ChevronRight/></button>
        </div>
    );
};

export default StoryViewer;
