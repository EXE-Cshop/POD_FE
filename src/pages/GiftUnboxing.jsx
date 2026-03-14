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

  // ─── Fetch gift data ─────────────────────────────────────────────
  useEffect(() => {
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
          className="absolute text-rose-300 text-2xl"
          initial={{
            x: Math.random() * windowSize.width,
            y: windowSize.height + 100,
            rotate: Math.random() * 360,
            scale: 0.5 + Math.random()
          }}
          animate={{
            y: -100,
            rotate: Math.random() * 360 + 360,
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10
          }}
        >
          favorite
        </motion.span>
      ))}
    </div>
  );

  // ─── Main UI ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-rose-50/50 to-white flex flex-col items-center justify-center px-4 py-8 overflow-hidden relative font-display">
      <FloatingHearts />
      {/* ── Confetti ────────────────────────────────────────────── */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={250}
          recycle={false}
          gravity={0.15}
          colors={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FB5', '#C084FC']}
        />
      )}

      {/* ── Envelope (trước khi mở) ────────────────────────────── */}
      <AnimatePresence>
        {!isOpened && (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -60, rotateX: 45 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="cursor-pointer select-none"
            onClick={handleOpen}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Envelope SVG */}
            <div className="relative w-72 h-52 sm:w-80 sm:h-56">
              {/* Envelope body */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl shadow-2xl shadow-rose-300/50 overflow-hidden">
                {/* Envelope flap (tam giác phía trên) */}
                <div className="absolute top-0 left-0 right-0">
                  <svg viewBox="0 0 320 100" className="w-full">
                    <polygon
                      points="0,0 160,80 320,0"
                      fill="url(#flapGradient)"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                    />
                    <defs>
                      <linearGradient id="flapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#E11D48" />
                        <stop offset="100%" stopColor="#DB2777" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                {/* Nội dung bên trong envelope */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <span className="text-4xl mb-2">🎁</span>
                  <p className="text-white/90 font-bold text-sm">Bạn nhận được quà!</p>
                  <p className="text-white/60 text-xs mt-1">Nhấn để mở</p>
                </div>
                {/* Dấu sáp niêm phong */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <motion.div
                    className="size-10 bg-yellow-400 rounded-full shadow-lg flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    <span className="text-yellow-800 text-lg">★</span>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Floating hint */}
            <motion.p
              className="text-center text-rose-400/80 text-xs font-medium mt-6"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Chạm vào phong bì để mở 💌
            </motion.p>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-rose-100"
              >
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    {['💖', '✨', '💖'].map((emoji, i) => (
                      <motion.span
                        key={i}
                        className="text-lg"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-medium">
                  {gift.messageText}
                </p>
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
