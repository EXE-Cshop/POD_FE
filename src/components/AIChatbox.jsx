import React, { useState, useRef, useEffect } from 'react';

const AI_RESPONSES = {
    size: {
        keywords: ['size', 'kích thước', 'cỡ', 'vừa', 'fit', 'sizing', 'bảng size'],
        reply: "📏 Đây là hướng dẫn chọn size:\n\n• **S**: Ngực 86-90cm, Cao 155-165cm\n• **M**: Ngực 90-96cm, Cao 160-170cm\n• **L**: Ngực 96-102cm, Cao 165-175cm\n• **XL**: Ngực 102-108cm, Cao 170-180cm\n• **2XL**: Ngực 108-114cm, Cao 175-185cm\n\nBạn nặng bao nhiêu kg và cao bao nhiêu? Mình sẽ tư vấn size phù hợp nhất! 😊"
    },
    style: {
        keywords: ['kiểu', 'style', 'mẫu', 'đẹp', 'hợp', 'phối', 'phù hợp', 'nên mặc', 'gợi ý', 'recommend'],
        reply: "👕 Gợi ý phối đồ theo dáng người:\n\n• **Dáng gầy**: Áo oversize/relaxed fit, tạo cảm giác đầy đặn hơn\n• **Dáng cân đối**: Regular fit hoặc Slim fit đều hợp\n• **Dáng đầy đặn**: Áo regular fit, tránh quá ôm sát\n\n🎨 Màu yêu thích của bạn là gì? Mình sẽ gợi ý thiết kế phù hợp!"
    },
    shipping: {
        keywords: ['ship', 'giao', 'delivery', 'vận chuyển', 'bao lâu', 'ngày'],
        reply: "🚚 Thông tin giao hàng:\n\n• **Nội thành**: 1-2 ngày làm việc\n• **Ngoại thành**: 3-5 ngày làm việc\n• **Miễn phí ship** cho đơn từ 500K\n\nBạn cần biết thêm gì không? 😊"
    },
    order: {
        keywords: ['đơn hàng', 'order', 'tracking', 'theo dõi', 'trạng thái'],
        reply: "📦 Để kiểm tra đơn hàng, bạn vào mục **My Orders** trên thanh navigation nhé!\n\nNếu cần hỗ trợ thêm về đơn hàng, bạn cho mình mã đơn hàng nhé! 🔍"
    },
    design: {
        keywords: ['thiết kế', 'design', 'custom', 'tùy chỉnh', 'in', 'print'],
        reply: "🎨 Bạn có thể tự thiết kế áo tại **Design Editor**!\n\n1. Chọn sản phẩm từ Catalog\n2. Nhấn \"Customize This Product\"\n3. Upload hình, thêm text, chọn màu\n4. Nhấn **Try On** để xem trước trên người bạn!\n\nBắt đầu thiết kế ngay nhé? 🚀"
    },
    tryon: {
        keywords: ['thử', 'try on', 'try-on', 'virtual', 'thử đồ', 'mặc thử'],
        reply: "👗 Tính năng **Virtual Try-On** cho phép bạn:\n\n1. Thiết kế áo ở Design Editor\n2. Nhấn nút \"Try On\" để chụp thiết kế\n3. Upload ảnh cá nhân\n4. Xem áo đã thiết kế trên người bạn!\n\nHãy thử ngay tại trang Virtual Try-On nhé! ✨"
    },
    greeting: {
        keywords: ['hi', 'hello', 'xin chào', 'chào', 'hey', 'alo'],
        reply: "Xin chào! 👋 Mình là trợ lý AI của **POD Print**.\n\nMình có thể giúp bạn:\n• 📏 Tư vấn chọn size phù hợp\n• 👕 Gợi ý kiểu áo hợp dáng\n• 🎨 Hướng dẫn thiết kế\n• 🚚 Thông tin giao hàng\n\nBạn cần hỗ trợ gì nhé?"
    }
};

const QUICK_ACTIONS = [
    { label: '📏 Tư vấn Size', keyword: 'size' },
    { label: '👕 Gợi ý Style', keyword: 'style' },
    { label: '🎨 Hướng dẫn thiết kế', keyword: 'design' },
    { label: '👗 Thử đồ ảo', keyword: 'tryon' },
    { label: '🚚 Giao hàng', keyword: 'shipping' },
];

function getAIReply(message) {
    const lower = message.toLowerCase();
    for (const [, data] of Object.entries(AI_RESPONSES)) {
        for (const kw of data.keywords) {
            if (lower.includes(kw)) {
                return data.reply;
            }
        }
    }
    return "Cảm ơn bạn đã nhắn! 😊 Mình có thể hỗ trợ bạn về:\n• Tư vấn size & style\n• Hướng dẫn thiết kế\n• Thử đồ ảo\n• Thông tin giao hàng & đơn hàng\n\nBạn quan tâm chủ đề nào nhé?";
}

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

    const sendMessage = (text) => {
        if (!text.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: text.trim(),
            time: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const reply = getAIReply(text);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: 'bot',
                text: reply,
                time: new Date()
            }]);
            setIsTyping(false);
            if (!isOpen) setHasUnread(true);
        }, 800 + Math.random() * 1200);
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
