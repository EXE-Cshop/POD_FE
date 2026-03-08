import React, { useState, useRef, useEffect } from 'react';
import { chatBotService } from '../services/api';

const QUICK_ACTIONS = [
    { label: '📏 Tư vấn Size', keyword: 'size' },
    { label: '👕 Gợi ý Style', keyword: 'style' },
    { label: '🎨 Hướng dẫn thiết kế', keyword: 'design' },
    { label: '👗 Thử đồ ảo', keyword: 'tryon' },
    { label: '🚚 Giao hàng', keyword: 'shipping' },
];

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "Xin chào! 👋 Mình là trợ lý AI của **POD Print**.\n\nMình có thể giúp bạn tư vấn size, kiểu áo phù hợp, hoặc hướng dẫn thiết kế.\n\nBạn cần hỗ trợ gì nhé?",
            time: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setHasUnread(false);
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Use ref to keep track of latest messages for sendMessage closure
    const messagesRef = useRef(messages);
    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    // Global event listener to open chatbox from anywhere (e.g. Design Editor)
    useEffect(() => {
        const handleOpenChatbox = (e) => {
            setIsOpen(true);
            if (e.detail?.message || e.detail?.image) {
                // Small delay to ensure UI is ready
                setTimeout(() => {
                    sendMessage(e.detail.message || '', e.detail.image);
                }, 100);
            }
        };
        window.addEventListener('openChatbox', handleOpenChatbox);
        return () => window.removeEventListener('openChatbox', handleOpenChatbox);
    }, []);

    const sendMessage = async (text, imageBase64 = null) => {
        if (!text.trim() && !imageBase64) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text.trim(),
            image: imageBase64,
            time: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Build history strictly matching ChatRequest format expected by backend
            const history = messagesRef.current.map(msg => ({
                role: msg.sender === 'bot' ? 'assistant' : 'user',
                content: msg.text
            }));

            const response = await chatBotService.chat({
                message: text.trim(),
                history: history,
                image: imageBase64
            });

            const reply = response.data?.reply || response.data?.data?.reply || "Xin lỗi, mình không thể giải đáp được câu hỏi này. 😢";

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: reply,
                time: new Date()
            }]);
        } catch (error) {
            console.error("Chatbot API Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: "Xin lỗi, hệ thống đang gặp sự cố kết nối. Vui lòng thử lại sau nhé! 🛠️",
                time: new Date()
            }]);
        } finally {
            setIsTyping(false);
            if (!isOpen) setHasUnread(true);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickAction = (keyword) => {
        const labels = {
            size: 'Tư vấn size cho tôi',
            style: 'Gợi ý kiểu áo phù hợp',
            design: 'Hướng dẫn thiết kế',
            tryon: 'Thử đồ ảo như thế nào?',
            shipping: 'Thông tin giao hàng',
        };
        sendMessage(labels[keyword] || keyword);
    };

    const formatMessage = (text) => {
        return text.split('\n').map((line, i) => {
            const formatted = line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/• /g, '<span class="text-primary mr-1">•</span> ');
            return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: formatted }} />;
        });
    };

    return (
        <>
            {/* Chat Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-[100] size-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 group ${isOpen
                    ? 'bg-slate-800 rotate-0 scale-95'
                    : 'bg-gradient-to-br from-primary to-emerald-400 hover:scale-110 shadow-primary/40'
                    }`}
                style={{ animation: !isOpen ? 'pulse-chat 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }}
            >
                <span className={`material-symbols-outlined text-[28px] transition-all duration-300 ${isOpen ? 'text-white rotate-90' : 'text-[#11221c]'}`}>
                    {isOpen ? 'close' : 'smart_toy'}
                </span>
                {hasUnread && !isOpen && (
                    <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        1
                    </span>
                )}
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-24 right-6 z-[99] w-[380px] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 origin-bottom-right ${isOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-75 translate-y-8 pointer-events-none'
                    }`}
                style={{
                    background: 'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(15,23,42,0.99))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                {/* Header */}
                <div className="relative px-5 py-4 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/10"></div>
                    <div className="relative flex items-center gap-3">
                        <div className="relative">
                            <div className="size-10 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px] text-[#11221c]">smart_toy</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-400 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-bold text-sm">POD Print AI</h3>
                            <p className="text-emerald-400 text-xs font-medium">Online — Sẵn sàng tư vấn</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="size-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <span className="material-symbols-outlined text-white/60 text-[18px]">remove</span>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="h-[360px] overflow-y-auto p-4 space-y-4 scrollbar-thin" id="chatbox-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-primary to-emerald-400 text-[#11221c] rounded-br-md'
                                : 'bg-white/8 text-slate-200 border border-white/5 rounded-bl-md'
                                }`}
                                style={msg.sender === 'bot' ? { background: 'rgba(255,255,255,0.06)' } : {}}
                            >
                                {msg.image && (
                                    <div className="mb-2">
                                        <img src={msg.image} alt="Attached image" className="max-w-full rounded border border-white/20 shadow-sm" style={{ maxHeight: '160px', objectFit: 'contain' }} />
                                    </div>
                                )}
                                {msg.text && formatMessage(msg.text)}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/6 rounded-2xl rounded-bl-md px-5 py-3 border border-white/5"
                                style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div className="flex items-center gap-1.5">
                                    <div className="size-2 bg-primary rounded-full" style={{ animation: 'typing-bounce 1.4s infinite ease-in-out', animationDelay: '0s' }}></div>
                                    <div className="size-2 bg-primary rounded-full" style={{ animation: 'typing-bounce 1.4s infinite ease-in-out', animationDelay: '0.2s' }}></div>
                                    <div className="size-2 bg-primary rounded-full" style={{ animation: 'typing-bounce 1.4s infinite ease-in-out', animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_ACTIONS.map(action => (
                                <button
                                    key={action.keyword}
                                    onClick={() => handleQuickAction(action.keyword)}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 text-xs text-slate-300 hover:text-primary border border-white/10 hover:border-primary/30 transition-all duration-200"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/10 focus-within:border-primary/50 transition-colors">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Hỏi về size, kiểu áo, thiết kế..."
                            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            className={`size-8 rounded-lg flex items-center justify-center transition-all duration-200 ${inputValue.trim()
                                ? 'bg-primary text-[#11221c] hover:scale-105'
                                : 'bg-white/5 text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AIChatbox;
