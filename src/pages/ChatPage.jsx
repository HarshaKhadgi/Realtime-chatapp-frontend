import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatBox from '../components/ChatBox';
import StoriesBar from '../components/StoriesBar';
import { useSelector } from 'react-redux';

const ChatPage = () => {
    const selectedChat = useSelector(state => state.chat.selectedChat);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Sidebar automatically stretches to full screen on Mobile when no chat is active, otherwise strictly constrained */}
            <div className={`${selectedChat ? 'hidden md:flex' : 'flex w-full'} md:w-[350px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 relative z-10 shadow-xl`}>
                <Sidebar />
            </div>
            
            {/* Chatbox naturally fills space but hides completely on Mobile when no chat is active */}
            <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800 relative flex-col w-full`}>
                <StoriesBar />
                <ChatBox />
            </div>
        </div>
    );
};

export default ChatPage;
