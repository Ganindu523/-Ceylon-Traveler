import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ListingsGrid.css'; 

const ListingCard = ({ listing }) => (
  <div className="listing-card">
    <img src={listing.imageUrl} alt={listing.title} className="listing-image" />
    <div className="listing-info">
      <span className="listing-type">{listing.type}</span>
      <h3>{listing.title}</h3>
      <p className="listing-location">{listing.location}</p>
      <p className="listing-price">LKR {listing.price.toLocaleString()}</p>
      <button className="btn-secondary">View Details</button>
    </div>
  </div>
);

const ListingsGrid = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      try {
        const res = await axios.get(`${API_URL}/api/listings`); 
        setListings(res.data);
      } catch (err) {
        // FIX: Pass 'err' to console.error so it is "used"
        console.error("Could not fetch listings.", err);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="listings-grid-container">
      <h2>Explore Services in Sri Lanka</h2>
      <div className="listings-grid">
        {listings.map(listing => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default ListingsGrid;