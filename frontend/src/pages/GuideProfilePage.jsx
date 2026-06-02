import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    User, Map, DollarSign, Save, Camera, 
    Languages, Loader, MapPin, CheckCircle, RefreshCw 
} from 'lucide-react';

const districtOptions = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 
    'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 
    'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 
    'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 
    'Trincomalee', 'Vavuniya'
];

const languageOptions = [
    'English', 'Sinhala', 'Tamil', 'French', 'German', 'Chinese', 'Russian', 'Japanese', 'Arabic'
];

const GuideProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // ✅ NEW: State for Exchange Rate
    const [exchangeRate, setExchangeRate] = useState(300); // Default fallback

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        guideType: 'All Island', 
        serviceAreas: [],
        pricePerDay: '', 
        languages: []
    });

    const [profileImage, setProfileImage] = useState(null);

    // --- 1. Fetch Live Exchange Rate ---
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                // Use the key from .env
                const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;
                if (apiKey) {
                    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
                    if (res.data && res.data.conversion_rates && res.data.conversion_rates.LKR) {
                        setExchangeRate(res.data.conversion_rates.LKR);
                        console.log("Live LKR Rate Fetched:", res.data.conversion_rates.LKR);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch exchange rate, using default (300).", err);
            }
        };
        fetchExchangeRate();
    }, []);

    // --- 2. Fetch Profile ---
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_URL}/api/guide/profile`, {
                    headers: { 'x-auth-token': token }
                });
                
                const d = res.data;
                setFormData({
                    name: d.name || '',
                    email: d.email || '',
                    phone: d.phone || '',
                    bio: d.bio || '',
                    guideType: d.guideType || 'All Island',
                    serviceAreas: d.serviceAreas || [],
                    pricePerDay: d.pricePerDay || '',
                    languages: d.languages || []
                });
                setProfileImage(d.profileImage);
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleMultiSelectChange = (field, value) => {
        setFormData(prev => {
            const currentList = prev[field];
            if (currentList.includes(value)) {
                return { ...prev, [field]: currentList.filter(item => item !== value) };
            } else {
                return { ...prev, [field]: [...currentList, value] };
            }
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const data = new FormData();
        data.append('photos', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/guide/profile/avatar`, data, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });
            setProfileImage(res.data);
        } catch (err) {
            console.error("Image upload error:", err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/guide/profile`, formData, {
                headers: { 'x-auth-token': token }
            });
            alert('Profile updated successfully!');
        } catch (err) {
            console.error("Save error:", err);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // ✅ Helper to calculate LKR using dynamic rate
    const calculateLKR = (usdAmount) => {
        if (!usdAmount || isNaN(usdAmount)) return 0;
        return (parseFloat(usdAmount) * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-teal-600 w-10 h-10"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Guide Profile</h1>
                    <p className="text-gray-500">Manage your appearance, pricing, and tour details.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm text-center border">
                            <div className="relative inline-block group">
                                <img 
                                    src={profileImage || "https://placehold.co/150?text=Guide"}
                                    alt="Profile" 
                                    className="w-40 h-40 rounded-full object-cover border-4 border-teal-100 shadow-sm mx-auto"
                                />
                                <label className="absolute bottom-2 right-2 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 transition shadow-md">
                                    {uploading ? <Loader className="animate-spin w-5 h-5"/> : <Camera className="w-5 h-5"/>}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading}/>
                                </label>
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-gray-800">{formData.name}</h2>
                            <p className="text-gray-500 text-sm">{formData.email}</p>
                            
                            <div className="mt-4 bg-blue-50 text-blue-700 py-1 px-3 rounded-full text-xs font-semibold inline-flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {formData.guideType} Guide
                            </div>
                        </div>

                        <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                            <h4 className="font-semibold text-teal-800 mb-2 flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Tips for more bookings</h4>
                            <ul className="text-sm text-teal-700 space-y-2 list-disc list-inside">
                                <li>Upload a clear, smiling photo.</li>
                                <li>List all languages you speak fluently.</li>
                                <li>Set competitive USD pricing.</li>
                                <li>Write a bio that highlights your experience.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-sm border space-y-6">
                            <h3 className="text-lg font-semibold text-gray-700 border-b pb-3 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-teal-600"/> Personal Details
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none"/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="+94 7X XXX XXXX"/>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">About Me (Bio)</label>
                                <textarea name="bio" rows="4" value={formData.bio} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Tell tourists about your experience and personality..."></textarea>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-700 border-b pb-3 mb-4 flex items-center">
                                    <Map className="w-5 h-5 mr-2 text-teal-600"/> Service & Coverage
                                </h3>

                                <div className="mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tour Coverage Type</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition ${formData.guideType === 'All Island' ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="guideType" value="All Island" checked={formData.guideType === 'All Island'} onChange={(e) => setFormData({...formData, guideType: e.target.value})} className="hidden" />
                                            <div className="font-bold text-gray-800">All Island Guide</div>
                                            <div className="text-xs text-gray-500">I can travel anywhere in Sri Lanka.</div>
                                        </label>

                                        <label className={`flex-1 border rounded-lg p-4 cursor-pointer transition ${formData.guideType === 'District' ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'hover:bg-gray-50'}`}>
                                            <input type="radio" name="guideType" value="District" checked={formData.guideType === 'District'} onChange={(e) => setFormData({...formData, guideType: e.target.value, serviceAreas: []})} className="hidden" />
                                            <div className="font-bold text-gray-800">District Specific</div>
                                            <div className="text-xs text-gray-500">I only operate in specific areas.</div>
                                        </label>
                                    </div>
                                </div>

                                {formData.guideType === 'District' && (
                                    <div className="mb-4 animate-fadeIn">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Select Your Districts</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 border rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                                            {districtOptions.map(dist => (
                                                <label key={dist} className={`flex items-center space-x-2 text-sm cursor-pointer p-2 rounded transition ${formData.serviceAreas.includes(dist) ? 'bg-teal-50 text-teal-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                    <input type="checkbox" checked={formData.serviceAreas.includes(dist)} onChange={() => handleMultiSelectChange('serviceAreas', dist)} className="form-checkbox text-teal-600 rounded focus:ring-teal-500" />
                                                    <span>{dist}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {/* Price in USD with Live LKR Estimate */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block flex items-center">
                                        <DollarSign className="w-3 h-3 mr-1"/> Price Per Day (USD)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-sm">$</span>
                                        </div>
                                        <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleInputChange} className="w-full border rounded-lg pl-7 pr-4 py-2 bg-gray-50 focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 50"/>
                                    </div>
                                    <div className="mt-2 flex items-center text-xs text-teal-600 bg-teal-50 p-2 rounded-md">
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        <span>Approx: <strong>LKR {calculateLKR(formData.pricePerDay)}</strong> (Rate: 1$ = {exchangeRate.toFixed(2)} LKR)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center">
                                        <Languages className="w-3 h-3 mr-1"/> Languages Spoken
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                                        {languageOptions.map(lang => (
                                            <label key={lang} className={`flex items-center space-x-2 text-sm cursor-pointer p-1 rounded transition ${formData.languages.includes(lang) ? 'bg-teal-50 text-teal-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}>
                                                <input type="checkbox" checked={formData.languages.includes(lang)} onChange={() => handleMultiSelectChange('languages', lang)} className="form-checkbox text-teal-600 rounded focus:ring-teal-500" />
                                                <span>{lang}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t flex justify-end">
                                <button type="submit" disabled={saving} className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-lg flex items-center disabled:opacity-70">
                                    {saving ? <Loader className="animate-spin mr-2"/> : <Save className="mr-2"/>}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideProfilePage;