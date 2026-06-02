import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, X, User, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ChatWindow = ({ currentUser, receiver, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const socketRef = useRef();
    const scrollRef = useRef();

    // Create a unique room ID by sorting and joining user IDs
    const room = [currentUser.id, receiver.id].sort().join('_');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        // 1. Fetch History
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/chat/history/${room}`);
                setMessages(res.data);
            } catch (err) {
                console.error("History fetch error:", err);
            }
        };
        fetchHistory();

        // 2. Setup Socket
        const socketUrl = (import.meta.env.VITE_SOCKET_URL || API_URL).replace('/api', '');
        socketRef.current = io(socketUrl);
        
        socketRef.current.emit('join_room', room);

        socketRef.current.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
            setOtherTyping(false);
        });

        socketRef.current.on('user_typing', (data) => {
            if (data.userId !== currentUser.id) {
                setOtherTyping(true);
                setTimeout(() => setOtherTyping(false), 3000);
            }
        });

        return () => socketRef.current.disconnect();
    }, [room]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, otherTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageData = {
            sender: currentUser.id,
            receiver: receiver.id,
            content: newMessage,
            room: room,
            timestamp: new Date()
        };

        socketRef.current.emit('send_message', messageData);
        setNewMessage('');
        setIsTyping(false);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.emit('typing', { room, userId: currentUser.id });
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] glass-card rounded-[2.5rem] shadow-2xl flex flex-col z-[100] border-2 border-emerald-500/20 overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                            {receiver.name?.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="font-black text-sm">{receiver.name}</h4>
                        <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active Now</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                            msg.sender === currentUser.id 
                                ? 'bg-emerald-600 text-white rounded-tr-none' 
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                        }`}>
                            {msg.content}
                            <div className={`text-[10px] mt-1 opacity-60 flex items-center gap-1 ${
                                msg.sender === currentUser.id ? 'justify-end' : 'justify-start'
                            }`}>
                                <Clock size={8} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
                {otherTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default ChatWindow;
