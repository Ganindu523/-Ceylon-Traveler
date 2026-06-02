import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const Dashboard = () => {
  const [userData, setUserData] = useState([]);
  
  // Get user role from the stored JWT
  const token = localStorage.getItem('token');
  const userRole = token ? jwt_decode(token).user.role : null;
  
  useEffect(() => {
    const fetchData = async () => {
      const config = { headers: { 'x-auth-token': token } };
      let endpoint = '';
      if (userRole === 'tourist') {
        endpoint = '/api/dashboard/my-bookings';
      } else if (userRole === 'provider') {
        endpoint = '/api/dashboard/my-listings';
      }

      if (endpoint) {
        try {
          const res = await axios.get(endpoint, config);
          setUserData(res.data);
        } catch (err) {
          console.error("Failed to fetch dashboard data");
        }
      }
    };
    fetchData();
  }, [token, userRole]);

  return (
    <div className="dashboard-container">
      <h1>Your Dashboard</h1>
      {userRole === 'tourist' && <h2>My Trips</h2>}
      {userRole === 'provider' && <h2>My Listings</h2>}
      
      {/* Render the data based on user role */}
      <ul>
        {userData.map(item => (
          <li key={item._id}>{item.title || `Booking for: ${item.listing.title}`}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;