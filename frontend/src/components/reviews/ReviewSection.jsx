import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Send, User, Clock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewSection = ({ serviceId, serviceType }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`${API_URL}/reviews/${serviceId}`);
                setReviews(res.data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [serviceId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to leave a review");

        setSubmitting(true);
        try {
            const res = await axios.post(`${API_URL}/reviews`, {
                serviceId,
                serviceType,
                rating,
                comment
            }, {
                headers: { 'x-auth-token': token }
            });

            setReviews([res.data, ...reviews]);
            setComment('');
            setRating(5);
        } catch (err) {
            console.error("Review submission error:", err);
            alert("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Review Form */}
            <div className="glass-card p-10 rounded-[3rem] border-2 border-emerald-500/10 bg-white">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Share Your Experience</h3>
                        <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Your feedback helps the community</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Star Rating */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Rating</label>
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-2 transition-all duration-300 ${rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                                >
                                    <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={2.5} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Your Review</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you loved about this service..."
                            rows="4"
                            className="w-full p-6 bg-slate-50 border-2 border-transparent rounded-3xl text-slate-800 font-bold placeholder-slate-300 focus:border-emerald-500/20 focus:bg-white transition-all outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full btn-primary !rounded-2xl py-5 bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                    >
                        {submitting ? "Submitting..." : <><Send size={18} /> Post Review</>}
                    </button>
                </form>
            </div>

            {/* Review List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h4 className="text-xl font-black text-slate-900">Guest Reviews</h4>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={12} /> Verified Feedback
                    </span>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="text-center py-20 text-slate-300 italic">Loading reviews...</div>
                    ) : reviews.length > 0 ? (
                        <AnimatePresence>
                            {reviews.map((rev, idx) => (
                                <motion.div
                                    key={rev._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-50 hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h5 className="font-black text-slate-900 text-sm">{rev.user?.name}</h5>
                                                <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                    <Clock size={10} /> {new Date(rev.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    size={14} 
                                                    className={i < rev.rating ? 'text-amber-400' : 'text-slate-100'} 
                                                    fill={i < rev.rating ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 font-medium leading-relaxed italic">
                                        "{rev.comment}"
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold">No reviews yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
