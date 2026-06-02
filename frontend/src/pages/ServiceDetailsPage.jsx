import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Star, MapPin, Phone, Mail, Globe, Wifi, Wind, Coffee, 
    Loader, ChevronLeft, Send, User, Calendar, ShieldCheck, 
    Award, Car, Languages, MessageSquare, Info
} from 'lucide-react';

const ServiceDetailsPage = () => {
    const { type, id } = useParams(); // type: hotel, guide, taxi
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                
                // 1. Fetch Service Details
                let endpoint = '';
                if (type === 'hotel') endpoint = `/api/planning/hotels`; // We need a direct ID fetch or filter
                else if (type === 'guide') endpoint = `/api/planning/guides`;
                else if (type === 'taxi') endpoint = `/api/planning/taxis`;

                const res = await axios.get(`${API_URL}${endpoint}`);
                // Since our current endpoints return arrays, find the specific one
                const item = res.data.find(i => i._id === id);
                setService(item);

                // 2. Fetch Reviews
                const revRes = await axios.get(`${API_URL}/api/planning/reviews/${id}`);
                setReviews(revRes.data);
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert("Please login to leave a review");

        setSubmittingReview(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/planning/reviews`, {
                serviceId: id,
                serviceType: type === 'hotel' ? 'Hotel' : 'User',
                ...newReview
            }, { headers: { 'x-auth-token': token } });
            
            setReviews([res.data, ...reviews]);
            setNewReview({ rating: 5, comment: '' });
            alert("Review submitted!");
        } catch (err) {
            console.error(err);
            alert("Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader className="animate-spin text-slate-900" size={48}/></div>;
    if (!service) return <div className="text-center py-40">Service not found</div>;

    const isHotel = type === 'hotel';
    const isGuide = type === 'guide';
    const isTaxi = type === 'taxi';

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Gallery */}
            <div className="relative h-[60vh] overflow-hidden">
                <img 
                    src={isHotel ? service.photos?.[0] : service.profileImage || 'https://placehold.co/1200x800'} 
                    className="w-full h-full object-cover shadow-2xl" 
                    alt={service.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                
                <button 
                    onClick={() => navigate(-1)}
                    className="absolute top-10 left-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all border border-white/20"
                >
                    <ChevronLeft size={24} />
                </button>

                <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Verified {type}</span>
                            <div className="flex items-center gap-1 text-amber-400">
                                <Star size={16} fill="currentColor" />
                                <span className="text-sm font-black text-white">4.9 (120+ Reviews)</span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tight mb-2">{service.name}</h1>
                        <div className="flex items-center gap-2 text-white/70 font-medium">
                            <MapPin size={18} className="text-emerald-400" />
                            <span>{isHotel ? service.address : (Array.isArray(service.workingDistricts) ? service.workingDistricts.join(', ') : service.guideType || 'Sri Lanka')}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-2xl">
                            {isHotel ? 'Book a Room' : 'Hire Now'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs */}
                        <div className="bg-white p-2 rounded-3xl shadow-xl flex gap-2 border border-slate-100">
                            {[
                                { id: 'overview', label: 'Overview', icon: <Info size={16}/> },
                                { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={16}/> }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs transition-all ${
                                        activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:bg-slate-50'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' ? (
                                <Motion.div 
                                    key="overview"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 space-y-10"
                                >
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-6">About the Service</h2>
                                        <p className="text-slate-500 font-medium leading-relaxed italic text-lg">
                                            {service.description || service.bio || "No detailed description provided yet. This verified partner offers top-tier services tailored to provide an authentic Sri Lankan experience."}
                                        </p>
                                    </div>

                                    {isHotel && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            {[
                                                { icon: <Wifi />, label: 'Free Wifi' },
                                                { icon: <Wind />, label: 'A/C Rooms' },
                                                { icon: <Coffee />, label: 'Breakfast' },
                                                { icon: <Award />, label: 'Spa' }
                                            ].map((a, i) => (
                                                <div key={i} className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                                    <div className="text-emerald-600">{a.icon}</div>
                                                    <span className="text-[10px] font-black uppercase text-slate-500">{a.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isGuide && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
                                                <h4 className="font-black text-amber-900 mb-4 flex items-center gap-2"><Languages size={18}/> Languages</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {service.languages?.map((l, i) => (
                                                        <span key={i} className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-amber-700 shadow-sm">{l}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                                <h4 className="font-black text-emerald-900 mb-4 flex items-center gap-2"><Award size={18}/> Specialization</h4>
                                                <p className="text-xs font-bold text-emerald-700">{service.guideType} Certified Tour Professional</p>
                                            </div>
                                        </div>
                                    )}

                                    {isTaxi && (
                                        <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center gap-10">
                                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-blue-100">
                                                <Car size={48} className="text-blue-600 mb-4" />
                                                <h4 className="font-black text-slate-900">{service.vehicleModel}</h4>
                                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{service.vehicleType}</p>
                                            </div>
                                            <div className="flex-1 space-y-4 text-center md:text-left">
                                                <h4 className="text-xl font-black text-blue-900">Safety & Reliability</h4>
                                                <p className="text-sm font-medium text-blue-700 italic">"Our vehicle is fully insured and maintained to the highest safety standards. Your comfort and safety are our priority."</p>
                                                <div className="flex gap-4 justify-center md:justify-start">
                                                    <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-blue-600 shadow-sm border border-blue-50">AIR CONDITIONED</div>
                                                    <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-blue-600 shadow-sm border border-blue-50">GPS TRACKING</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Motion.div>
                            ) : (
                                <Motion.div 
                                    key="reviews"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-8"
                                >
                                    {/* Review Submission */}
                                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                                        <h3 className="text-xl font-black text-slate-900 mb-8">Leave your Feedback</h3>
                                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl w-fit">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rating</span>
                                                <div className="flex gap-1">
                                                    {[1,2,3,4,5].map(num => (
                                                        <button 
                                                            key={num} 
                                                            type="button"
                                                            onClick={() => setNewReview({...newReview, rating: num})}
                                                            className={`p-1 transition-all ${newReview.rating >= num ? 'text-amber-500 scale-110' : 'text-slate-200'}`}
                                                        >
                                                            <Star size={24} fill={newReview.rating >= num ? 'currentColor' : 'none'} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    rows="4" 
                                                    value={newReview.comment}
                                                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                                    placeholder="Share your experience with the community..."
                                                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] p-8 text-sm font-bold focus:bg-white focus:border-slate-900 outline-none transition-all"
                                                />
                                                <button 
                                                    disabled={submittingReview}
                                                    className="absolute bottom-6 right-6 p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50"
                                                >
                                                    {submittingReview ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {reviews.length > 0 ? reviews.map((rev, i) => (
                                            <Motion.div 
                                                key={rev._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex gap-6"
                                            >
                                                <img src={rev.user?.profileImage || 'https://placehold.co/100'} className="w-16 h-16 rounded-2xl object-cover shadow-md" alt="" />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-black text-slate-900">{rev.user?.name}</h4>
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex gap-0.5 text-amber-500">
                                                            {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{rev.comment}"</p>
                                                </div>
                                            </Motion.div>
                                        )) : (
                                            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                                <p className="text-slate-400 font-bold italic">Be the first to leave a review!</p>
                                            </div>
                                        )}
                                    </div>
                                </Motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar: Contact & Booking */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 sticky top-32">
                            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                                <ShieldCheck size={24} className="text-emerald-500" />
                                Contact Info
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</p>
                                        <p className="font-black text-slate-800">{service.contactNumber || service.phone || '+94 77 123 4567'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                        <p className="font-black text-slate-800 truncate max-w-[180px]">{service.email || 'partner@ceylon.travel'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-pointer">
                                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</p>
                                        <p className="font-black text-slate-800">ceylontraveler.com</p>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full mt-10 bg-slate-900 text-white py-5 rounded-[2rem] font-black text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/20">
                                Send Direct Message
                            </button>
                            
                            <p className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                                Secured by Ceylon Traveler
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsPage;
