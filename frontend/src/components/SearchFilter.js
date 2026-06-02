import React, { useState } from 'react';

// This component would typically pass the filters up to a parent
// component (like ListingsGrid) to re-fetch the data.
const SearchFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    location: '',
    type: ''
  });

  const onChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const onSubmit = e => {
    e.preventDefault();
    onFilterChange(filters); // Pass filters to parent to trigger API call
  };

  return (
    <div className="search-container">
      <form onSubmit={onSubmit}>
        <input 
          type="text" 
          name="location"
          placeholder="Where to? (e.g., Kandy)"
          value={filters.location}
          onChange={onChange}
        />
        <select name="type" value={filters.type} onChange={onChange}>
          <option value="">All Services</option>
          <option value="hotel">Hotels</option>
          <option value="taxi">Taxis</option>
          <option value="guide">Guides</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>
    </div>
  );
};

export default SearchFilter;