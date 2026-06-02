import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaSearch, FaFilter, FaCheckCircle, FaTimesCircle, FaSignInAlt, FaSignOutAlt, FaCalendarAlt 
} from 'react-icons/fa';

const HotelBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Fetch Data ---
    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/hotel/bookings`, {
                headers: { 'x-auth-token': token }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    // --- Update Status Handler ---
    const handleStatusUpdate = async (id, newStatus) => {
        // Confirmation message changes based on action
        let actionName = newStatus;
        if(newStatus === 'Checked-in') actionName = "Check In Guest";
        if(newStatus === 'Completed') actionName = "Check Out Guest";
        
        if(!window.confirm(`Are you sure you want to ${actionName}?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/hotel/bookings/${id}/status`, 
                { status: newStatus }, 
                { headers: { 'x-auth-token': token } }
            );
            alert("Status Updated Successfully!");
            fetchBookings(); // Refresh list
        } catch (err) {
            console.error(err);
            alert("Update failed. Please try again.");
        }
    };

    // --- Filtering Logic ---
    const filteredBookings = bookings.filter(b => {
        const matchesStatus = filter === 'All' || b.status === filter;
        const name = b.guestName ? b.guestName.toLowerCase() : '';
        const bookingId = b.id ? b.id.toLowerCase() : '';
        
        const matchesSearch = name.includes(search.toLowerCase()) || 
                              bookingId.includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // --- Helper: Status Badge ---
    const StatusBadge = ({ status }) => {
        const styles = {
            'Confirmed': 'bg-green-100 text-green-700 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Checked-in': 'bg-blue-100 text-blue-700 border-blue-200',
            'Completed': 'bg-gray-100 text-gray-600 border-gray-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles['Pending']}`}>
                {status}
            </span>
        );
    };

    if (bookings?.profileNeeded) return (
        <div className="h-screen flex items-center justify-center px-4 bg-gray-50">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md text-center border border-teal-100">
                <h2 className="text-2xl font-black text-gray-800 mb-4">Profile Not Found</h2>
                <p className="text-gray-500 mb-8 font-medium">Please set up your hotel profile first to manage bookings.</p>
                <a href="/hotel-admin/details" className="block w-full bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-100 text-center">
                    Go to Profile Setup
                </a>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Manage Bookings</h1>
                        <p className="text-gray-500 mt-1">Track guests, check-ins, and cancellations.</p>
                    </div>
                    
                    {/* Search & Filter Bar */}
                    <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                            <input 
                                type="text" 
                                placeholder="Search guest or ID..." 
                                className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none w-full md:w-64"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-3 text-gray-400"/>
                            <select 
                                className="pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-teal-500 outline-none appearance-none bg-white cursor-pointer"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Checked-in">Checked In</option>
                                <option value="Completed">Completed (Checked Out)</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Guest / Booking ID</th>
                                    <th className="p-4">Dates</th>
                                    <th className="p-4">Room Details</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading bookings...</td></tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-400">No bookings found.</td></tr>
                                ) : (
                                    filteredBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-gray-50 transition">
                                            <td className="p-4">
                                                <p className="font-bold text-gray-900">{b.guestName}</p>
                                                <p className="text-xs text-gray-400 font-mono">#{b.id.slice(-6).toUpperCase()}</p>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaCalendarAlt className="text-teal-500"/>
                                                    <div>
                                                        <p>{new Date(b.checkIn).toLocaleDateString()}</p>
                                                        <p className="text-xs text-gray-400">to {new Date(b.checkOut).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-bold text-gray-700">{b.roomType}</p>
                                                <p className="text-xs text-gray-500">{b.rooms} Room(s) • {b.nights} Night(s)</p>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={b.status} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    {/* Pending -> Confirm / Cancel */}
                                                    {b.status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(b.id, 'Confirmed')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Confirm Booking"><FaCheckCircle/></button>
                                                            <button onClick={() => handleStatusUpdate(b.id, 'Cancelled')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Cancel Booking"><FaTimesCircle/></button>
                                                        </>
                                                    )}

                                                    {/* Confirmed -> Check In */}
                                                    {b.status === 'Confirmed' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(b.id, 'Checked-in')} 
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-xs font-bold shadow-sm"
                                                        >
                                                            <FaSignInAlt/> Check In
                                                        </button>
                                                    )}

                                                    {/* Checked-in -> Check Out (Completed) */}
                                                    {b.status === 'Checked-in' && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(b.id, 'Completed')} 
                                                            className="px-3 py-1.5 bg-gray-800 text-white rounded-lg hover:bg-black flex items-center gap-1 text-xs font-bold shadow-sm"
                                                        >
                                                            <FaSignOutAlt/> Check Out
                                                        </button>
                                                    )}

                                                    {(b.status === 'Completed' || b.status === 'Cancelled') && (
                                                        <span className="text-xs text-gray-400 italic">No actions available</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelBookingsPage;