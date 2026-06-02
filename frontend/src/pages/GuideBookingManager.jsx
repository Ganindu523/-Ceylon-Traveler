import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    CalendarCheck, User, Clock, Check, X, 
    MapPin, Phone, Mail, Banknote, Loader, History 
} from 'lucide-react';

const GuideBookingManager = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'all'
    const [processingId, setProcessingId] = useState(null); 
    
    // ✅ NEW: Exchange Rate State
    const [usdToLkrRate, setUsdToLkrRate] = useState(325); // Default fallback

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;

            try {
                // 1. Fetch Exchange Rate
                if (apiKey) {
                    axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
                        .then(res => {
                            if (res.data.conversion_rates.LKR) {
                                setUsdToLkrRate(res.data.conversion_rates.LKR);
                            }
                        })
                        .catch(e => console.error("Rate Error", e));
                }

                // 2. Fetch Bookings
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${API_URL}/api/guide/bookings`, {
                    headers: { 'x-auth-token': token }
                });
                setBookings(res.data);

            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle Status Change
    const updateStatus = async (id, newStatus) => {
        if(!confirm(`Are you sure you want to mark this as ${newStatus}?`)) return;

        setProcessingId(id);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.patch(`${API_URL}/api/guide/bookings/${id}/status`, 
                { status: newStatus }, 
                { headers: { 'x-auth-token': token } }
            );
            
            setBookings(bookings.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter Data
    const pendingRequests = bookings.filter(b => b.status === 'Pending');
    const allHistory = bookings.filter(b => b.status !== 'Pending');

    // Calculate Total Income in LKR (USD * Rate)
    const totalIncomeLKR = bookings
        .filter(b => b.status === 'Completed')
        .reduce((acc, curr) => acc + (curr.totalPrice * usdToLkrRate), 0);

    const getStatusBadge = (status) => {
        const styles = {
            Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            Confirmed: "bg-green-100 text-green-800 border-green-200",
            Completed: "bg-blue-100 text-blue-800 border-blue-200",
            Cancelled: "bg-red-100 text-red-800 border-red-200",
            Rejected: "bg-gray-100 text-gray-600 border-gray-200"
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.Pending}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-4xl text-teal-600"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Booking Management</h1>
                        <p className="text-gray-500 mt-1">Manage your incoming requests and tour history.</p>
                    </div>
                    <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2">
                        <Banknote className="text-teal-600 w-5 h-5" />
                        <div>
                            <span className="text-sm text-gray-500 font-medium block">Total Income</span>
                            {/* ✅ FIX: Display calculated LKR Income */}
                            <span className="text-lg font-bold text-teal-600">
                                LKR {totalIncomeLKR.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-t-xl shadow-sm border-b flex">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-4 text-center font-medium transition border-b-2 ${activeTab === 'requests' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        New Requests 
                        {pendingRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-4 text-center font-medium transition border-b-2 ${activeTab === 'all' ? 'border-teal-500 text-teal-600 bg-teal-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        All Bookings & History
                    </button>
                </div>

                {/* --- Tab Content: Pending Requests --- */}
                {activeTab === 'requests' && (
                    <div className="bg-white rounded-b-xl shadow-sm p-6 min-h-[400px]">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-20">
                                <CalendarCheck className="mx-auto text-5xl text-gray-200 mb-4 w-16 h-16"/>
                                <h3 className="text-lg font-medium text-gray-500">No new booking requests</h3>
                                <p className="text-gray-400">Good job! You're all caught up.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {pendingRequests.map(booking => (
                                    <div key={booking._id} className="border rounded-xl p-5 hover:shadow-md transition bg-white border-l-4 border-l-yellow-400">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className="bg-teal-100 p-3 rounded-full mr-3 text-teal-600">
                                                    <User size={20}/>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-800">{booking.touristName}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center"><Clock className="mr-1 w-3 h-3"/> Requested just now</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {/* ✅ FIX: Convert Card Price to LKR */}
                                                <p className="font-bold text-teal-600">
                                                    LKR {(booking.totalPrice * usdToLkrRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </p>
                                                <p className="text-xs text-gray-400">Total Price</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> <span className="font-medium">{booking.tourPackage}</span></div>
                                            <div className="flex items-center"><CalendarCheck className="w-4 h-4 mr-2 text-gray-400"/> {new Date(booking.date).toDateString()}</div>
                                            <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400"/> {booking.touristPhone || "N/A"}</div>
                                            {booking.notes && <div className="mt-2 text-xs italic text-gray-500 border-t pt-2">"Note: {booking.notes}"</div>}
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => updateStatus(booking._id, 'Confirmed')}
                                                disabled={processingId === booking._id}
                                                className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition flex items-center justify-center"
                                            >
                                                {processingId === booking._id ? <Loader className="animate-spin w-4 h-4"/> : <><Check className="mr-2 w-4 h-4"/> Accept</>}
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(booking._id, 'Rejected')}
                                                disabled={processingId === booking._id}
                                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-200 transition flex items-center justify-center"
                                            >
                                                {processingId === booking._id ? <Loader className="animate-spin w-4 h-4"/> : <><X className="mr-2 w-4 h-4"/> Decline</>}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Tab Content: All Bookings (Table View) --- */}
                {activeTab === 'all' && (
                    <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Tourist Info</th>
                                        <th className="px-6 py-4">Package</th>
                                        <th className="px-6 py-4">Price (LKR)</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                <History className="mx-auto mb-2 text-2xl text-gray-300 w-8 h-8"/>
                                                No booking history available.
                                            </td>
                                        </tr>
                                    ) : (
                                        allHistory.map(booking => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-800">{new Date(booking.date).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-500">{new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{booking.touristName}</div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                                        {booking.touristPhone && <a href={`tel:${booking.touristPhone}`} className="hover:text-teal-600 flex items-center"><Phone className="w-3 h-3 mr-1"/></a>}
                                                        {booking.touristEmail && <a href={`mailto:${booking.touristEmail}`} className="hover:text-teal-600 flex items-center"><Mail className="w-3 h-3 mr-1"/></a>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{booking.tourPackage}</td>
                                                {/* ✅ FIX: Convert Table Row Price to LKR */}
                                                <td className="px-6 py-4 font-bold text-gray-800">
                                                    {(booking.totalPrice * usdToLkrRate).toLocaleString(undefined, {maximumFractionDigits: 0})}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(booking.status)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {booking.status === 'Confirmed' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => updateStatus(booking._id, 'Completed')}
                                                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 border border-blue-200 transition"
                                                            >
                                                                Complete
                                                            </button>
                                                            <button 
                                                                onClick={() => updateStatus(booking._id, 'Cancelled')}
                                                                className="text-xs text-red-500 hover:text-red-700 underline"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GuideBookingManager;