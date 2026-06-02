import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBed, FaSignInAlt, FaSignOutAlt, FaDollarSign, FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaWallet } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Helper for Status Badges
const StatusBadge = ({ status }) => {
  const styles = {
    'Confirmed': 'bg-green-100 text-green-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Checked-in': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-gray-100 text-gray-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// Helper for Room Cards
const RoomCard = ({ room }) => {
    // Determine status (Update field name 'isAvailable' based on your DB)
    const status = room.isAvailable ? 'Available' : 'Occupied'; 
    const styles = {
      'Available': 'bg-green-50 border-green-500 text-green-700',
      'Occupied': 'bg-blue-50 border-blue-500 text-blue-700',
      'Maintenance': 'bg-red-50 border-red-500 text-red-700',
    };

    return (
      <div className={`p-4 rounded-lg border-l-4 shadow-sm ${styles[status]}`}>
        <div className="flex justify-between items-center">
            <p className="font-bold text-gray-800">Room {room.roomNumber}</p>
            <span className="text-[10px] font-bold uppercase bg-white/60 px-2 py-0.5 rounded">{status}</span>
        </div>
        <p className="text-sm text-gray-600">{room.type}</p>
        <p className="text-xs font-mono mt-1">${room.price}</p>
      </div>
    );
};

const HotelDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Fetch Real Data ---
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/hotel/dashboard`, {
            headers: { 'x-auth-token': token }
        });
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-teal-600"/></div>;
  
  if (data?.profileNeeded) return (
    <div className="h-screen flex items-center justify-center pt-32 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md text-center border border-teal-100">
            <div className="bg-teal-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                <FaBed size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-4">Complete Your Profile</h2>
            <p className="text-gray-500 mb-8 font-medium">To access your dashboard and manage bookings, you first need to set up your hotel profile details.</p>
            <Link to="/hotel-admin/details" className="block w-full bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-100">
                Set Up Profile Now
            </Link>
        </div>
    </div>
  );

  if (!data) return <div className="p-10 text-center text-gray-500 pt-40">Failed to load dashboard data.</div>;

  const { stats, recentBookings, rooms } = data;

  // Stats Configuration
  const statsCards = [
    { 
        title: "Today's Check-ins", 
        value: stats.checkIns, 
        icon: <FaSignInAlt />, 
        color: 'bg-blue-500' 
    },
    { 
        title: "Today's Check-outs", 
        value: stats.checkOuts, 
        icon: <FaSignOutAlt />, 
        color: 'bg-orange-500' 
    },
    { 
        title: "Today's Net Revenue", 
        value: `$${stats.revenueToday.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 
        icon: <FaDollarSign />, 
        color: 'bg-green-500',
        sub: "After 10% Platform Fee"
    },
    { 
        title: "Total Net Revenue", 
        value: `$${stats.revenueTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 
        icon: <FaWallet />, 
        color: 'bg-purple-600',
        sub: "Lifetime Earnings"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Hotel Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time overview of your property</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-sm font-bold text-teal-600 hover:underline">
            Refresh Data
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{card.value}</p>
                {card.sub && <p className="text-[10px] text-green-600 font-bold mt-1 bg-green-50 inline-block px-1 rounded">{card.sub}</p>}
              </div>
              <div className="bg-emerald-600 text-white pt-16 pb-32 px-6 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                    <th className="p-4 font-bold">Guest / ID</th>
                    <th className="p-4 font-bold">Dates</th>
                    <th className="p-4 font-bold">Room</th>
                    <th className="p-4 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentBookings.length > 0 ? (
                      recentBookings.map(booking => (
                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                          <td className="p-4">
                            <p className="font-bold text-gray-800 text-sm">{booking.guestName}</p>
                            <p className="text-xs text-gray-400 font-mono">#{booking.id.slice(-6).toUpperCase()}</p>
                          </td>
                          <td className="p-4">
                              <p className="text-sm text-gray-600">{booking.checkIn}</p>
                              <p className="text-xs text-gray-400">to {booking.checkOut}</p>
                          </td>
                          <td className="p-4 text-sm font-medium text-gray-700">{booking.roomType}</td>
                          <td className="p-4"><StatusBadge status={booking.status} /></td>
                        </tr>
                      ))
                  ) : (
                      <tr>
                          <td colSpan="4" className="p-8 text-center text-gray-400 italic text-sm">No recent bookings found.</td>
                      </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Status Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Room Status</h2>
                <p className="text-xs font-bold text-gray-500">{stats.occupancy} Occupied</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {rooms.length > 0 ? (
                    rooms.map(room => (
                        <RoomCard key={room._id} room={room}/>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm italic">No rooms added yet.</p>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelDashboard;