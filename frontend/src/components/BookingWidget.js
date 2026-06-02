import React, { useState } from 'react';
import axios from 'axios'; // ✅ Fixed: 'axios' is not defined

const BookingWidget = ({ listing }) => {
  // ✅ Fixed: Defined state for startDate and endDate
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const bookingData = { listingId: listing._id, startDate, endDate };
    const config = { headers: { 'x-auth-token': localStorage.getItem('token') } };
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // Ensure your backend route is correct (e.g., http://localhost:5000/api/bookings)
      await axios.post(`${API_URL}/api/bookings`, bookingData, config);
      alert('Booking request sent!');
    } catch (err) {
      // ✅ Fixed: 'err' is defined but never used (now logging it)
      console.error("Booking Error:", err);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="booking-widget bg-white p-4 rounded-xl shadow-sm border border-gray-200 mt-4">
      <h4 className="font-bold text-lg mb-4 text-gray-800">Book this Service</h4>
      
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-in</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Check-out</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      <button 
        onClick={handleBooking} 
        className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition shadow-md"
      >
        Request to Book
      </button>
    </div>
  );
};

export default BookingWidget;