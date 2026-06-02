import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import { 
    User, MapPin, Star, Search, Filter, Loader, X, 
    Award, Languages, DollarSign, ChevronRight, Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../data/districts';

const GuidesPage = () => {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const params = {};
                if (selectedDistrict) params.district = selectedDistrict;

                const res = await axios.get(`${API_URL}/api/planning/guides`, { params });
                setGuides(res.data);
            } catch (err) {
                console.error("Guide fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuides();
    }, [selectedDistrict]);

    const filteredGuides = guides.filter(g => 
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.bio && g.bio.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <Motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                    >
                        <div>
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] mb-4 block">Local Experts</span>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Native Storytellers</h1>
                            <p className="text-slate-500 font-medium italic text-lg max-w-xl">Connect with certified local guides who breathe life into every monument and mountain peak.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="relative group flex-1 sm:w-64">
                                <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search by name..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-amber-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative group sm:w-48">
                                <Filter className="absolute left-4 top-4 text-slate-400" size={20} />
                                <select 
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-700 focus:border-amber-500 outline-none appearance-none transition-all shadow-sm"
                                >
                                    <option value="">All Regions</option>
                                    <option value="All Island">All Island Coverage</option>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </Motion.div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 text-amber-600">
                        <Loader className="animate-spin mb-6" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Locating regional experts...</p>
                    </div>
                ) : filteredGuides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredGuides.map((guide, idx) => (
                            <Motion.div 
                                key={guide._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative"
                            >
                                <div className="absolute top-8 right-8">
                                    <button className="text-slate-200 hover:text-red-500 transition-colors">
                                        <Heart size={20} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative">
                                        <img 
                                            src={guide.profileImage || 'https://placehold.co/150'} 
                                            className="w-24 h-24 rounded-3xl object-cover shadow-xl border-2 border-white" 
                                            alt={guide.name} 
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-xl border-2 border-white">
                                            <Award size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 truncate max-w-[150px]">{guide.name}</h3>
                                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                            <MapPin size={10} className="text-amber-500" />
                                            <span>{guide.guideType || 'Local Expert'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500 mt-2">
                                            <Star size={10} fill="currentColor" />
                                            <span className="text-xs font-black">4.9 (120 Reviews)</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs font-medium line-clamp-3 mb-8 italic leading-relaxed">
                                    "{guide.bio || "Passionate about Sri Lankan history and hidden gems. Let me show you the real island through a local's eyes."}"
                                </p>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <Languages size={14} />
                                        </div>
                                        <div className="flex gap-2">
                                            {guide.languages?.slice(0, 3).map((l, i) => (
                                                <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{l}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                                            <MapPin size={14} />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 truncate">
                                            {Array.isArray(guide.serviceAreas) ? guide.serviceAreas.slice(0, 2).join(', ') : 'All Island'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Daily Rate</span>
                                        <span className="text-xl font-black text-amber-600">LKR {guide.pricePerDay || '5,000'}</span>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/service/guide/${guide._id}`)}
                                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-amber-600 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Full Profile
                                    </button>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40">
                        <div className="bg-slate-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <X size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Guides Found</h3>
                        <p className="text-slate-500 font-medium">Try broadening your search or region.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuidesPage;
