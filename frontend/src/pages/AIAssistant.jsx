import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Loader2, Bot, User, Sparkles, Compass } from "lucide-react";

const AIAssistant = () => {
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Ayubowan! 🙏 I am your Ceylon Traveler assistant. Ask me about itineraries, hidden waterfalls, or the best local food!' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const suggestions = [
        "Plan a 3-day trip to Ella",
        "Best time to visit Mirissa?",
        "Hidden waterfalls in Nuwara Eliya",
        "Cost of a safari in Yala"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (textOverride = null) => {
        const userText = textOverride || input.trim();
        if (!userText || loading) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setMessages(prev => [...prev, { role: 'user', text: userText }]);
            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'model', text: "🔒 Please login to use the AI Assistant." }]);
            }, 500);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await axios.post(`${API_URL}/api/planning/chat`, 
                { message: userText, history: messages },
                { headers: { 'x-auth-token': token } }
            );

            setMessages(prev => [...prev, { role: 'model', text: response.data.text }]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "😔 Connection error. The AI is taking a short break. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] border border-gray-100 relative">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <Bot className="text-white w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-xl tracking-wide">Travel Assistant</h1>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <p className="text-teal-100 text-sm">Online & Ready to Help</p>
                            </div>
                        </div>
                    </div>
                    <Compass className="text-white/20 w-12 h-12 absolute right-6 top-6 rotate-12" />
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 custom-scrollbar">
                    <div className="flex justify-center">
                        <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Today</span>
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-teal-100'}`}>
                                {msg.role === 'user' ? <User size={18} className="text-indigo-600"/> : <Sparkles size={18} className="text-teal-600"/>}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-line
                                ${msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm ml-14">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Planning your trip...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white border-t border-gray-100">
                    {messages.length < 3 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s)} className="whitespace-nowrap px-4 py-2 bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-gray-600 text-sm rounded-full transition border border-transparent hover:border-teal-200">
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="relative flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about hotels, locations, or guides..."
                            className="w-full bg-gray-100 text-gray-700 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-inner"
                        />
                        <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="absolute right-2 p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition shadow-lg">
                            <Send size={20} className={loading ? "opacity-0" : "ml-0.5"} />
                            {loading && <Loader2 size={20} className="absolute top-2 left-2 animate-spin" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;