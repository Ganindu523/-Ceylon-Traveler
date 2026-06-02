import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Save, Trash2, Loader, Building, 
    MapPin, Phone, Info, Locate, Map as MapIcon, Plane 
} from 'lucide-react';

// --- NEW IMPORTS FOR MAP ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Fix for Leaflet Default Icon (Switched to unpkg for better reliability) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Constants ---
const AIRPORT_COORDS = { lat: 7.1811, lng: 79.8837 };

const districtList = [
    'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
    'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
    'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 
    'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const cityOptions = [
    'Colombo', 'Negombo', 'Kandy', 'Galle', 'Sigiriya', 'Nuwara Eliya', 
    'Jaffna', 'Trincomalee', 'Anuradhapura', 'Ella', 'Bentota', 'Mirissa', 'Hikkaduwa'
];

const availableAmenities = [
    'Wifi', 'Pool', 'Parking', 'Restaurant', 'Gym', 
    'Spa', 'AC', 'Room Service', 'Airport Shuttle', 'Bar', 'Pet Friendly'
];

// --- Haversine Distance Helper ---
const calculateKM = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); 
};

// --- Map Helpers ---
const LocationPicker = ({ setFormData }) => {
    useMapEvents({
        click(e) {
            setFormData(prev => ({
                ...prev,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            }));
        },
    });
    return null;
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] !== 0 && center[1] !== 0) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

// --- Form Components ---
const AmenityCheckbox = ({ amenity, checked, onChange }) => (
    <label className="flex items-center space-x-2 mr-4 mb-2 cursor-pointer">
        <input 
            type="checkbox" 
            checked={checked} 
            onChange={() => onChange(amenity)} 
            className="rounded text-teal-500 focus:ring-teal-400 h-4 w-4"
        />
        <span className="text-gray-700">{amenity}</span>
    </label>
);

const InputField = ({ label, name, value, onChange, required = false, type = "text", placeholder = "", icon }) => (
    <div className="relative mt-2">
         {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input 
            type={type} name={name} id={name} value={value} onChange={onChange} required={required} 
            className={`w-full h-12 px-4 ${icon ? 'pl-10' : ''} text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-200`} 
            placeholder={placeholder} 
        />
        <label htmlFor={name} className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">{label} {required && <span className="text-red-500">*</span>}</label>
    </div>
);

const TextAreaField = ({ label, name, value, onChange, required = false, rows = 4, placeholder = "", icon }) => (
     <div className="relative mt-2">
         {icon && <div className="absolute left-3 top-4 text-gray-400">{icon}</div>}
         <textarea 
            name={name} id={name} value={value} onChange={onChange} required={required} rows={rows} 
            className={`w-full p-4 ${icon ? 'pl-10' : ''} text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-200 resize-none`} 
            placeholder={placeholder} 
         />
         <label htmlFor={name} className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">{label} {required && <span className="text-red-500">*</span>}</label>
    </div>
);

const HotelDetailsPage = () => {
    const [hotelData, setHotelData] = useState(null);
    const [formData, setFormData] = useState({ 
        name: '', address: '', district: '', city: '', description: '', amenities: [], contactNumber: '', 
        latitude: null, longitude: null 
    });
    const [photos, setPhotos] = useState([]);
    const [newPhotos, setNewPhotos] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchHotelData = async () => {
            setLoading(true); setError(null);
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { 'x-auth-token': token } } : {};
                // ✅ FIXED: Corrected URL to singular 'hotel'
                const res = await axios.get(`${API_URL}/api/hotel/managed`, config);
                if (res.data) {
                    setHotelData(res.data);
                    setFormData({
                        name: res.data.name || '', address: res.data.address || '', 
                        district: res.data.district || '',
                        city: res.data.city || '',
                        description: res.data.description || '', amenities: res.data.amenities || [], contactNumber: res.data.contactNumber || '',
                        latitude: res.data.latitude || null,
                        longitude: res.data.longitude || null
                    });
                    setPhotos(res.data.photos || []);
                }
            } catch (err) { 
                setError('Failed to load hotel details.'); 
                console.error(err);
            } finally { 
                setLoading(false); 
            }
        };
        fetchHotelData();
    }, []);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleDistrictChange = (e) => setFormData({ ...formData, district: e.target.value });
    const handleCityChange = (e) => setFormData({ ...formData, city: e.target.value });

    const handleAmenityChange = (amenity) => {
         setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity] }));
    };

    const handleGetCurrentLocation = (e) => {
        e.preventDefault(); 
        if (!navigator.geolocation) return alert("Geolocation not supported");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData(prev => ({ 
                    ...prev, 
                    latitude: pos.coords.latitude, 
                    longitude: pos.coords.longitude 
                }));
            },
            (err) => {
                console.error("GPS Error:", err);
                alert("Unable to retrieve location.");
            }
        );
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault(); setSaving(true); setError(null);
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { 'x-auth-token': token } } : {};
            // ✅ FIXED: Corrected URL to singular 'hotel'
            const res = await axios.put(`${API_URL}/api/hotel/managed`, formData, config);
            setHotelData(res.data); setPhotos(res.data.photos || []);
            alert('Hotel details saved successfully!');
        } catch (err) { 
            const errorMsg = err.response?.data?.msg || 'Failed to save.'; 
            setError(errorMsg); 
            alert(`Error: ${errorMsg}`);
        } finally { setSaving(false); }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files); setNewPhotos(files);
        previews.forEach(url => URL.revokeObjectURL(url));
        setPreviews(files.map(file => URL.createObjectURL(file)));
    };
    
    useEffect(() => { return () => previews.forEach(url => URL.revokeObjectURL(url)); }, [previews]);
    
    const handlePhotoUpload = async () => {
        if (newPhotos.length === 0 || !hotelData) return alert('No photos or hotel details not saved.');
        const fd = new FormData(); newPhotos.forEach(f => fd.append('photos', f));
        setUploading(true); setError(null);
        try {
            const token = localStorage.getItem('token');
            // ✅ FIXED: Corrected URL to singular 'hotel'
            const res = await axios.post(`${API_URL}/api/hotel/managed/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token } });
            setPhotos(res.data); setNewPhotos([]); setPreviews([]); alert('Photos uploaded!');
        } catch (err) { alert(`Upload Error: ${err.response?.data?.msg || 'Failed'}`); } 
        finally { setUploading(false); }
    };
    
    const handleDeletePhoto = async (photoUrl) => {
        if (!window.confirm('Delete?')) return;
        try {
            const token = localStorage.getItem('token');
            // ✅ FIXED: Corrected URL to singular 'hotel'
            const res = await axios.delete(`${API_URL}/api/hotel/managed/photos`, { data: { photoUrl }, headers: { 'x-auth-token': token } });
            setPhotos(res.data);
        } catch (err) { 
            console.error("Delete Error:", err);
            alert('Delete failed'); 
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><Loader className="animate-spin text-4xl text-teal-500" /></div>;

    const mapCenter = (formData.latitude && formData.longitude) 
        ? [formData.latitude, formData.longitude] 
        : defaultCenter;

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="container mx-auto max-w-4xl">
                <header className="mb-8 p-6 bg-white rounded-lg shadow">
                    <h1 className="text-3xl font-bold text-gray-800">Manage Hotel Details</h1>
                    <p className="text-gray-500 mt-1">Update your hotel's information, location, and photos.</p>
                </header>

                {error && <p className="mb-4 text-center text-red-600 bg-red-100 p-3 rounded shadow">{error}</p>}

                <form onSubmit={handleSaveDetails} className="bg-white p-8 rounded-lg shadow-lg mb-8 space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-6">Hotel Information</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                         <InputField label="Hotel Name" name="name" value={formData.name} onChange={handleInputChange} required icon={<Building />} />
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="relative mt-2">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"><MapIcon size={16} /></div>
                                <select 
                                    name="district" 
                                    value={formData.district} 
                                    onChange={handleDistrictChange}
                                    className="w-full h-12 px-4 pl-10 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-200 appearance-none"
                                    required
                                >
                                    <option value="">Select District...</option>
                                    {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">District <span className="text-red-500">*</span></label>
                             </div>

                             <div className="relative mt-2">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"><MapPin size={16} /></div>
                                <select 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleCityChange}
                                    className="w-full h-12 px-4 pl-10 text-gray-800 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-200 appearance-none"
                                    required
                                >
                                    <option value="">Select City...</option>
                                    {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <label className="absolute left-3 -top-2.5 bg-white px-1 text-xs text-gray-500">City <span className="text-red-500">*</span></label>
                             </div>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Address" name="address" value={formData.address} onChange={handleInputChange} required icon={<MapPin />} />
                        <InputField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+94..." icon={<Phone />} />
                    </div>
                    
                    <TextAreaField label="Description" name="description" value={formData.description} onChange={handleInputChange} required icon={<Info />} />

                    {/* --- INTERACTIVE MAP SECTION --- */}
                    <div className="mt-6 border-t pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <button onClick={handleGetCurrentLocation} type="button" className="text-xs flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition font-medium">
                                <Locate className="mr-1" size={14} /> Get Current GPS
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Click on the map to set the exact location.</p>
                        
                        <div className="border rounded-lg overflow-hidden shadow-sm h-[400px] bg-gray-100 z-0">
                            <MapContainer 
                                center={mapCenter} 
                                zoom={13} 
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationPicker setFormData={setFormData} />
                                <MapUpdater center={mapCenter} />

                                {formData.latitude && formData.longitude && (
                                    <Marker position={[formData.latitude, formData.longitude]} />
                                )}
                            </MapContainer>
                        </div>
                        
                        {/* DISTANCE CALCULATION DISPLAY */}
                        <div className="mt-4 p-4 bg-teal-50 rounded-lg border border-teal-100 flex items-center justify-between">
                            <div className="flex items-center text-teal-800">
                                <Plane size={20} className="mr-2 text-teal-600" />
                                <span className="font-semibold">Distance from Colombo Airport (CMB):</span>
                            </div>
                            <div className="text-xl font-bold text-teal-600">
                                {formData.latitude && formData.longitude ? (
                                    `${calculateKM(AIRPORT_COORDS.lat, AIRPORT_COORDS.lng, formData.latitude, formData.longitude)} KM`
                                ) : (
                                    'Not Set'
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3 opacity-60">
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs text-gray-500">Lat:</span>
                                <input type="number" readOnly value={formData.latitude || ''} className="w-full border rounded p-2 pl-10 bg-gray-50" placeholder="Not Set" />
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-xs text-gray-500">Lng:</span>
                                <input type="number" readOnly value={formData.longitude || ''} className="w-full border rounded p-2 pl-10 bg-gray-50" placeholder="Not Set" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t pt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {availableAmenities.map(a => (
                                <AmenityCheckbox key={a} amenity={a} checked={formData.amenities.includes(a)} onChange={handleAmenityChange} />
                            ))}
                        </div>
                    </div>

                    <div className="text-right pt-6 border-t mt-6">
                        <button type="submit" disabled={saving} className="bg-teal-500 text-white font-bold py-3 px-8 rounded-lg transition hover:bg-teal-600 disabled:opacity-50 flex items-center justify-center ml-auto">
                            {saving ? <Loader className="animate-spin mr-2" /> : <Save className="mr-2" />} Save Details
                        </button>
                    </div>
                </form>

                <div className="bg-white p-8 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-6">Hotel Photos</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {photos.map((url, i) => (
                            <div key={i} className="relative group aspect-video rounded overflow-hidden shadow">
                                <img src={url} alt="Hotel" className="w-full h-full object-cover"/>
                                <button onClick={() => handleDeletePhoto(url)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button>
                            </div>
                        ))}
                      </div>
                      <div className="border-t pt-6">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer" disabled={!hotelData || uploading}/>
                        {previews.length > 0 && <div className="mt-4 grid grid-cols-4 gap-2">{previews.map((p,i)=><img key={i} src={p} alt="Prev" className="h-20 w-full object-cover rounded"/>)}</div>}
                        {newPhotos.length > 0 && <button onClick={handlePhotoUpload} disabled={uploading} className="mt-4 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload Selected'}</button>}
                      </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetailsPage;