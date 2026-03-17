import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { designFeedService } from '../services/api';

/**
 * Breakpoints cho masonry grid kiểu Pinterest:
 *   >= 1280px → 5 cột
 *   >= 1024px → 4 cột
 *   >= 768px  → 3 cột
 *   mặc định  → 2 cột (mobile)
 */
const MASONRY_BREAKPOINTS = {
  default: 5,
  1280: 4,
  1024: 3,
  768: 2,
};

const PAGE_SIZE = 12;

const TAGS = [
  '#Tất cả', '#Cyberpunk', '#Retro', '#Minimalist', '#Vintage', '#Anime', '#Streetwear', '#Modern', '#FPTU', '#Art'
];

const CommunityFeed = () => {
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────────
  const [designs, setDesigns] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTag, setSelectedTag] = useState('#Tất cả');
  const [selectedDesign, setSelectedDesign] = useState(null);

  // Ref cho sentinel element (IntersectionObserver)
  const sentinelRef = useRef(null);

  // ─── Fetch designs với pagination ────────────────────────────────
  const fetchDesigns = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const res = await designFeedService.getPublicFeed(pageNum, PAGE_SIZE);

      // Spring Boot Page response: { data: { content: [...], last: bool, totalPages, number, ... } }
      const pageData = res.data?.data ?? res.data;
      const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : []);
      const isLast = pageData?.last ?? content.length < PAGE_SIZE;

      setDesigns((prev) => (pageNum === 0 ? content : [...prev, ...content]));
      setHasMore(!isLast);
    } catch (err) {
      console.error('[CommunityFeed] fetch failed:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải thiết kế.');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Tải trang đầu tiên
  useEffect(() => {
    fetchDesigns(0);
  }, [fetchDesigns]);

  // ─── IntersectionObserver: tự động load thêm khi scroll đến sentinel ─
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Khi sentinel vào viewport VÀ còn trang tiếp theo VÀ không đang loading
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => {
            const next = prev + 1;
            fetchDesigns(next);
            return next;
          });
        }
      },
      { rootMargin: '200px' } // Pre-fetch sớm 200px trước khi user scroll tới
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchDesigns]);

  // ─── Handlers ─────────────────────────────────────────────────────

  /** Mở DesignerPage với design đã chọn (Remix) */
  const handleRemix = (design) => {
    const productId = design.baseProductId || null;
    const path = productId ? `/design/${productId}` : '/design';
    navigate(path, { state: { sharedDesignId: design.id } });
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-12 bg-background-light">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={() => navigate(-1)}
          className="size-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900">
            Khám phá thiết kế
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cộng đồng chia sẻ — chọn một thiết kế và Remix theo phong cách của bạn.
          </p>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${selectedTag === tag
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-white border border-slate-200 text-slate-500 hover:border-primary/50'
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && !initialLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
          <button
            onClick={() => { setPage(0); fetchDesigns(0); }}
            className="ml-auto px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Initial loading spinner */}
      {initialLoading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!initialLoading && !error && designs.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">palette</span>
          <p className="text-slate-500 font-medium">Chưa có thiết kế nào được chia sẻ.</p>
          <p className="text-slate-400 text-sm mt-2">
            Hãy là người đầu tiên tạo và chia sẻ thiết kế cho cộng đồng!
          </p>
          <button
            onClick={() => navigate('/home/catalog')}
            className="mt-6 px-6 py-3 bg-primary text-[#11221c] font-bold rounded-lg hover:brightness-110 transition-all"
          >
            Bắt đầu thiết kế
          </button>
        </div>
      )}

      {/* ─── Masonry Grid ──────────────────────────────────────── */}
      {designs.length > 0 && (
        <Masonry
          breakpointCols={MASONRY_BREAKPOINTS}
          className="flex -ml-6 w-auto"
          columnClassName="pl-6 bg-clip-padding"
        >
          {designs.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              onRemix={handleRemix}
              onClick={() => setSelectedDesign(design)}
            />
          ))}
        </Masonry>
      )}

      {/* ─── Sentinel (trigger infinite scroll) ────────────────── */}
      <div ref={sentinelRef} className="w-full py-8 flex justify-center">
        {loading && !initialLoading && (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium">Đang tải thêm...</span>
          </div>
        )}
        {!hasMore && designs.length > 0 && (
          <p className="text-slate-400 text-sm font-medium">
            ✨ Bạn đã xem hết tất cả thiết kế
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Design Card ────────────────────────────────────────────────────
/**
 * Card hiển thị một design trong masonry grid.
 * Hiển thị previewUrl, tên, creator và nút Remix.
 */
const DesignCard = ({ design, onRemix, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="mb-6 group cursor-pointer" onClick={onClick}>
      <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300">
        {/* Preview Image */}
        <div className="relative bg-slate-100 overflow-hidden aspect-[4/5]">
          {design.previewImageUrl ? (
            <>
              {!imgLoaded && (
                <div className="w-full h-full bg-slate-100 animate-pulse" />
              )}
              <img
                src={design.previewImageUrl}
                alt={design.name || 'Design preview'}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                onLoad={() => setImgLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-slate-300">palette</span>
            </div>
          )}

          {/* Featured Badge (if applicable) */}
          <div className="absolute top-3 right-3">
             <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20">Featured</div>
          </div>
        </div>

        {/* Card Info */}
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-slate-100 border border-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 truncate max-w-[100px]">{design.creatorName || 'Anonymous'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Creator</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-[20px] hover:text-rose-500 transition-colors">favorite</span>
              <span className="text-xs font-bold">{Math.floor(Math.random() * 100)}</span>
            </div>
          </div>

          <div className="relative group/btn">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemix(design);
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
              Use this design
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-white border border-slate-200 rounded-lg text-[10px] text-center text-slate-600 opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all shadow-xl z-20">
              <span className="text-primary font-bold">Earn points!</span> Creator will be notified and earn reward points!
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Design Detail Modal ─────────────────────────────────────────────
const DesignDetailModal = ({ design, onClose, onRemix }) => {
  const navigate = useNavigate();

  const handleBuyNow = () => {
    // Navigate with special param to auto-add to cart if possible
    // For now, just navigate to design page
    const productId = design.baseProductId || '1';
    navigate(`/design/${productId}`, { state: { autoBuyDesignId: design.id } });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        {/* Left: Design Preview */}
        <div className="w-full md:w-3/5 bg-slate-50 flex items-center justify-center p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 md:hidden size-10 flex items-center justify-center rounded-full bg-white/80 shadow-sm text-slate-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={design.previewImageUrl}
            alt={design.name}
            className="max-w-full max-h-full object-contain rounded-xl drop-shadow-2xl"
          />
        </div>

        {/* Right: Actions & Info */}
        <div className="w-full md:w-2/5 p-8 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Creator</p>
                <h4 className="font-bold text-slate-900">{design.creatorName || 'Anonymous Creator'}</h4>
              </div>
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex size-10 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-2">{design.name || 'Untitled Pattern'}</h1>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Mẫu thiết kế độc bản được tạo bởi cộng đồng. Bạn có thể mua trực tiếp mẫu thiết kế này hoặc sử dụng làm nền tảng để tùy biến (Remix) theo ý mình.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <span className="material-symbols-outlined text-rose-500 mb-1">favorite</span>
              <p className="text-sm font-black text-slate-900">{Math.floor(Math.random() * 200)}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Thích</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <span className="material-symbols-outlined text-blue-500 mb-1">shopping_bag</span>
              <p className="text-sm font-black text-slate-900">{Math.floor(Math.random() * 50)}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Đã mua</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <span className="material-symbols-outlined text-amber-500 mb-1">visibility</span>
              <p className="text-sm font-black text-slate-900">{Math.floor(Math.random() * 1000)}</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Lượt xem</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {['#Cyberpunk', '#Trending', '#Design'].map(t => (
              <span key={t} className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">{t}</span>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-auto space-y-3">
            <button
              onClick={handleBuyNow}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              Mua ngay mẫu này
            </button>
            <button
              onClick={() => onRemix(design)}
              className="w-full py-4 bg-primary text-[#11221c] rounded-2xl font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
              <span className="material-symbols-outlined">auto_fix_high</span>
              Tùy biến lại (Remix)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
