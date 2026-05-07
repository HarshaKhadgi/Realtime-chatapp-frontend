import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { setChats, setSelectedChat } from '../features/chatSlice';
import { useSocketContext } from '../context/SocketContext';
import { Search, Plus, LogOut, Settings, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GroupChatModal from './GroupChatModal';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userInfo = useSelector(state => state.auth.userInfo);
    const chats = useSelector(state => state.chat.chats);
    const selectedChat = useSelector(state => state.chat.selectedChat);
    const { onlineUsers } = useSocketContext();

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState([]);

    const fetchChats = async () => {
        try {
            const { data } = await axios.get('/api/chats', { withCredentials: true });
            dispatch(setChats(data));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSuggestedUsers = async () => {
        try {
            const { data } = await axios.get('/api/users', { withCredentials: true });
            setSuggestedUsers(data.slice(0, 10)); // Top 10 suggested app users
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if(userInfo) {
            fetchChats();
            fetchSuggestedUsers();
        }
    }, [userInfo]);

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if(!e.target.value) {
            setSearchResult([]);
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/users?search=${e.target.value}`, { withCredentials: true });
            setSearchResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const accessChat = async (userId) => {
        try {
            const { data } = await axios.post('/api/chats', { userId }, { withCredentials: true });
            if (!chats.find((c) => c._id === data._id)) {
                dispatch(setChats([data, ...chats]));
            }
            dispatch(setSelectedChat(data));
            setSearch('');
            setSearchResult([]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        await axios.post('/api/users/logout', {}, { withCredentials: true });
        dispatch(logout());
        navigate('/');
    };

    const getSenderName = (chat) => {
        if (chat.isGroupChat) return chat.chatName;
        return chat.users[0]._id === userInfo._id ? chat.users[1].username : chat.users[0].username;
    };
    
    const getSenderPic = (chat) => {
        if (chat.isGroupChat) return `https://robohash.org/${chat._id}?set=set3&bgset=bg2&size=200x200`;
        return chat.users[0]._id === userInfo._id ? chat.users[1].profilePic : chat.users[0].profilePic;
    };

    const activeChatUserIds = new Set();
    chats.forEach(c => {
        if (!c.isGroupChat) {
            const otherUser = c.users.find(u => u._id !== userInfo?._id);
            if (otherUser) activeChatUserIds.add(otherUser._id);
        }
    });

    const filteredSuggestions = suggestedUsers.filter(u => !activeChatUserIds.has(u._id));

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-colors duration-300">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 tracking-tight">NexusChat</h2>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsGroupModalOpen(true)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-full transition-all" title="Create Group"><Plus className="w-5 h-5"/></button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-full transition-all" title="Settings"><Settings className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Search or start chat..." 
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 text-[13px] md:text-sm rounded-2xl py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-gray-200 dark:border-gray-700" 
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                {searchResult.length > 0 ? (
                    <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 ml-2 mb-2 uppercase tracking-wider">Search Results</p>
                        {loading && <p className="text-center text-sm text-gray-400">Loading...</p>}
                        {searchResult.map(user => (
                            <div 
                                key={user._id} 
                                onClick={() => accessChat(user._id)}
                                className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
                            >
                                <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.username}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-2">
                        <p className="text-xs font-semibold text-gray-500 ml-2 mb-2 uppercase tracking-wider">Recent Chats</p>
                        {chats.map(chat => (
                            <div 
                                key={chat._id} 
                                onClick={() => dispatch(setSelectedChat(chat))}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${selectedChat?._id === chat._id ? 'bg-indigo-50 dark:bg-indigo-900/40 border-l-4 border-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60 border-l-4 border-transparent'}`}
                            >
                                <img src={getSenderPic(chat)} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{getSenderName(chat)}</h4>
                                        {chat.latestMessage && <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">12:30</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                        {chat.latestMessage ? chat.latestMessage.content : "Start chatting..."}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* SUGGESTED USERS */}
                        {filteredSuggestions.length > 0 && (
                            <div className="mt-6">
                                <p className="text-xs font-semibold text-gray-500 ml-2 mb-2 uppercase tracking-wider">Suggested Registered Users</p>
                                {filteredSuggestions.map(user => (
                                    <div 
                                        key={user._id} 
                                        onClick={() => accessChat(user._id)}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{user.username}</h4>
                                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">Click to chat</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Profile & Actions */}
            <div className="w-full p-4 border-t border-gray-100 dark:border-gray-800 mt-auto flex items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-[2px]">
                <div onClick={() => navigate('/profile')} className="relative cursor-pointer group flex-shrink-0">
                    <img src={userInfo?.profilePic} className="w-10 h-10 rounded-xl object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all" title="View Profile" />
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={() => navigate('/profile')} >
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{userInfo?.username}</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium tracking-wide">My Profile</p>
                </div>
                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0" title="Logout">
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
            
            <GroupChatModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} />
        </div>
    );
};

export default Sidebar;
