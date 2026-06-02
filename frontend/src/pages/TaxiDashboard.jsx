import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaCar, FaUser, FaRoute, FaMoneyBillWave, FaStar, FaPowerOff, FaHistory, FaMapMarkerAlt 
} from 'react-icons/fa';
import { Loader } from 'lucide-react';

const TaxiDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [toggling, setToggling] = useState(false);

    // --- Fetch Dashboard Data ---
    const fetchDashboard = async () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/taxi/dashboard`, {
                headers: { 'x-auth-token': token }
            });
            setData(res.data);
            setIsOnline(res.data.profile.isOnline);
        } catch (err) {
            console.error("Error fetching taxi data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    // --- Toggle Availability ---
    const handleToggleStatus = async () => {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        setToggling(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/taxi/availability`, {}, {
                headers: { 'x-auth-token': token }
            });
            setIsOnline(res.data.isOnline);
        } catch (err) {
            // ✅ FIX: Log the error to satisfy ESLint
            console.error("Status Toggle Error:", err);
            alert("Failed to update status");
        } finally {
            setToggling(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-900"><Loader className="animate-spin text-yellow-400 text-4xl"/></div>;
    if (!data) return <div className="h-screen flex items-center justify-center text-white">Failed to load data.</div>;

    const { profile, stats, rides } = data;

    return (
        <div className="min-h-screen bg-gray-100 font-sans pb-20">
            
            {/* --- Top Header Card --- */}
            <div className="bg-gray-900 text-white p-6 rounded-b-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaCar size={150} />
                </div>
                
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full border-2 border-yellow-400 overflow-hidden bg-gray-700">
                            <img src={profile.profileImage || "https://placehold.co/100"} alt="Driver" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{profile.name}</h1>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">{profile.vehicleType || "Taxi Driver"}</p>
                        </div>
                    </div>
                    
                    {/* Online Toggle */}
                    <button 
                        onClick={handleToggleStatus} 
                        disabled={toggling}
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-lg border-2 ${
                            isOnline 
                            ? 'bg-green-600 border-green-400 text-white' 
                            : 'bg-red-600 border-red-400 text-white'
                        }`}
                    >
                        <FaPowerOff size={20} className={toggling ? "animate-pulse" : ""}/>
                        <span className="text-[10px] font-bold mt-1">{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                    </button>
                </div>

                {/* Earnings Summary */}
                <div className="mt-8 flex justify-between items-end">
                    <div>
                        <p className="text-gray-400 text-xs uppercase mb-1">Net Earnings</p>
                        <h2 className="text-4xl font-black text-yellow-400">LKR {stats.totalEarnings.toLocaleString()}</h2>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-400 bg-gray-800 px-3 py-1 rounded-lg">
                            <FaStar/> <span className="font-bold">{stats.rating}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Stats Grid --- */}
            <div className="px-6 -mt-6 grid grid-cols-2 gap-4 relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-2"><FaRoute size={20}/></div>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalRides}</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Total Trips</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center border border-gray-100">
                    <div className="bg-green-50 text-green-600 p-3 rounded-full mb-2"><FaMoneyBillWave size={20}/></div>
                    <h3 className="text-2xl font-bold text-gray-800">10%</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Platform Fee</p>
                </div>
            </div>

            {/* --- Recent Rides List --- */}
            <div className="px-6 mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaHistory className="text-gray-400"/> Recent Activity
                </h3>

                <div className="space-y-4">
                    {rides.length === 0 ? (
                        <p className="text-center text-gray-400 py-8 bg-white rounded-2xl border border-gray-200 border-dashed">No recent rides found.</p>
                    ) : (
                        rides.map((ride, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-gray-800">{ride.customer}</p>
                                        <p className="text-xs text-gray-500">{ride.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600 text-lg">LKR {(ride.fare * 0.9).toLocaleString()}</p>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                            ride.status === 'Completed' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                                        }`}>{ride.status}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 relative pl-4 border-l-2 border-dashed border-gray-200 ml-1">
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Pick Up</p>
                                        <p className="text-sm font-medium text-gray-800">{ride.pickup}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Drop Off</p>
                                        <p className="text-sm font-medium text-gray-800">{ride.dropoff}</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                    <span>Distance: {ride.distance} KM</span>
                                    <span className="font-mono text-gray-300">#{ride.id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default TaxiDashboard;