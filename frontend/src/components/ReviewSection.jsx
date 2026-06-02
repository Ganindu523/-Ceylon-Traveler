import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Send, User } from 'lucide-react';

const ReviewSection = ({ serviceId, serviceType }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchReviews();
    }, [serviceId]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/reviews/${serviceId}`);
            setReviews(res.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to leave a review');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/reviews`, 
                { serviceId, serviceType, rating, comment },
                { headers: { 'x-auth-token': token } }
            );
            setComment('');
            setRating(5);
            fetchReviews();
            alert('Review submitted successfully!');
        } catch (err) {
            console.error('Error submitting review:', err);
            alert(err.response?.data?.msg || 'Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <MessageSquare className="text-teal-600" />
                Reviews & Ratings
            </h3>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="mb-12 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Leave a Review</p>
                <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform active:scale-125"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                        </button>
                    ))}
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about your experience..."
                    className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none min-h-[120px] transition-all bg-white"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-200 transition-all active:scale-95 disabled:bg-gray-400"
                >
                    {loading ? 'Submitting...' : <><Send size={18} /> Submit Review</>}
                </button>
            </form>

            {/* Reviews List */}
            <div className="space-y-6">
                {fetching ? (
                    <p className="text-center text-gray-500 italic">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <User className="mx-auto text-gray-300 mb-4 w-12 h-12" />
                        <p className="text-gray-500 font-medium">No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev._id} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        {rev.user?.profileImage ? (
                                            <img src={rev.user.profileImage} alt={rev.user.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="text-teal-600 w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{rev.user?.name || 'Anonymous User'}</p>
                                        <p className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm font-bold text-yellow-700">{rev.rating}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
