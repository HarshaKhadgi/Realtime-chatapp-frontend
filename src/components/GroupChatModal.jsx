import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setChats } from '../features/chatSlice';
import { X, Search, Check } from 'lucide-react';

const GroupChatModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const chats = useSelector(state => state.chat.chats);
    
    const [groupChatName, setGroupChatName] = useState('');
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) fetchSuggestedUsers();
    }, [isOpen]);

    const fetchSuggestedUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/users', { withCredentials: true });
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        if(!e.target.value) return fetchSuggestedUsers();
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/users?search=${e.target.value}`, { withCredentials: true });
            setSearchResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGroup = (userToAdd) => {
        if (selectedUsers.includes(userToAdd)) return;
        setSelectedUsers([...selectedUsers, userToAdd]);
    };

    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== delUser._id));
    };

    const handleSubmit = async () => {
        if (!groupChatName || !selectedUsers) return alert("Please fill all fields");
        try {
            const { data } = await axios.post('/api/chats/group', {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map(u => u._id))
            }, { withCredentials: true });
            dispatch(setChats([data, ...chats]));
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Create Group Chat</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                
                <div className="p-4 space-y-4">
                    <input 
                        type="text" 
                        placeholder="Chat Name"
                        value={groupChatName}
                        onChange={(e) => setGroupChatName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-gray-100"
                    />
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Add Users eg: John, Jane"
                            value={search}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-gray-100"
                        />
                    </div>
                    
                    {/* Selected Users Chips */}
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedUsers.map(u => (
                            <div key={u._id} className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg text-xs font-medium">
                                {u.username}
                                <X className="w-3 h-3 cursor-pointer hover:text-indigo-900 dark:hover:text-indigo-100" onClick={() => handleDelete(u)}/>
                            </div>
                        ))}
                    </div>

                    {/* Search Results */}
                    {loading ? <div className="text-center text-xs text-gray-500 py-2">Loading...</div> : (
                        <div className="max-h-32 overflow-y-auto space-y-1 no-scrollbar">
                            {searchResults.slice(0, 4).map(user => (
                                <div key={user._id} onClick={() => handleGroup(user)} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <img src={user.profilePic} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.username}</span>
                                    </div>
                                    {selectedUsers.includes(user) && <Check className="w-4 h-4 text-indigo-500" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors">Create Chat</button>
                </div>
            </div>
        </div>
    );
};

export default GroupChatModal;
