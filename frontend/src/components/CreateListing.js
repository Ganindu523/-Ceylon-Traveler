import React, { useState } from 'react';
import axios from 'axios';

const CreateListing = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'hotel',
    location: '',
    price: '',
    imageUrl: ''
  });

  const { title, description, type, location, price, imageUrl } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': localStorage.getItem('token') // Sending the token for auth
      }
    };
    try {
      const res = await axios.post('/api/listings', formData, config);
      alert('Listing Created Successfully!');
      console.log(res.data);
    } catch (err) {
      alert('Failed to create listing: ' + err.response.data.msg);
    }
  };
  
  return (
    <div className="form-container">
      <h2>Create a New Service Listing</h2>
      <form onSubmit={onSubmit}>
        <input type="text" placeholder="Service Title (e.g., 'Luxury Beach Hotel')" name="title" value={title} onChange={onChange} required />
        <textarea placeholder="Detailed Description" name="description" value={description} onChange={onChange} required></textarea>
        <select name="type" value={type} onChange={onChange}>
          <option value="hotel">Hotel</option>
          <option value="taxi">Taxi Service</option>
          <option value="guide">Tour Guide</option>
        </select>
        <input type="text" placeholder="Location (e.g., 'Galle, Sri Lanka')" name="location" value={location} onChange={onChange} required />
        <input type="number" placeholder="Price (LKR)" name="price" value={price} onChange={onChange} required />
        <input type="text" placeholder="Image URL" name="imageUrl" value={imageUrl} onChange={onChange} />
        <input type="submit" value="Create Listing" className="btn-primary" />
      </form>
    </div>
  );
};

export default CreateListing;