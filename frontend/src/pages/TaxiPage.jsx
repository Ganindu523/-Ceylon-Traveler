import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import { 
    Car, MapPin, Star, Search, Filter, Loader, X, 
    Navigation, ShieldCheck, DollarSign, ChevronRight, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DISTRICTS } from '../data/districts';

const VEHICLE_TYPES = ['Tuk Tuk', 'Car', 'Van', 'SUV'];

const TaxiPage = () => {
    const [taxis, setTaxis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTaxis = async () => {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const params = {};
                if (selectedDistrict) params.district = selectedDistrict;
                if (selectedVehicle) params.vehicleType = selectedVehicle;

                const res = await axios.get(`${API_URL}/api/planning/taxis`, { params });
                setTaxis(res.data);
            } catch (err) {
                console.error("Taxi fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTaxis();
    }, [selectedDistrict, selectedVehicle]);

    const filteredTaxis = taxis.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.vehicleModel.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="mb-16">
                    <Motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col lg:flex-row lg:items-end justify-between gap-8"
                    >
                        <div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">Reliable Transport</span>
                            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">Elite Fleet</h1>
                            <p className="text-slate-500 font-medium italic text-lg max-w-xl">From nimble Tuk Tuks to luxury SUVs, journey across the island with our network of verified professional chauffeurs.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            <div className="relative group flex-1 sm:w-64">
                                <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Search driver/model..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:border-blue-500 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative group sm:w-48">
                                <Filter className="absolute left-4 top-4 text-slate-400" size={20} />
                                <select 
                                    value={selectedVehicle}
                                    onChange={(e) => setSelectedVehicle(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-700 focus:border-blue-500 outline-none appearance-none transition-all shadow-sm"
                                >
                                    <option value="">All Vehicles</option>
                                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="relative group sm:w-48">
                                <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                                <select 
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(e.target.value)}
                                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-black text-slate-700 focus:border-blue-500 outline-none appearance-none transition-all shadow-sm"
                                >
                                    <option value="">All Districts</option>
                                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                    </Motion.div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 text-blue-600">
                        <Loader className="animate-spin mb-6" size={48} />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Syncing with active drivers...</p>
                    </div>
                ) : filteredTaxis.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredTaxis.map((taxi, idx) => (
                            <Motion.div 
                                key={taxi._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative">
                                            <img 
                                                src={taxi.profileImage || 'https://placehold.co/150'} 
                                                className="w-20 h-20 rounded-2xl object-cover shadow-inner border border-slate-100" 
                                                alt={taxi.name} 
                                            />
                                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1 rounded-lg">
                                                <ShieldCheck size={14} />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900">{taxi.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-wider">{taxi.vehicleType}</span>
                                                <span className="text-[10px] font-bold text-slate-400">{taxi.licensePlate || 'Certified'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Model</span>
                                            <span className="text-sm font-black text-slate-800">{taxi.vehicleModel}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Rate</span>
                                            <span className="text-lg font-black text-blue-600">LKR {taxi.pricePerKm || '100'}/km</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {(taxi.workingDistricts || []).slice(0, 3).map((dist, i) => (
                                            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-500">
                                                <MapPin size={10} className="text-blue-500" />
                                                {dist}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                        <button 
                                            onClick={() => navigate(`/service/taxi/${taxi._id}`)}
                                            className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-xl"
                                        >
                                            View Details
                                        </button>
                                        <a href={`tel:${taxi.phone}`} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100">
                                            <Phone size={18} />
                                        </a>
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
                        <h3 className="text-2xl font-black text-slate-800 mb-2">No Taxis Available</h3>
                        <p className="text-slate-500 font-medium">Try different vehicle types or districts.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxiPage;
