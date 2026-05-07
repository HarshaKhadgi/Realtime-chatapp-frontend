import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare, Send, Paperclip, Loader2, X, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useSocketContext } from '../context/SocketContext';
import { setSelectedChat } from '../features/chatSlice';

const ChatBox = () => {
    const dispatch = useDispatch();
    const selectedChat = useSelector(state => state.chat.selectedChat);
    const userInfo = useSelector(state => state.auth.userInfo);
    const { socket, onlineUsers } = useSocketContext();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fullScreenMedia, setFullScreenMedia] = useState(null);

    const scrollContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/messages/${selectedChat._id}`, { withCredentials: true });
            setMessages(data);
            setLoading(false);
            if(socket) socket.emit('join_chat', selectedChat._id);
            
            // Mark as read natively
            const hasUnread = data.some(m => m.sender._id !== userInfo._id && !(Array.isArray(m.readBy) ? m.readBy : []).some(uid => String(uid._id || uid) === String(userInfo._id)));
            if (hasUnread) {
                await axios.put('/api/messages/read', { chatId: selectedChat._id }, { withCredentials: true });
                if(socket) socket.emit('mark_read', { chatId: selectedChat._id, userId: userInfo._id });
            }

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // eslint-disable-next-line
    }, [selectedChat]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if(!socket) return;
        
        const messageReceivedHandler = (newMessageReceived) => {
            if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
                // TODO: Systematically dispatch a Redux global UI Toast notification natively if the user is looking at another screen!
            } else {
                // Immediately inject the message onto our live DOM array
                setMessages((prev) => [...prev, newMessageReceived]);
                
                // Emitting the Seen hook since the user actively has their eyeballs rendering this chat room frame actively!
                socket.emit("mark_read", { chatId: selectedChat._id, userId: userInfo._id });
                axios.put('/api/messages/read', { chatId: selectedChat._id }, { withCredentials: true }).catch(e => console.log(e));
            }
        };

        const messagesReadHandler = ({ chatId, userId }) => {
            if (selectedChat && selectedChat._id === chatId) {
                setMessages(prev => prev.map(m => {
                    const currentReadBy = Array.isArray(m.readBy) ? m.readBy : [];
                    const hasRead = currentReadBy.some(obj => String(obj._id || obj) === String(userId));
                    if (String(m.sender._id) !== String(userId) && !hasRead) {
                        return { ...m, readBy: [...currentReadBy, userId] };
                    }
                    return m;
                }));
            }
        };

        const isTypingHandler = (room) => {
            if (selectedChat && selectedChat._id === room) setIsTyping(true);
        };
        const stopTypingHandler = (room) => {
            if (selectedChat && selectedChat._id === room) setIsTyping(false);
        };

        socket.on("message_received", messageReceivedHandler);
        socket.on("typing", isTypingHandler);
        socket.on("stop_typing", stopTypingHandler);
        socket.on("messages_read", messagesReadHandler);

        return () => {
            socket.off("message_received", messageReceivedHandler);
            socket.off("typing", isTypingHandler);
            socket.off("stop_typing", stopTypingHandler);
            socket.off("messages_read", messagesReadHandler);
        };
    }, [socket, selectedChat, userInfo._id]);

    // ----------------------------------------------------------------------
    // MULTIPART AWS S3 FILE UPLOAD HANDLER
    // Executes an initial binary blob request through Express explicitly out to the AWS architecture.
    // It blocks the UI safely with a spinner until AWS yields a successful public bucket URL.
    // Once successful, we simply append the formal URL object structurally to a standard New Message payload!
    // ----------------------------------------------------------------------
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);
        
        let type = 'file';
        if (file.type.startsWith('image')) type = 'image';
        else if (file.type.startsWith('video')) type = 'video';
        else if (file.type.startsWith('audio')) type = 'audio';

        try {
            const { data } = await axios.post('/api/messages/upload', formData, {
                withCredentials: true,
            });
            
            const messageData = {
                content: file.name,
                chatId: selectedChat._id,
                type: type,
                mediaUrl: data.url
            };

            const { data: sentMessage } = await axios.post('/api/messages', messageData, { withCredentials: true });
            socket.emit("new_message", sentMessage);
            setMessages(prev => [...prev, sentMessage]);
        } catch (error) {
            console.error("Failed to upload/send file", error);
            alert("File upload failed!");
        } finally {
            setUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        if(!newMessage.trim()) return;
        socket.emit("stop_typing", selectedChat._id);
        
        try {
            const content = newMessage;
            setNewMessage("");
            const { data } = await axios.post('/api/messages', 
                { content, chatId: selectedChat._id }, 
                { withCredentials: true }
            );
            
            socket.emit("new_message", data);
            setMessages([...messages, data]);
        } catch (error) {
            console.error("Failed to send the message", error);
        }
    };

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if(!socket) return;

        if(!typing){
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }

        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if(timeDiff >= timerLength && typing){
                socket.emit("stop_typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    if (!selectedChat) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full w-full">
                <div className="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-full mb-4 shadow-inner ring-4 ring-white/50 dark:ring-gray-800/50 transition-all">
                    <MessageSquare className="w-16 h-16 text-indigo-500 dark:text-indigo-400 animate-pulse delay-700" />
                </div>
                <h2 className="text-3xl font-bold dark:text-white text-gray-800 font-sans tracking-tight">Welcome, {userInfo?.username}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center max-w-sm">
                    Select a conversation from the sidebar or search for users to start chatting right away.
                </p>
            </div>
        );
    }

    const chatName = selectedChat.isGroupChat ? selectedChat.chatName : (selectedChat.users[0]._id === userInfo._id ? selectedChat.users[1].username : selectedChat.users[0].username);
    const chatPic = selectedChat.isGroupChat ? `https://robohash.org/${selectedChat._id}?set=set3&bgset=bg2&size=200x200` : (selectedChat.users[0]._id === userInfo._id ? selectedChat.users[1].profilePic : selectedChat.users[0].profilePic);

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full bg-transparent">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md flex items-center px-4 sm:px-6 sticky top-0 z-10 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button onClick={() => dispatch(setSelectedChat(null))} className="md:hidden p-1.5 -ml-1 mr-1 text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700 rounded-full transition-colors shadow-sm bg-white dark:bg-gray-800 outline outline-1 outline-gray-200 dark:outline-gray-700">
                        <ArrowLeft className="w-4 h-4"/>
                    </button>
                    <img src={chatPic} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 object-cover" />
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate flex-1 min-w-0 max-w-[200px]">
                        {chatName}
                    </h3>
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse ml-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] flex-shrink-0"></div>
                </div>
            </div>
            
            {/* Messages Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col no-scrollbar">
                {loading ? (
                    <div className="flex w-full h-full items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : (
                    messages.map((m, i) => {
                        const isMyMessage = m.sender._id === userInfo._id;
                        return (
                            <div key={m._id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`${isMyMessage ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm'} px-4 py-2 rounded-2xl shadow-sm max-w-[70%]`}>
                                    {!isMyMessage && selectedChat.isGroupChat && <p className="text-[10px] font-bold mb-1 opacity-70">{m.sender.username}</p>}
                                    
                                    {m.mediaUrl && (
                                        <div className="mb-2 w-full relative group">
                                            {m.type === 'image' ? (
                                                <img src={m.mediaUrl} onLoad={scrollToBottom} alt="attachment" className="max-w-full max-h-64 rounded-xl object-contain cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setFullScreenMedia({type: 'image', url: m.mediaUrl})} />
                                            ) : m.type === 'video' ? (
                                                <div className="relative inline-block cursor-pointer" onClick={() => setFullScreenMedia({type: 'video', url: m.mediaUrl})}>
                                                    <video src={m.mediaUrl} onLoadedMetadata={scrollToBottom} className="max-w-full max-h-64 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none"></video>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl group-hover:bg-black/10 transition">
                                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
                                                            <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-white ml-1"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <a href={m.mediaUrl} target="_blank" rel="noreferrer" className="underline text-sm font-semibold flex items-center gap-1.5"><Paperclip className="w-4 h-4"/> {m.content || 'Download File'}</a>
                                            )}
                                        </div>
                                    )}
                                    {(m.type === 'text' || (!m.type) || (m.type !== 'image' && m.type !== 'video')) && <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>}

                                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMyMessage ? 'text-indigo-200' : 'text-gray-400'}`}>
                                        <span className="text-[10px]">
                                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMyMessage && (
                                            (() => {
                                                const readByArray = Array.isArray(m.readBy) ? m.readBy : [];
                                                const isSeen = readByArray.some(obj => String(obj._id || obj) !== String(userInfo._id));
                                                
                                                if (isSeen) return <CheckCheck className="w-4 h-4 text-cyan-300 drop-shadow-md" strokeWidth={3} />;
                                                
                                                const receiver = selectedChat.users.find(u => String(u._id) !== String(userInfo._id));
                                                const isDelivered = onlineUsers.includes(receiver?._id);
                                                
                                                if (isDelivered) return <CheckCheck className="w-4 h-4 text-indigo-300" opacity={0.8} strokeWidth={2} />;
                                                return <Check className="w-4 h-4 text-indigo-300" opacity={0.8} strokeWidth={2} />;
                                            })()
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form Frame: Glassmorphism Footer containing dynamic S3 upload triggers and standard text transmission logic */}
            <div className="p-3 sm:p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/60 flex-shrink-0 pb-6 sm:pb-4">
                <form onSubmit={sendMessage} className="flex items-center gap-1 sm:gap-3 w-full max-w-4xl mx-auto relative rounded-full bg-white dark:bg-gray-700 shadow border border-gray-100 dark:border-gray-600 px-1 sm:px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                    <input 
                        type="file" 
                        accept="image/*,video/*,application/pdf"
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-1 sm:p-2 text-gray-400 hover:text-indigo-500 transition-colors ml-0.5 sm:ml-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                    <input 
                        type="text" 
                        placeholder="Type your message..." 
                        value={newMessage}
                        onChange={typingHandler}
                        className="flex-1 min-w-0 bg-transparent border-none outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 text-[13px] sm:text-sm h-10 px-1 sm:px-2"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-2 sm:p-2.5 rounded-full shadow-md transition-colors mr-0.5 flex-shrink-0">
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                </form>
            </div>

            {/* Fullscreen Media Viewer */}
            {fullScreenMedia && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200" onClick={() => setFullScreenMedia(null)}>
                    <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/20 rounded-full transition cursor-pointer"><X className="w-8 h-8"/></button>
                    {fullScreenMedia.type === 'image' ? (
                        <img src={fullScreenMedia.url} className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()} />
                    ) : (
                        <video src={fullScreenMedia.url} controls autoPlay className="max-w-full max-h-[90vh] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] outline-none" onClick={e => e.stopPropagation()} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBox;
