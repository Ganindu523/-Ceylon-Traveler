import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaMapMarkerAlt, FaUser, FaPhone, FaMoneyBillWave, FaRoute, 
    FaCheckCircle, FaClock, FaArrowRight, FaTimes, FaPhoneAlt
} from 'react-icons/fa';
import { Loader } from 'lucide-react';

const TaxiRequestsPage = () => {
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming'); 
    const [selectedRide, setSelectedRide] = useState(null);
    const [completing, setCompleting] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Fetch Rides ---
    const fetchRides = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/taxi/rides`, {
                headers: { 'x-auth-token': token }
            });
            setRides(res.data);
        } catch (err) {
            console.error("Error fetching rides:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRides(); }, []);

    // --- Actions ---
    const handleCompleteRide = async () => {
        if (!selectedRide) return;
        if (!window.confirm("Are you sure you want to complete this ride?")) return;

        setCompleting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/taxi/rides/${selectedRide.tripId}/complete`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert("Ride Completed Successfully!");
            setSelectedRide(null);
            fetchRides();
        } catch (err) {
            console.error("Completion error", err);
            alert("Failed to update status.");
        } finally {
            setCompleting(false);
        }
    };

    const upcomingRides = rides.filter(r => r.status === 'Confirmed');
    const completedRides = rides.filter(r => r.status === 'Completed');
    const displayRides = activeTab === 'upcoming' ? upcomingRides : completedRides;

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-100"><Loader className="animate-spin text-yellow-500 text-4xl"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            
            {/* Header */}
            <div className="bg-yellow-400 p-6 rounded-b-3xl shadow-md sticky top-0 z-20">
                <h1 className="text-2xl font-black text-gray-900">Trip Requests</h1>
                <p className="text-sm font-bold text-gray-800 opacity-80">Manage your schedule</p>
                
                <div className="flex bg-yellow-500/30 p-1 rounded-xl mt-4">
                    <button onClick={() => setActiveTab('upcoming')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-800 opacity-60'}`}>
                        Upcoming ({upcomingRides.length})
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'completed' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-800 opacity-60'}`}>
                        History ({completedRides.length})
                    </button>
                </div>
            </div>

            {/* Ride List */}
            <div className="p-4 space-y-4">
                {displayRides.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <FaRoute size={48} className="mx-auto mb-2 text-gray-400"/>
                        <p>No {activeTab} rides found.</p>
                    </div>
                ) : (
                    displayRides.map((ride, idx) => (
                        <div key={idx} onClick={() => setSelectedRide(ride)} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer relative overflow-hidden">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${ride.status === 'Confirmed' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{ride.customerName}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 font-bold"><FaClock size={10}/> {ride.date} • {ride.time}</p>
                                </div>
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{ride.distance} KM</span>
                            </div>
                            
                            {/* Simple Route Visual */}
                            <div className="space-y-1 relative pl-4 mt-2">
                                <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 border-l-2 border-dashed border-gray-300"></div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white z-10"></div>
                                    <p className="text-sm text-gray-600 truncate">{ride.pickup}</p>
                                </div>
                                <div className="relative flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white z-10"></div>
                                    <p className="text-sm font-bold text-gray-800 truncate">{ride.dropoff}</p>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-end">
                                <span className="text-xs font-bold text-blue-600 flex items-center gap-1">View Details <FaArrowRight/></span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- Trip Details Modal (FIXED STRUCTURE) --- */}
            {selectedRide && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Dark Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedRide(null)}
                    ></div>
                    
                    {/* Modal Card */}
                    <div className="relative z-[110] bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                        
                        {/* Drag Handle (Visual Only) */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>

                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Ride Details</h2>
                                <p className="text-sm text-gray-500 font-bold">{selectedRide.date}</p>
                            </div>
                            <button onClick={() => setSelectedRide(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
                                <FaTimes size={18}/>
                            </button>
                        </div>

                        {/* Customer Card */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between mb-6 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-3 rounded-full shadow-sm text-gray-700"><FaUser/></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Passenger</p>
                                    <p className="text-lg font-bold text-gray-900">{selectedRide.customerName}</p>
                                </div>
                            </div>
                            {selectedRide.customerPhone !== 'N/A' && (
                                <a href={`tel:${selectedRide.customerPhone}`} className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center">
                                    <FaPhoneAlt size={18}/>
                                </a>
                            )}
                        </div>

                        {/* Route Timeline */}
                        <div className="space-y-6 mb-8 px-2">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center pt-1">
                                    <FaMapMarkerAlt className="text-blue-500 text-xl"/>
                                    <div className="w-0.5 h-full bg-gray-200 my-1 rounded-full min-h-[30px]"></div>
                                    <FaMapMarkerAlt className="text-red-500 text-xl"/>
                                </div>
                                <div className="space-y-6 flex-1 py-1">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Pick Up</p>
                                        <p className="font-bold text-gray-800 text-lg leading-tight">{selectedRide.pickup}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Destination</p>
                                        <p className="font-bold text-gray-800 text-lg leading-tight">{selectedRide.dropoff}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financials Row */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold uppercase">Earnings</p>
                                <p className="text-xl font-black text-blue-900">LKR {selectedRide.price.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 font-bold uppercase">Distance</p>
                                <p className="text-xl font-black text-gray-800">{selectedRide.distance} km</p>
                            </div>
                        </div>

                        {/* Complete Button */}
                        {selectedRide.status === 'Confirmed' ? (
                            <button 
                                onClick={handleCompleteRide}
                                disabled={completing}
                                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-lg shadow-xl flex justify-center items-center gap-2 transition-transform active:scale-95"
                            >
                                {completing ? <Loader className="animate-spin"/> : <><FaCheckCircle/> Complete Ride</>}
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-green-50 text-green-600 border border-green-200 rounded-xl font-bold text-center flex justify-center items-center gap-2">
                                <FaCheckCircle/> Ride Completed
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxiRequestsPage;