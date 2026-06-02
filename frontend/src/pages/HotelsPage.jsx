import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Hotel, MapPin, Star, Search, Filter, ChevronRight, 
    Wifi, Wind, Coffee, Loader, X, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../data/districts';

const HotelsPage = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const params = {};
                if (selectedDistrict) params.district = selectedDistrict;

                const res = await axios.get(`${API_URL}/api/planning/hotels`, { params });
                setHotels(res.data);
            } catch (err) {
                console.error("Hotel fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, [selectedDistrict]);

    const filteredHotels = hotels.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-16">
                    <Motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 block">Premium Stays</span>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Discover Luxury</h1>
                            <p className="text-slate-500 font-medium italic text-lg max-w-xl">From boutique villas to seaside resorts, find your perfect sanctuary in the heart of the Indian Ocean.</p>
                        </div>
                        
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group flex-1 sm:w-64">
                                <Search className="absolute left-4 top-4 text-slate-400 group-hover:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-emerald-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative group sm:w-48">
                                <Filter className="absolute left-4 top-4 text-slate-400" size={20} />
                                <select 
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-700 focus:border-emerald-500 outline-none appearance-none transition-all shadow-sm"
                                >
                                    <option value="">All Districts</option>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </Motion.div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 text-emerald-600">
                        <Loader className="animate-spin mb-6" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Curating the finest collection...</p>
                    </div>
                ) : filteredHotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredHotels.map((hotel, idx) => (
                            <Motion.div 
                                key={hotel._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                            >
                                <div className="relative h-72 overflow-hidden">
                                    <img 
                                        src={hotel.photos?.[0] || 'https://placehold.co/600x400'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                        alt={hotel.name} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-slate-900 shadow-xl border border-white/50">
                                            {hotel.district?.toUpperCase() || 'SRI LANKA'}
                                        </span>
                                    </div>
                                    {hotel.stars >= 4 && (
                                        <div className="absolute top-6 right-6">
                                            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-xl">
                                                <Award size={16} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">{hotel.name}</h3>
                                            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                                                <MapPin size={12} />
                                                <span>{hotel.city}, Sri Lanka</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-black">{hotel.stars || '4.5'}</span>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6 leading-relaxed">
                                        {hotel.description || "Experience the ultimate Sri Lankan hospitality in this beautiful property situated in the heart of nature."}
                                    </p>

                                    <div className="flex gap-4 mb-8">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                <Wifi size={14} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <Wind size={14} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                                                <Coffee size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Starting from</span>
                                            <span className="text-xl font-black text-slate-900">${hotel.pricePerNight || '120'}</span>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/hotels/${hotel._id}`)}
                                            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                                        >
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40">
                        <div className="bg-slate-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <X size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Properties Found</h3>
                        <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelsPage;
