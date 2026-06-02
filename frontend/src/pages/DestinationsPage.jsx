import React, { useState } from 'react';
import { tourismPlaces } from '../data/tourismPlaces';
import { MapPin, Search, X, ChevronDown, Filter } from 'lucide-react';

// Helper: Map Provinces to Districts for the dropdown logic
const provinceMap = {
    "Central": ["Kandy", "Matale", "Nuwara Eliya"],
    "Western": ["Colombo", "Gampaha", "Kalutara"],
    "Southern": ["Galle", "Matara", "Hambantota"],
    "Northern": ["Jaffna", "Mannar", "Vavuniya", "Mullaitivu", "Kilinochchi"],
    "Eastern": ["Trincomalee", "Batticaloa", "Ampara"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    "North Western": ["Puttalam", "Kurunegala"],
    "Sabaragamuwa": ["Ratnapura", "Kegalle"],
    "Uva": ["Badulla", "Monaragala"]
};

const DestinationsPage = () => {
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    // ✅ FIX 1: Calculate available districts directly (Derived State)
    // We do NOT need useState or useEffect for this. It updates automatically when selectedProvince changes.
    const availableDistricts = selectedProvince ? provinceMap[selectedProvince] || [] : [];

    // ✅ FIX 2: Handle resetting the district inside the event handler
    const handleProvinceChange = (e) => {
        setSelectedProvince(e.target.value);
        setSelectedDistrict(''); // Reset district immediately when province changes
    };

    // Filtering Logic
    const filteredPlaces = tourismPlaces.filter(place => {
        const term = searchTerm.toLowerCase();
        
        // 1. Search Text Match
        const matchesSearch = place.name.toLowerCase().includes(term) || 
                              place.description.toLowerCase().includes(term);

        // 2. Province Match
        let matchesProvince = true;
        if (selectedProvince) {
            const districtsInProvince = provinceMap[selectedProvince] || [];
            matchesProvince = districtsInProvince.includes(place.district);
        }

        // 3. District Match
        const matchesDistrict = selectedDistrict ? place.district === selectedDistrict : true;
        
        return matchesSearch && matchesProvince && matchesDistrict;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedProvince('');
        setSelectedDistrict('');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            
            {/* --- 1. Hero Header --- */}
            <div className="relative bg-teal-900 h-[350px] flex items-center justify-center overflow-hidden">
                <img 
                    // ✅ New Image: Sigiriya Rock (High Reliability)
                    src="https://res.cloudinary.com/drk4vxbrr/image/upload/v1767306918/sri-lanka_strzpp.jpg" 
                    alt="Sri Lanka Sigiriya" 
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="relative z-10 text-center px-4 max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
                        Explore Sri Lanka
                    </h1>
                    <p className="text-teal-50 text-lg md:text-xl font-medium drop-shadow-md">
                        Plan your next adventure with our guide to the island's best destinations.
                    </p>
                </div>
            </div>

            {/* --- 2. Floating Filter Bar --- */}
            <div className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-center">
                    
                    {/* Search Input */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search places (e.g. Beach, Temple)..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:bg-white transition outline-none"
                        />
                    </div>

                    {/* Divider (Desktop) */}
                    <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                    {/* Province Select */}
                    <div className="relative w-full md:w-48 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <select 
                            value={selectedProvince}
                            onChange={handleProvinceChange} // ✅ Using the custom handler
                            className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500 outline-none text-gray-700"
                        >
                            <option value="">All Provinces</option>
                            {Object.keys(provinceMap).map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                    </div>

                    {/* District Select (Disabled if no province) */}
                    <div className="relative w-full md:w-48">
                        <select 
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            className={`w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none outline-none transition
                                ${!selectedProvince ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 cursor-pointer focus:ring-2 focus:ring-teal-500'}
                            `}
                        >
                            <option value="">All Districts</option>
                            {availableDistricts.map(dist => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                        {selectedProvince && (
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                        )}
                    </div>

                    {/* Clear Button */}
                    {(searchTerm || selectedProvince) && (
                        <button 
                            onClick={clearFilters}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Clear Filters"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* --- 3. Results Section --- */}
            <div className="container mx-auto px-4 mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        {selectedDistrict ? `${selectedDistrict} Destinations` : 'Popular Destinations'}
                        <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {filteredPlaces.length}
                        </span>
                    </h2>
                </div>

                {filteredPlaces.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPlaces.map(place => (
                            <div key={place.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 flex flex-col overflow-hidden">
                                {/* Image */}
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={place.image} 
                                        alt={place.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        loading="lazy"
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                        <span className="text-white text-xs font-semibold uppercase tracking-wider flex items-center">
                                            <MapPin className="w-3 h-3 mr-1 text-teal-400" /> {place.district}
                                        </span>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition">
                                        {place.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
                                        {place.description}
                                    </p>
                                    <button className="w-full mt-auto py-2 bg-gray-50 text-teal-700 text-sm font-semibold rounded-lg hover:bg-teal-600 hover:text-white transition">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No destinations found</h3>
                        <p className="text-gray-500 mb-6">Try changing your province or search term.</p>
                        <button onClick={clearFilters} className="text-teal-600 font-semibold hover:underline">
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DestinationsPage;