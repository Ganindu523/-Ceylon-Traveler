import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaUser, FaCar, FaIdCard, FaMoneyBillWave, FaSave, FaCamera, FaTrash, FaSpinner } from 'react-icons/fa'; // Removed unused FaMapMarkedAlt
import { cityOptions } from '../data/sriLankanCities'; 

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

const VEHICLE_TYPES = [
    { value: 'Tuk Tuk', label: 'Tuk Tuk (3 Wheeler)' },
    { value: 'Nano', label: 'Tata Nano / Mini' },
    { value: 'Mini Car', label: 'Mini Car (Alto, WagonR)' },
    { value: 'Sedan', label: 'Sedan (Prius, Axio)' },
    { value: 'Van', label: 'Van (KDH, Caravan)' },
    { value: 'SUV', label: 'SUV / Jeep' },
    { value: 'Luxury', label: 'Luxury / Premium' },
];

const DriverProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingVehicle, setUploadingVehicle] = useState(false);
    
    // FIX 1: 'error' state is now used in the JSX below to show alerts
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '', 
        vehicleType: '',
        vehicleModel: '',
        licensePlate: '',
        pricePerKm: '',
        workingDistricts: [],
        description: ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [vehicleImages, setVehicleImages] = useState([]);

    // --- Fetch Profile Data ---
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            const config = { headers: { 'x-auth-token': token } };
            
            try {
                const res = await axios.get(`${API_BASE_URL}/taxi/profile`, config);
                const data = res.data;
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    vehicleType: data.vehicleType || '',
                    vehicleModel: data.vehicleModel || '',
                    licensePlate: data.licensePlate || '',
                    pricePerKm: data.pricePerKm || '',
                    workingDistricts: data.workingDistricts || [],
                    description: data.description || ''
                });
                setProfileImage(data.profileImage);
                setVehicleImages(data.vehicleImages || []);
            } catch (err) {
                console.error(err); // Used err
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // --- Form Handlers ---
    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleDistrictChange = (selectedOptions) => {
        setFormData({ ...formData, workingDistricts: selectedOptions ? selectedOptions.map(opt => opt.value) : [] });
    };

    const handleVehicleTypeChange = (option) => {
        setFormData({ ...formData, vehicleType: option ? option.value : '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null); // Clear previous errors
        const token = localStorage.getItem('token');
        const config = { headers: { 'x-auth-token': token } };

        try {
            await axios.put(`${API_BASE_URL}/taxi/profile`, formData, config);
            alert('Profile updated successfully!');
        } catch (err) {
            // FIX 2: Log the error to console to satisfy 'no-unused-vars'
            console.error("Save error:", err); 
            alert('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    // --- Image Upload Handlers ---
    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const data = new FormData();
        data.append('photos', file);
        
        setUploadingAvatar(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/taxi/profile/avatar`, data, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });
            setProfileImage(res.data);
        } catch (err) {
            // FIX 3: Log error
            console.error("Avatar upload error:", err);
            alert('Failed to upload profile image.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleVehiclePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const data = new FormData();
        files.forEach(file => data.append('photos', file));

        setUploadingVehicle(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/taxi/profile/vehicle-photos`, data, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });
            setVehicleImages(res.data); 
        } catch (err) {
            // FIX 4: Log error
            console.error("Vehicle photo upload error:", err);
            alert('Failed to upload vehicle photos.');
        } finally {
            setUploadingVehicle(false);
        }
    };

    const handleDeleteVehiclePhoto = async (photoUrl) => {
        if (!window.confirm('Delete this photo?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_BASE_URL}/taxi/profile/vehicle-photos`, {
                headers: { 'x-auth-token': token },
                data: { photoUrl }
            });
            setVehicleImages(res.data);
        } catch (err) {
            // FIX 5: Log error
            console.error("Delete photo error:", err);
            alert('Failed to delete photo.');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-teal-500" /></div>;

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="container mx-auto max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Driver Profile</h1>
                    <p className="text-gray-500">Manage your vehicle details, pricing, and service areas.</p>
                </header>

                {/* FIX 1: Displaying the error state here */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* --- Left Column: Profile Image --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <div className="relative inline-block group">
                                <img 
                                    src={profileImage || "https://placehold.co/150?text=Driver"}
                                    alt="Profile" 
                                    className="w-40 h-40 rounded-full object-cover border-4 border-teal-100 shadow-sm mx-auto"
                                />
                                <label className="absolute bottom-2 right-2 bg-teal-500 text-white p-2 rounded-full cursor-pointer hover:bg-teal-600 transition-colors shadow-md">
                                    {uploadingAvatar ? <FaSpinner className="animate-spin"/> : <FaCamera />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar}/>
                                </label>
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-gray-800">{formData.name}</h2>
                            <p className="text-gray-500 text-sm">{formData.email}</p>
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                                {formData.vehicleType || 'No Vehicle Set'}
                            </div>
                        </div>
                    </div>

                    {/* --- Right Column: Details Form --- */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-lg space-y-6">
                            <h3 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Vehicle & Service Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div className="relative">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                                    <div className="flex items-center border rounded-md bg-gray-50 px-3 py-2">
                                        <FaUser className="text-gray-400 mr-3" />
                                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="bg-transparent w-full outline-none text-gray-700" />
                                    </div>
                                </div>

                                {/* Vehicle Type */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle Type</label>
                                    <Select 
                                        options={VEHICLE_TYPES}
                                        value={VEHICLE_TYPES.find(opt => opt.value === formData.vehicleType)}
                                        onChange={handleVehicleTypeChange}
                                        placeholder="Select Vehicle Type"
                                        className="basic-single"
                                        classNamePrefix="select"
                                    />
                                </div>

                                {/* Vehicle Model */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Vehicle Model</label>
                                    <div className="flex items-center border rounded-md bg-gray-50 px-3 py-2">
                                        <FaCar className="text-gray-400 mr-3" />
                                        <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleInputChange} placeholder="e.g. Toyota Prius" className="bg-transparent w-full outline-none text-gray-700" />
                                    </div>
                                </div>

                                {/* License Plate */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">License Plate</label>
                                    <div className="flex items-center border rounded-md bg-gray-50 px-3 py-2">
                                        <FaIdCard className="text-gray-400 mr-3" />
                                        <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} placeholder="e.g. WP CAB-1234" className="bg-transparent w-full outline-none text-gray-700" />
                                    </div>
                                </div>

                                {/* Price Per KM */}
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Price per KM (LKR)</label>
                                    <div className="flex items-center border rounded-md bg-gray-50 px-3 py-2">
                                        <FaMoneyBillWave className="text-gray-400 mr-3" />
                                        <input type="number" name="pricePerKm" value={formData.pricePerKm} onChange={handleInputChange} placeholder="0.00" className="bg-transparent w-full outline-none text-gray-700" />
                                    </div>
                                </div>
                            </div>

                            {/* Working Districts (Multi-Select) */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Working Districts</label>
                                <Select 
                                    isMulti
                                    options={cityOptions}
                                    value={cityOptions.filter(opt => formData.workingDistricts.includes(opt.value))}
                                    onChange={handleDistrictChange}
                                    placeholder="Select districts you operate in..."
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">About Me / Vehicle</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full border rounded-md bg-gray-50 px-3 py-2 outline-none text-gray-700 focus:ring-1 focus:ring-teal-500"></textarea>
                            </div>

                            {/* Save Button */}
                            <div className="pt-4 border-t text-right">
                                <button type="submit" disabled={saving} className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition flex items-center inline-block disabled:opacity-50">
                                    {saving ? <FaSpinner className="animate-spin mr-2"/> : <FaSave className="mr-2"/>}
                                    Save Changes
                                </button>
                            </div>
                        </form>

                        {/* --- Vehicle Photos Section --- */}
                        <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
                            <div className="flex justify-between items-center border-b pb-3 mb-6">
                                <h3 className="text-xl font-semibold text-gray-700">Vehicle Photos</h3>
                                <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition flex items-center font-medium">
                                    {uploadingVehicle ? <FaSpinner className="animate-spin mr-2"/> : <FaCamera className="mr-2"/>}
                                    Add Photos
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleVehiclePhotoUpload} disabled={uploadingVehicle}/>
                                </label>
                            </div>

                            {vehicleImages.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {vehicleImages.map((url, index) => (
                                        <div key={index} className="relative group aspect-video rounded-lg overflow-hidden shadow-sm">
                                            <img src={url} alt="Vehicle" className="w-full h-full object-cover"/>
                                            <button 
                                                onClick={() => handleDeleteVehiclePhoto(url)}
                                                className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                title="Delete"
                                            >
                                                <FaTrash size={12}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <FaCar className="text-4xl text-gray-300 mx-auto mb-2"/>
                                    <p className="text-gray-500">No vehicle photos uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverProfilePage;