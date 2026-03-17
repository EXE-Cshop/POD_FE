import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { giftService } from '../services/api';

/**
 * GiftUnboxing — Mobile-first trải nghiệm mở thiệp QR.
 *
 * Route: /gift/:uuid
 *
 * Flow:
 *   1. Fetch dữ liệu gift từ backend qua UUID.
 *   2. Hiển thị phong bì (envelope) đóng kín với animation nhẹ.
 *   3. Khi user nhấn/chạm → envelope mở ra và fade out.
 *   4. Confetti bắn + fade-in video autoPlay + tin nhắn chúc mừng.
 */
const GiftUnboxing = () => {
  const { uuid } = useParams();

  // ─── State ────────────────────────────────────────────────────────
  const [gift, setGift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpened, setIsOpened] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // ─── Fetch gift data / Preview Mode ──────────────────────────────
  useEffect(() => {
    // Check for query parameters (Preview Mode)
    const params = new URLSearchParams(window.location.search);
    const previewName = params.get('n');
    const previewMsg = params.get('m');
    const previewTheme = params.get('t');
    const previewPhoto = params.get('p');
    const previewVideo = params.get('v');

    if (previewName || previewMsg || previewTheme) {
      setGift({
        recipientName: previewName,
        messageText: previewMsg,
        themeName: previewTheme,
        photoUrl: previewPhoto,
        videoUrl: previewVideo,
        mediaUrl: previewVideo // backward compat with existing component logic
      });
      setLoading(false);
      return;
    }

    // Normal Mode: Fetch from backend by UUID
    giftService
      .getByUuid(uuid)
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setGift(data);
      })
      .catch((err) => {
        console.error('[GiftUnboxing] fetch failed:', err);
        setError(
          err.response?.status === 404
            ? 'Thiệp không tồn tại hoặc đã hết hạn.'
            : 'Không thể tải thiệp. Vui lòng thử lại sau.'
        );
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  // Cập nhật kích thước cửa sổ cho confetti
  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Xử lý mở envelope ───────────────────────────────────────────
  const handleOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    setShowConfetti(true);
    // Tắt confetti sau 5 giây
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-300/40 border-t-rose-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-rose-400 text-sm font-medium">Đang tải thiệp...</p>
        </div>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-amber-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <span className="material-symbols-outlined text-5xl text-rose-300 mb-4">
            sentiment_dissatisfied
          </span>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Ôi không!</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ─── Floating Hearts BG ──────────────────────────────────────────
  const FloatingHearts = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      {[...Array(12)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute material-symbols-outlined"
          style={{ 
            color: gift?.themeName === 'Modern Minimal' ? '#13b9a5' : '#FF6B6B',
            fontSize: '24px',
            top: -100 // Start off-screen
          }}
          initial={{
            x: Math.random() * windowSize.width,
            y: windowSize.height + 100,
            rotate: Math.random() * 360,
            scale: 0.5 + Math.random()
          }}
          animate={{
            y: -200,
            rotate: Math.random() * 360 + 360,
          }}
          transition={{
            duration: 15 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
        >
          {gift?.themeName === 'Luxury Gold' ? 'award_star' : 'favorite'}
        </motion.span>
      ))}
    </div>
  );

  // ─── Main UI ──────────────────────────────────────────────────────
  const themeData = {
    'Modern Minimal': { gradient: 'from-rose-50 to-amber-50', primary: 'rose-500' },
    'Luxury Gold': { gradient: 'from-amber-50 to-orange-100', primary: 'amber-600' },
    'Midnight Blue': { gradient: 'from-slate-900 to-slate-800', primary: 'blue-400', isDark: true },
    'Custom Photo': { gradient: 'from-slate-50 to-slate-100', primary: 'primary' }
  };
  const currentTheme = themeData[gift?.themeName] || themeData['Modern Minimal'];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden relative font-display bg-gradient-to-b ${currentTheme.gradient}`}>
      <FloatingHearts />
      
      {/* Background Photo (for Custom Photo theme) */}
      {gift?.themeName === 'Custom Photo' && gift?.photoUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 grayscale-[0.3]" 
          style={{ backgroundImage: `url('${gift.photoUrl}')` }}
        />
      )}

      {/* ── Confetti ────────────────────────────────────────────── */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={300}
          recycle={false}
          gravity={0.12}
          colors={[
            gift?.themeName === 'Luxury Gold' ? '#D4AF37' : '#13b9a5', 
            '#FFD93D', '#FF6B6B', '#4D96FF', '#ffffff'
          ]}
        />
      )}

      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -100, rotateX: 45 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="cursor-pointer select-none relative"
            onClick={handleOpen}
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-75 animate-pulse"></div>

            {/* Envelope Card */}
            <div className="relative w-80 h-60 bg-white rounded-[2rem] border-2 border-primary/20 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-8">
              <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <span className="material-symbols-outlined text-4xl animate-bounce">mail</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-1 italic">Dành cho bạn...</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Chạm để mở thiệp</p>
              
              {/* Seal Accent */}
              <div className="absolute bottom-6 right-6 opacity-20">
                 <span className="material-symbols-outlined text-4xl text-primary font-variation-fill">qr_code_2</span>
              </div>
            </div>

            {/* Floating particles (CSS) */}
            <div className="absolute -top-4 -right-4 size-8 bg-amber-200 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 size-12 bg-primary/20 rounded-full blur-xl animate-pulse delay-700"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nội dung sau khi mở (video + message) ──────────────── */}
      <AnimatePresence>
        {isOpened && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="w-full max-w-lg mx-auto text-center"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <span className="text-5xl">🎉</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 mt-4">
                Một món quà dành cho bạn!
              </h1>
            </motion.div>

            {/* Video (nếu có mediaUrl) */}
            {gift?.mediaUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mb-8 rounded-2xl overflow-hidden shadow-2xl shadow-rose-200/50 bg-black"
              >
                <video
                  autoPlay
                  playsInline
                  controls
                  className="w-full rounded-2xl"
                  src={gift.mediaUrl}
                >
                  Trình duyệt không hỗ trợ video.
                </video>
              </motion.div>
            )}

            {/* Tin nhắn chúc mừng */}
            {gift?.messageText && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl border border-slate-100 relative group overflow-hidden"
              >
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-125"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col items-center gap-2 mb-6">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Message for</span>
                    <h2 className="text-xl font-black text-slate-900 border-b-2 border-primary/20 pb-1">{gift.recipientName || 'Bạn'}</h2>
                  </div>

                  <p className="text-slate-700 text-lg sm:text-xl leading-relaxed italic font-medium">
                    "{gift.messageText}"
                  </p>

                  <div className="mt-8 flex justify-center items-center gap-4">
                     <div className="h-px w-8 bg-slate-200"></div>
                     <span className="material-symbols-outlined text-primary text-xl">favorite</span>
                     <div className="h-px w-8 bg-slate-200"></div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer & CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-12 flex flex-col items-center"
            >
              <div className="w-12 h-px bg-slate-200 mb-6"></div>

              <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-xl shadow-rose-200/20 max-w-sm w-full mx-auto">
                <p className="text-slate-500 text-xs font-bold mb-4">Bạn cũng muốn tạo một món quà bất ngờ thế này?</p>
                <button
                  onClick={() => window.location.href = 'http://localhost:5173/home'}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-primary">rocket_launch</span>
                  Khám phá C-Shop ngay
                </button>
              </div>

              <p className="mt-8 text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                MADE WITH
                <span className="material-symbols-outlined text-rose-400 text-sm animate-pulse">favorite</span>
                AT C-SHOP
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftUnboxing;
