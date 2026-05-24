import React, { useEffect, useState } from 'react';
import { reviewService } from '../services/api';
import { useAuth } from './AuthProvider';

const ReviewSection = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await reviewService.getByProduct(productId);
            setReviews(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            setError('Please enter your review text.');
            return;
        }

        setError('');
        setSubmitting(true);
        try {
            await reviewService.create(productId, { rating, comment });
            setComment('');
            setRating(5);
            // Refresh list
            await fetchReviews();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Calculate ratings info
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : '0.0';

    return (
        <div className="font-display flex flex-col gap-8">
            <h2 className="text-gray-900 font-extrabold text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500">reviews</span>
                Customer Reviews
            </h2>

            {/* Statistics Banner */}
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-8 shadow-sm">
                <div className="text-center sm:border-r border-gray-200/50 sm:pr-8 flex flex-col items-center">
                    <span className="text-gray-900 font-black text-5xl leading-none mb-2">{avgRating}</span>
                    <div className="flex text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-[20px] ${i < Math.floor(Number(avgRating)) ? 'fill-current' : ''}`}>
                                star
                            </span>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Based on {totalReviews} reviews</span>
                </div>

                {/* Rating Distribution Bar */}
                <div className="flex-1 w-full flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviews.filter(r => r.rating === stars).length;
                        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                        return (
                            <div key={stars} className="flex items-center gap-3 w-full">
                                <span className="text-xs font-bold text-gray-600 w-12 flex items-center gap-0.5">
                                    {stars} <span className="material-symbols-outlined text-amber-400 text-xs fill-current">star</span>
                                </span>
                                <div className="flex-1 h-2.5 bg-gray-200/60 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs font-bold text-gray-500 w-8 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Write a Review Section */}
            {user ? (
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-gray-900 font-extrabold text-base mb-4">Share your feedback</h3>
                    <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                                {error}
                            </div>
                        )}
                        {/* Star Rating Select */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-600">Your Rating:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className="text-amber-400 transition-transform hover:scale-125 focus:outline-none"
                                    >
                                        <span className={`material-symbols-outlined text-[24px] ${star <= rating ? 'fill-current' : ''}`}>
                                            star
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Input */}
                        <textarea
                            rows="4"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Write your review here. What did you like or dislike? How was the fit?"
                            className="w-full bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-sm rounded-2xl p-4 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                        ></textarea>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-6 rounded-2xl shadow-lg transition-colors self-start flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <div className="size-4 border-2 border-background-dark border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    Submit Review
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 text-center shadow-sm">
                    <span className="material-symbols-outlined text-amber-500 text-3xl mb-2">lock</span>
                    <p className="text-sm font-bold text-gray-700">Please sign in to write a review</p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 border border-gray-100/50 border-dashed rounded-3xl">
                    <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">rate_review</span>
                    <p className="text-sm font-bold text-gray-400">No reviews yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-primary/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                        {rev.userName ? rev.userName[0].toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-900 font-extrabold text-sm">{rev.userName || 'Anonymous'}</span>
                                        <span className="text-gray-400 text-[10px] font-bold">
                                            {rev.createdDate ? new Date(rev.createdDate).toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`material-symbols-outlined text-[16px] ${i < rev.rating ? 'fill-current' : ''}`}>
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    {rev.verified && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[10px] font-black">check_circle</span>
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line pl-1">
                                {rev.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
