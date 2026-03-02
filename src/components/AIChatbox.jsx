import React, { useState, useRef, useEffect } from 'react';

const API_URL = 'http://localhost:8080/api/v1/chatbot';

const QUICK_ACTIONS = [
    { label: '📏 Tư vấn Size', message: 'Tư vấn chọn size áo cho tôi' },
    { label: '🎨 Hướng dẫn thiết kế', message: 'Hướng dẫn dùng Design Editor' },
    { label: '👗 Thử đồ ảo', message: 'Hướng dẫn thử đồ ảo Virtual Try-On' },
    { label: '🚚 Giao hàng', message: 'Thông tin giao hàng' },
    { label: '🛒 Cách đặt hàng', message: 'Hướng dẫn cách đặt hàng' },
];

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: "Xin chào! 👋 Mình là trợ lý AI của **POD Print**.\n\nMình có thể giúp bạn:\n• 📏 Tư vấn chọn size phù hợp\n• 🎨 Hướng dẫn thiết kế áo\n• 👗 Hướng dẫn thử đồ ảo\n• 🚚 Thông tin giao hàng & đơn hàng\n• 🖼️ **Đánh giá thiết kế** — gửi ảnh áo để AI review!\n\nBạn cần hỗ trợ gì nhé?",
            time: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(true);
    const [designImage, setDesignImage] = useState(null); // base64 design image for review
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

    // Listen for design review event from DesignEditor
    useEffect(() => {
        const handleDesignReview = (e) => {
            const imageData = e.detail?.image || localStorage.getItem('pod_design_for_review');
            if (imageData) {
                setDesignImage(imageData);
                setIsOpen(true);
                // Auto-send review request
                setTimeout(() => {
                    sendDesignReview(imageData, 'Hãy đánh giá thiết kế áo này giúp mình! Nhận xét về bố cục, phối màu, tỉ lệ và cho gợi ý cải thiện.');
                }, 500);
            }
        };

        window.addEventListener('pod-design-review', handleDesignReview);
        return () => window.removeEventListener('pod-design-review', handleDesignReview);
    }, []);

    const buildHistory = (currentMessages) => {
        return currentMessages
            .filter(m => m.id !== 1)
            .map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
    };

    // Send design image for AI review
    const sendDesignReview = async (imageData, text) => {
        if (isTyping) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text,
            image: imageData, // store image for display
            time: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setIsTyping(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: buildHistory(newMessages).slice(-6),
                    image: imageData,
                }),
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.reply || 'Xin lỗi, mình không nhận được phản hồi.',
                time: new Date()
            }]);
        } catch (error) {
            console.error('Design review error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: 'Xin lỗi, mình đang gặp sự cố. Vui lòng thử lại sau nhé! 😊',
                time: new Date()
            }]);
        } finally {
            setIsTyping(false);
            setDesignImage(null);
            localStorage.removeItem('pod_design_for_review');
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim() || isTyping) return;

        // Check if there's a pending design image to review
        if (designImage) {
            sendDesignReview(designImage, text.trim());
            setInputValue('');
            return;
        }

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text.trim(),
            time: new Date()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text.trim(),
                    history: buildHistory(newMessages).slice(-10),
                }),
            });

            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            const data = await response.json();

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: data.reply || 'Xin lỗi, mình không nhận được phản hồi.',
                time: new Date()
            }]);
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: 'Xin lỗi, mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé! 😊',
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

    const handleQuickAction = (message) => {
        sendMessage(message);
    };

    // Manual design review — load from localStorage
    const handleDesignReviewClick = () => {
        const savedDesign = localStorage.getItem('pod_design_for_review') || localStorage.getItem('pod_tryon_design');
        if (savedDesign) {
            sendDesignReview(savedDesign, 'Hãy đánh giá thiết kế áo này giúp mình! Nhận xét về bố cục, phối màu, tỉ lệ và cho gợi ý cải thiện.');
        } else {
            setMessages(prev => [...prev, {
                id: Date.now(),
                sender: 'bot',
                text: '⚠️ Chưa có thiết kế nào để đánh giá. Hãy vào **Design Editor** và bấm nút **🤖 AI Review** trên thanh công cụ để gửi thiết kế cho mình nhé!',
                time: new Date()
            }]);
        }
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
                            <p className="text-emerald-400 text-xs font-medium">
                                {isTyping ? '✍️ Đang trả lời...' : 'Online — Sẵn sàng tư vấn'}
                            </p>
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
                                {/* Show design image thumbnail if message has image */}
                                {msg.image && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-white/20">
                                        <img src={msg.image} alt="Design" className="w-full max-h-[150px] object-contain bg-white/10" />
                                    </div>
                                )}
                                {formatMessage(msg.text)}
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
                                    key={action.message}
                                    onClick={() => handleQuickAction(action.message)}
                                    disabled={isTyping}
                                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-primary/20 text-xs text-slate-300 hover:text-primary border border-white/10 hover:border-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {action.label}
                                </button>
                            ))}
                            {/* Design Review quick action */}
                            <button
                                onClick={handleDesignReviewClick}
                                disabled={isTyping}
                                className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-xs text-purple-300 hover:text-purple-200 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🖼️ AI đánh giá thiết kế
                            </button>
                        </div>
                    </div>
                )}

                {/* Design image pending indicator */}
                {designImage && (
                    <div className="px-4 pb-2">
                        <div className="flex items-center gap-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <img src={designImage} alt="Design" className="size-10 rounded object-contain bg-white/10" />
                            <div className="flex-1">
                                <p className="text-xs text-purple-300 font-medium">Thiết kế đã sẵn sàng</p>
                                <p className="text-[10px] text-slate-500">Gõ câu hỏi hoặc gửi để AI đánh giá</p>
                            </div>
                            <button onClick={() => { setDesignImage(null); localStorage.removeItem('pod_design_for_review'); }}
                                className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined text-[14px]">close</span>
                            </button>
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
                            placeholder={designImage ? "Hỏi gì về thiết kế này..." : "Hỏi về size, thiết kế, thử đồ..."}
                            disabled={isTyping}
                            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 outline-none disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isTyping}
                            className={`size-8 rounded-lg flex items-center justify-center transition-all duration-200 ${inputValue.trim() && !isTyping
                                ? 'bg-primary text-[#11221c] hover:scale-105'
                                : 'bg-white/5 text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes pulse-chat {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(56, 224, 120, 0.4); }
                    50% { box-shadow: 0 0 0 12px rgba(56, 224, 120, 0); }
                }
                @keyframes typing-bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </>
    );
};

export default AIChatbox;
