import React, { useState, useEffect, useCallback } from 'react'; // ✅ Removed useMemo
import axios from 'axios';
import { 
    FaEdit, FaTrash, FaPlus, FaSpinner, FaBed, FaWifi, FaCheckCircle, 
    FaTimesCircle, FaImage, FaSearch, FaSortAmountDown 
} from 'react-icons/fa';

// --- Constants ---
const ROOM_TYPES = ['Single', 'Double', 'Queen', 'King', 'Suite', 'Deluxe', 'Family'];
const ROOM_STATUSES = ['Available', 'Occupied', 'Cleaning', 'Maintenance'];

const RoomManagementPage = () => {
    // --- State ---
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State
    const [formData, setFormData] = useState({
        roomNumber: '', type: 'Double', price: '', status: 'Available', features: '', description: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingPhotos, setExistingPhotos] = useState([]);

    // Exchange Rate
    const [usdToLkrRate, setUsdToLkrRate] = useState(325); // Default fallback

    // --- Helpers ---
    const getAuthHeader = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- Fetch Data ---
    const fetchRooms = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/rooms`, getAuthHeader());
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        const fetchRate = async () => {
            const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;
            if (apiKey) {
                try {
                    const res = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
                    if(res.data.conversion_rates.LKR) setUsdToLkrRate(res.data.conversion_rates.LKR);
                } catch (e) { console.error("Rate error", e); }
            }
        };
        fetchRate();
        fetchRooms();
    }, [fetchRooms]);

    // --- Handlers ---
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);

        // Generate Previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index, isExisting = false) => {
        if (isExisting) {
            setExistingPhotos(prev => prev.filter((_, i) => i !== index));
        } else {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
            setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    const openModal = (room = null) => {
        setCurrentRoom(room);
        if (room) {
            // Edit Mode
            setFormData({
                roomNumber: room.roomNumber,
                type: room.type,
                price: room.price,
                status: room.status,
                features: room.features.join(', '),
                description: room.description || ''
            });
            setExistingPhotos(room.photos || []);
            setPreviewUrls([]);
            setSelectedFiles([]);
        } else {
            // Add Mode - Auto Generate Room ID Logic (Visual Only)
            const nextNum = rooms.length > 0 
                ? Math.max(...rooms.map(r => parseInt(r.roomNumber) || 0)) + 1 
                : 101;
            
            setFormData({
                roomNumber: nextNum.toString(),
                type: 'Double',
                price: '',
                status: 'Available',
                features: 'Wifi, AC, TV',
                description: ''
            });
            setExistingPhotos([]);
            setPreviewUrls([]);
            setSelectedFiles([]);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('roomNumber', formData.roomNumber);
        data.append('type', formData.type);
        data.append('price', formData.price);
        data.append('status', formData.status);
        data.append('features', formData.features);
        data.append('description', formData.description);

        // Append New Files
        selectedFiles.forEach(file => {
            data.append('photos', file);
        });

        // Append Existing Photos (for PUT)
        existingPhotos.forEach(photo => {
            data.append('existingPhotos', photo);
        });

        try {
            const config = { 
                headers: { 
                    'x-auth-token': localStorage.getItem('token'),
                    'Content-Type': 'multipart/form-data' 
                } 
            };

            if (currentRoom) {
                await axios.put(`${API_URL}/api/rooms/${currentRoom._id}`, data, config);
                alert("Room Updated Successfully!");
            } else {
                await axios.post(`${API_URL}/api/rooms`, data, config);
                alert("Room Created Successfully!");
            }
            fetchRooms();
            setIsModalOpen(false);
        } catch (err) {
            console.error("Save Error:", err);
            alert(err.response?.data?.msg || "Failed to save room.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this room?")) return;
        try {
            await axios.delete(`${API_URL}/api/rooms/${id}`, getAuthHeader());
            setRooms(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            // ✅ Fix: Use the err variable to log specific error
            console.error("Delete Error:", err);
            alert("Delete failed. Please try again.");
        }
    };

    // --- Filtering ---
    const filteredRooms = rooms.filter(r => 
        r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- UI Components ---
    const StatusBadge = ({ status }) => {
        const colors = {
            'Available': 'bg-green-100 text-green-700',
            'Occupied': 'bg-blue-100 text-blue-700',
            'Cleaning': 'bg-yellow-100 text-yellow-700',
            'Maintenance': 'bg-red-100 text-red-700'
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><FaSpinner className="animate-spin text-4xl text-teal-600"/></div>;

    return (
        <div className="bg-gray-50 min-h-screen p-6 md:p-10 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Room Management</h1>
                        <p className="text-gray-500">Manage availability, pricing, and details.</p>
                    </div>
                    <button 
                        onClick={() => openModal()} 
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition transform active:scale-95"
                    >
                        <FaPlus/> Add Room
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex items-center gap-4">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-3 text-gray-400"/>
                        <input 
                            type="text" 
                            placeholder="Search by Room Number or Type..." 
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                        <FaSortAmountDown/> {filteredRooms.length} Rooms
                    </div>
                </div>

                {/* Rooms Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map(room => (
                        <div key={room._id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            {/* Image Area */}
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                <img 
                                    src={room.photos?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                                    alt={`Room ${room.roomNumber}`} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-3 right-3">
                                    <StatusBadge status={room.status}/>
                                </div>
                                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold">
                                    Room {room.roomNumber}
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-800">{room.type}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <FaBed/> {room.type === 'Family' ? '4 Guests' : '2 Guests'}
                                            <span className="mx-1">•</span>
                                            <FaWifi/> Wifi
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-teal-600">${room.price}</p>
                                        <p className="text-[10px] text-gray-400">LKR {(room.price * usdToLkrRate).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Features Tags */}
                                <div className="flex flex-wrap gap-1 mt-3 mb-4 h-12 overflow-hidden">
                                    {room.features.slice(0, 3).map((f, i) => (
                                        <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{f}</span>
                                    ))}
                                    {room.features.length > 3 && <span className="text-[10px] text-gray-400 px-1 py-1">+{room.features.length - 3} more</span>}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button onClick={() => openModal(room)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition flex justify-center items-center gap-2">
                                        <FaEdit/> Edit
                                    </button>
                                    <button onClick={() => handleDelete(room._id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition flex justify-center items-center gap-2">
                                        <FaTrash/> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Add/Edit Modal --- */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
                        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h2 className="text-2xl font-black text-gray-800">{currentRoom ? 'Edit Room' : 'Add New Room'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="bg-white p-2 rounded-full hover:bg-gray-200 transition"><FaTimesCircle size={24} className="text-gray-400 hover:text-red-500"/></button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left Column: Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Room Number (Auto-Suggested)</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-teal-500 bg-gray-50"
                                                value={formData.roomNumber}
                                                onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Room Type</label>
                                            <select 
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-teal-500 bg-white"
                                                value={formData.type}
                                                onChange={e => setFormData({...formData, type: e.target.value})}
                                            >
                                                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Price (USD)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-3 pl-8 border-2 border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:border-teal-500"
                                                    value={formData.price}
                                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                                    required
                                                />
                                            </div>
                                            {formData.price && <p className="text-xs text-teal-600 mt-1 font-bold text-right">≈ LKR {(formData.price * usdToLkrRate).toLocaleString()}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Status</label>
                                            <select 
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-teal-500 bg-white"
                                                value={formData.status}
                                                onChange={e => setFormData({...formData, status: e.target.value})}
                                            >
                                                {ROOM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Right Column: Images & Features */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Room Images</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <FaImage className="mx-auto text-gray-400 mb-2" size={24}/>
                                                <p className="text-sm text-gray-500 font-bold">Click to Upload Photos</p>
                                                <p className="text-xs text-gray-400">(Max 5 images)</p>
                                            </div>
                                            
                                            {/* Preview Grid */}
                                            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                                                {/* Existing Photos */}
                                                {existingPhotos.map((url, i) => (
                                                    <div key={`exist-${i}`} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={url} alt="Room" className="w-full h-full object-cover"/>
                                                        <button type="button" onClick={() => removeImage(i, true)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg text-[10px]"><FaTimesCircle/></button>
                                                    </div>
                                                ))}
                                                {/* New Previews */}
                                                {previewUrls.map((url, i) => (
                                                    <div key={`new-${i}`} className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-green-300 ring-1 ring-green-300">
                                                        <img src={url} alt="New" className="w-full h-full object-cover"/>
                                                        <button type="button" onClick={() => removeImage(i, false)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg text-[10px]"><FaTimesCircle/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Features (Comma Separated)</label>
                                            <textarea 
                                                className="w-full p-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 outline-none focus:border-teal-500 h-24 resize-none"
                                                value={formData.features}
                                                onChange={e => setFormData({...formData, features: e.target.value})}
                                                placeholder="e.g. Free Wifi, Sea View, Bathtub"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)} 
                                        className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 transition"
                                    >
                                        <FaCheckCircle/> Save Room
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomManagementPage;