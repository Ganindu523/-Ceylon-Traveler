import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkedAlt, FaHistory, FaMoneyBillWave, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const GuideDashboard = () => {
    const [stats, setStats] = useState({
        earnings: 0,
        completedTours: 0,
        upcomingTours: 0,
        pendingRequests: 0
    });
    const [schedules, setSchedules] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('schedules'); 
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // ✅ NEW: Exchange Rate State
    const [usdToLkrRate, setUsdToLkrRate] = useState(325); // Default fallback

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token } };
            const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;

            try {
                // 1. Fetch Exchange Rate (Parallel)
                if (apiKey) {
                    axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
                        .then(res => {
                            if (res.data.conversion_rates.LKR) {
                                setUsdToLkrRate(res.data.conversion_rates.LKR);
                            }
                        })
                        .catch(e => console.error("Rate Error", e));
                }

                // 2. Fetch Dashboard Data
                const [statsRes, schedRes, histRes] = await Promise.all([
                    axios.get(`${API_URL}/api/guide/dashboard-stats`, config),
                    axios.get(`${API_URL}/api/guide/schedules`, config),
                    axios.get(`${API_URL}/api/guide/history`, config)
                ]);

                setStats(statsRes.data);
                setSchedules(schedRes.data);
                setHistory(histRes.data);

            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Confirmed': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit"><FaCheckCircle className="mr-1"/> Confirmed</span>;
            case 'Pending': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center w-fit"><FaClock className="mr-1"/> Pending</span>;
            case 'Completed': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center w-fit"><FaCheckCircle className="mr-1"/> Completed</span>;
            case 'Cancelled': return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-fit"><FaTimesCircle className="mr-1"/> Cancelled</span>;
            default: return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (loading) return <div className="flex h-screen justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Guide Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here is your tour overview.</p>
                </div>

                {/* --- Stats Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    
                    {/* ✅ FIX: Converted USD Earnings to LKR */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-teal-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Earnings</p>
                                <h3 className="text-2xl font-bold text-gray-800">
                                    LKR {(stats.earnings * usdToLkrRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </h3>
                                <p className="text-[10px] text-gray-400">(${stats.earnings.toLocaleString()} USD)</p>
                            </div>
                            <div className="p-3 bg-teal-50 rounded-full text-teal-600">
                                <FaMoneyBillWave size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Upcoming Tours</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.upcomingTours}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                                <FaCalendarAlt size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Completed Tours</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.completedTours}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                                <FaMapMarkedAlt size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Pending Requests</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.pendingRequests}</h3>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                                <FaHistory size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Main Content Section --- */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="flex border-b">
                        <button 
                            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'schedules' ? 'border-b-2 border-teal-500 text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('schedules')}
                        >
                            Upcoming Schedules
                        </button>
                        <button 
                            className={`flex-1 py-4 text-center font-medium transition ${activeTab === 'history' ? 'border-b-2 border-teal-500 text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Tour History
                        </button>
                    </div>

                    <div className="p-6">
                        {/* SCHEDULES TAB */}
                        {activeTab === 'schedules' && (
                            <div>
                                {schedules.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs text-gray-500 uppercase border-b bg-gray-50">
                                                    <th className="py-3 px-4">Date & Time</th>
                                                    <th className="py-3 px-4">Tourist Name</th>
                                                    <th className="py-3 px-4">Package</th>
                                                    <th className="py-3 px-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedules.map((tour) => (
                                                    <tr key={tour._id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="py-4 px-4 font-medium text-gray-800">
                                                            {new Date(tour.date).toLocaleDateString()} <br/>
                                                            <span className="text-xs text-gray-500 font-normal">08:00 AM (Est)</span>
                                                        </td>
                                                        <td className="py-4 px-4 text-gray-700">{tour.touristName}</td>
                                                        <td className="py-4 px-4 text-gray-700">{tour.tourPackage}</td>
                                                        <td className="py-4 px-4">{getStatusBadge(tour.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <FaCalendarAlt className="mx-auto text-4xl mb-3 text-gray-300"/>
                                        <p>No upcoming tours scheduled.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* HISTORY TAB */}
                        {activeTab === 'history' && (
                            <div>
                                {history.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs text-gray-500 uppercase border-b bg-gray-50">
                                                    <th className="py-3 px-4">Date</th>
                                                    <th className="py-3 px-4">Tourist</th>
                                                    <th className="py-3 px-4">Package</th>
                                                    <th className="py-3 px-4">Price (LKR)</th>
                                                    <th className="py-3 px-4">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {history.map((tour) => (
                                                    <tr key={tour._id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="py-4 px-4 text-gray-700">{new Date(tour.date).toLocaleDateString()}</td>
                                                        <td className="py-4 px-4 text-gray-700">{tour.touristName}</td>
                                                        <td className="py-4 px-4 text-gray-700">{tour.tourPackage}</td>
                                                        {/* ✅ FIX: Convert Table Row Price to LKR */}
                                                        <td className="py-4 px-4 font-medium text-gray-800">
                                                            LKR {(tour.totalPrice * usdToLkrRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                        </td>
                                                        <td className="py-4 px-4">{getStatusBadge(tour.status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <FaHistory className="mx-auto text-4xl mb-3 text-gray-300"/>
                                        <p>No past tour history found.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideDashboard;