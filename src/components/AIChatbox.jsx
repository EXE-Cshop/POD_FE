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

const SIZE_CHART = [
    { size: 'S', minWeight: 40, maxWeight: 55, minHeight: 155, maxHeight: 165, chest: '86-90cm' },
    { size: 'M', minWeight: 55, maxWeight: 65, minHeight: 160, maxHeight: 170, chest: '90-96cm' },
    { size: 'L', minWeight: 63, maxWeight: 75, minHeight: 165, maxHeight: 175, chest: '96-102cm' },
    { size: 'XL', minWeight: 73, maxWeight: 85, minHeight: 170, maxHeight: 180, chest: '102-108cm' },
    { size: '2XL', minWeight: 83, maxWeight: 100, minHeight: 175, maxHeight: 190, chest: '108-114cm' },
];

function parseMeasurements(message) {
    const lower = message.toLowerCase().replace(/,/g, '.').replace(/\s+/g, ' ');

    let weight = null;
    let height = null;

    // Pattern: "65kg" or "65 kg" or "nặng 65" or "cân nặng 65"
    const weightPatterns = [
        /(\d{2,3})\s*kg/i,
        /nặng\s*[:.]?\s*(\d{2,3})/i,
        /cân\s*(?:nặng)?\s*[:.]?\s*(\d{2,3})/i,
        /weight\s*[:.]?\s*(\d{2,3})/i,
    ];

    // Pattern: "170cm" or "170 cm" or "cao 170" or "chiều cao 170" or "1m70" or "1.70m"
    const heightPatterns = [
        /(\d{2,3})\s*cm/i,
        /cao\s*[:.]?\s*(\d{2,3})/i,
        /chiều\s*cao\s*[:.]?\s*(\d{2,3})/i,
        /height\s*[:.]?\s*(\d{2,3})/i,
        /(\d)[.,](\d{1,2})\s*m(?:et|ét)?/i,  // 1.70m, 1,70m
        /(\d)\s*m\s*(\d{1,2})/i,              // 1m70
    ];

    for (const pattern of weightPatterns) {
        const match = lower.match(pattern);
        if (match) {
            weight = parseInt(match[1]);
            break;
        }
    }

    for (const pattern of heightPatterns) {
        const match = lower.match(pattern);
        if (match) {
            if (match[2] !== undefined) {
                // Format like 1m70 or 1.70m
                const meters = parseInt(match[1]);
                const decimals = match[2].length === 1 ? parseInt(match[2]) * 10 : parseInt(match[2]);
                height = meters * 100 + decimals;
            } else {
                height = parseInt(match[1]);
                // If height < 100, might be in meters like "170" is fine, but "1" alone needs *100
                if (height < 10) height = height * 100;
            }
            break;
        }
    }

    // Try to find two standalone numbers if we still don't have both
    if (weight === null || height === null) {
        const numbers = lower.match(/\b(\d{2,3})\b/g);
        if (numbers) {
            const nums = numbers.map(Number);
            for (const n of nums) {
                if (n >= 130 && n <= 200 && height === null) {
                    height = n;
                } else if (n >= 30 && n <= 120 && weight === null) {
                    weight = n;
                }
            }
        }
    }

    if (weight !== null && (weight < 30 || weight > 150)) weight = null;
    if (height !== null && (height < 130 || height > 210)) height = null;

    return { weight, height };
}

function recommendSize(weight, height) {
    let bestSize = null;
    let bestScore = -Infinity;

    for (const s of SIZE_CHART) {
        let score = 0;

        if (weight !== null) {
            if (weight >= s.minWeight && weight <= s.maxWeight) {
                score += 2;
            } else {
                const distW = Math.min(Math.abs(weight - s.minWeight), Math.abs(weight - s.maxWeight));
                score -= distW * 0.1;
            }
        }

        if (height !== null) {
            if (height >= s.minHeight && height <= s.maxHeight) {
                score += 2;
            } else {
                const distH = Math.min(Math.abs(height - s.minHeight), Math.abs(height - s.maxHeight));
                score -= distH * 0.1;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestSize = s;
        }
    }

    return bestSize;
}

function getSizeReply(weight, height) {
    const rec = recommendSize(weight, height);
    if (!rec) return null;

    let intro = '';
    if (weight !== null && height !== null) {
        intro = `Với chiều cao **${height}cm** và cân nặng **${weight}kg**`;
    } else if (height !== null) {
        intro = `Với chiều cao **${height}cm**`;
    } else if (weight !== null) {
        intro = `Với cân nặng **${weight}kg**`;
    }

    const fitNote = weight !== null && height !== null
        ? (weight > rec.maxWeight ? '\n\n💡 *Nếu bạn thích mặc thoải mái hơn, có thể chọn lên 1 size nhé!*' :
            weight < rec.minWeight ? '\n\n💡 *Nếu bạn thích áo ôm hơn, có thể chọn xuống 1 size nhé!*' : '')
        : '';

    return `${intro}, mình đề xuất bạn chọn size **${rec.size}** nhé! 👕\n\n📐 **Thông số size ${rec.size}:**\n• Số đo ngực: ${rec.chest}\n• Chiều cao phù hợp: ${rec.minHeight}-${rec.maxHeight}cm\n• Cân nặng phù hợp: ${rec.minWeight}-${rec.maxWeight}kg${fitNote}\n\n✅ Size **${rec.size}** sẽ vừa vặn và thoải mái nhất cho bạn!\n\nBạn có muốn biết thêm về cách phối đồ hoặc chọn kiểu áo không? 😊`;
}

const QUICK_ACTIONS = [
    { label: '📏 Tư vấn Size', keyword: 'size' },
    { label: '👕 Gợi ý Style', keyword: 'style' },
    { label: '🎨 Hướng dẫn thiết kế', keyword: 'design' },
    { label: '👗 Thử đồ ảo', keyword: 'tryon' },
    { label: '🚚 Giao hàng', keyword: 'shipping' },
];

function getAIReply(message) {
    const lower = message.toLowerCase();

    // Check for body measurements first (weight/height)
    const { weight, height } = parseMeasurements(message);
    if (weight !== null || height !== null) {
        const sizeReply = getSizeReply(weight, height);
        if (sizeReply) return sizeReply;
    }

    // Then check keyword-based responses
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
