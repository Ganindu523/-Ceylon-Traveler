import React, { useState } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
    Hotel as HotelIcon, MapPin, Plus, Trash2, Loader, Navigation, X, 
    Calendar, User, Minus, Plus as PlusIcon, CheckCircle, Info, 
    Users, BedDouble, Wifi, Wind, Coffee, Car, Sparkles, ChevronRight,
    Map, Award, ShieldCheck, Star
} from 'lucide-react';

import { DISTRICTS } from '../../data/districts';

const VEHICLE_TYPES = [
    { id: 'Tuk Tuk', label: 'Tuk Tuk', icon: '🛺', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'Car', label: 'Sedan', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
    { id: 'Van', label: 'Van', icon: '🚐', color: 'bg-indigo-100 text-indigo-700' },
    { id: 'SUV', label: 'SUV', icon: '🚙', color: 'bg-amber-100 text-amber-700' }
];

const DestinationStep = ({ tripData, setTripData, taxiRates }) => {
    const [hotels, setHotels] = useState([]);
    const [availableGuides, setAvailableGuides] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [roomsLoading, setRoomsLoading] = useState(false);
    const [selectedModalHotel, setSelectedModalHotel] = useState(null); 

    const calculateLegTransport = async (index, currentDest) => {
        let origin = "Bandaranaike International Airport"; 
        if (index > 0) {
            const prevLeg = tripData.destinations[index - 1];
            if (!prevLeg.hotelDetails) return; 
            origin = prevLeg.hotelDetails.address || `${prevLeg.district}, Sri Lanka`;
        }
        const destination = currentDest.hotelDetails?.address || `${currentDest.district}, Sri Lanka`;
        if (!currentDest.vehicleType) return;

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${API_URL}/api/planning/calculate-distance`, { origin, destination });
            if (res.data?.distanceKm) {
                const km = res.data.distanceKm;
                const rateData = taxiRates[currentDest.vehicleType];
                const rate = rateData?.rate || (typeof rateData === 'number' ? rateData : 0);
                
                setTripData(prev => {
                    const newDests = [...(prev.destinations || [])];
                    if (newDests[index]) {
                        newDests[index] = {
                            ...newDests[index],
                            distanceKm: km,
                            transportCost: km * rate
                        };
                    }
                    return { ...prev, destinations: newDests };
                });
            }
        } catch (err) { console.error("Distance Calc Error:", err); }
    };

    const updateLeg = async (index, field, value) => {
        const newDests = [...tripData.destinations];
        newDests[index][field] = value;

        if (field === 'checkIn' || field === 'checkOut') {
            const start = new Date(newDests[index].checkIn);
            const end = new Date(newDests[index].checkOut);
            if (start && end && end > start) {
                newDests[index].nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            }
        }

        if(field === 'district') {
            setLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const [hRes, gRes] = await Promise.all([
                    axios.get(`${API_URL}/api/planning/hotels?city=${value}`),
                    axios.get(`${API_URL}/api/planning/guides?district=${value}`)
                ]);
                setHotels(hRes.data);
                setAvailableGuides(gRes.data);

                newDests[index].hotelId = '';
                newDests[index].hotelDetails = null;
                newDests[index].selectedRooms = [];
                newDests[index].distanceKm = 0;
                newDests[index].transportCost = 0;
            } catch(err) { console.error(err); } finally { setLoading(false); }
        }

        if (field === 'vehicleType') {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                await calculateLegTransport(index, newDests[index]); 
            } catch(err) { console.error(err); } finally { setLoading(false); }
        }

        setTripData(prev => {
            const newDests = [...(prev.destinations || [])];
            if (newDests[index]) {
                newDests[index] = { ...newDests[index], [field]: value };
            }
            return { ...prev, destinations: newDests };
        });
    };

    const updateGuests = (index, type, op) => {
        const newDests = [...tripData.destinations];
        if (newDests[index][type] === undefined) newDests[index][type] = type === 'adults' ? 1 : 0;
        if (op === 'inc') newDests[index][type] += 1;
        if (op === 'dec') {
            if (type === 'adults' && newDests[index][type] > 1) newDests[index][type] -= 1;
            if (type === 'children' && newDests[index][type] > 0) newDests[index][type] -= 1;
        }
        setTripData({ ...tripData, destinations: newDests });
    };

    const openHotelRooms = async (hotel, index) => {
        if (!hotel) return;
        // Set the hotel details for this leg immediately when selected
        updateLeg(index, 'hotelId', hotel._id);
        updateLeg(index, 'hotelDetails', hotel);
        
        setSelectedModalHotel({ ...hotel, legIndex: index });
        setRoomsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/planning/hotels/${hotel._id}/rooms`);
            setRooms(res.data);
        } catch(err) { console.error(err); } finally { setRoomsLoading(false); }
    };

    const removeRoom = (index, roomIndex) => {
        setTripData(prev => {
            const newDests = [...(prev.destinations || [])];
            if (newDests[index]) {
                const updatedRooms = [...(newDests[index].selectedRooms || [])];
                updatedRooms.splice(roomIndex, 1);
                newDests[index] = { ...newDests[index], selectedRooms: updatedRooms };
            }
            return { ...prev, destinations: newDests };
        });
    };

    const handleAddRoom = async (room) => {
        const { legIndex, _id: hotelId } = selectedModalHotel;
        const newDests = [...tripData.destinations];
        const dest = newDests[legIndex];

        if (dest.hotelId && dest.hotelId !== hotelId) {
            if(!window.confirm("Switching hotels will remove previously selected rooms. Continue?")) return;
            dest.selectedRooms = [];
        }

        if (!dest.selectedRooms) dest.selectedRooms = [];
        dest.selectedRooms.push(room);

        if (dest.hotelId !== hotelId) {
            dest.hotelId = hotelId;
            dest.hotelDetails = selectedModalHotel;
            if(dest.needTransport) await calculateLegTransport(legIndex, dest);
        }

        setTripData({ ...tripData, destinations: newDests });
    };

    const selectGuide = (index, guide) => {
        setTripData(prev => {
            const newDests = [...(prev.destinations || [])];
            if (newDests[index]) {
                const isDeselect = newDests[index].selectedGuideId === guide._id;
                newDests[index] = {
                    ...newDests[index],
                    selectedGuideId: isDeselect ? null : guide._id,
                    selectedGuideDetails: isDeselect ? null : guide
                };
            }
            return { ...prev, destinations: newDests };
        });
    };

    const addDestination = () => {
        setTripData(prev => ({...prev, destinations: [...prev.destinations, { id: Date.now(), district: '', adults: 1, children: 0, selectedRooms: [] }] }));
    };

    const removeDestination = (index) => {
        if (tripData.destinations.length === 1) return;
        setTripData(prev => ({ ...prev, destinations: prev.destinations.filter((_, i) => i !== index) }));
    };

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
               <div>
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                     <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
                        <Map size={24} />
                     </div>
                     Itinerary Builder
                  </h3>
                  <p className="text-slate-500 font-medium mt-2">Map out your Sri Lankan escape leg by leg.</p>
               </div>
               <button onClick={addDestination} className="btn-secondary !px-4 !py-2 !rounded-xl !text-xs">
                  <Plus size={16} /> Add Destination
               </button>
            </header>
            
            <div className="space-y-10 relative">
                {tripData.destinations.map((dest, i) => (
                    <Motion.div 
                        key={dest.id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card rounded-[2.5rem] p-8 relative border-2 border-slate-100"
                    >
                        {/* Leg Indicator */}
                        <div className="absolute -left-4 top-8 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-xl">
                            {i + 1}
                        </div>

                        <div className="flex justify-between items-start mb-10 ml-10">
                           <div className="space-y-1">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Current Leg</span>
                              <h4 className="text-2xl font-black text-slate-800">{dest.district || 'Unplanned Destination'}</h4>
                           </div>
                           {i > 0 && (
                              <button onClick={() => removeDestination(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                 <Trash2 size={20} />
                              </button>
                           )}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 ml-4 lg:ml-10">
                            {/* Left Side: Core Selection */}
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination District</label>
                                    <select 
                                        value={dest.district || ''} 
                                        onChange={(e) => updateLeg(i, 'district', e.target.value)} 
                                        className="input-field !py-4 font-black"
                                    >
                                        <option value="">-- Select Your Destination --</option>
                                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival at Destination</label>
                                      <input type="date" value={dest.checkIn || ''} onChange={(e) => updateLeg(i, 'checkIn', e.target.value)} className="input-field !text-xs" />
                                   </div>
                                   <div className="space-y-4">
                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Departure</label>
                                      <input type="date" value={dest.checkOut || ''} onChange={(e) => updateLeg(i, 'checkOut', e.target.value)} className="input-field !text-xs" />
                                   </div>
                                </div>

                                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                                   <div className="flex items-center gap-4">
                                      <div className="bg-white p-3 rounded-2xl shadow-sm text-slate-600">
                                         <Users size={20} />
                                      </div>
                                      <div>
                                         <span className="text-xs font-black text-slate-900 uppercase">Traveling Party</span>
                                         <p className="text-[10px] text-slate-400 font-bold">{dest.adults || 1} Adults, {dest.children || 0} Kids</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                         <button onClick={() => updateGuests(i, 'adults', 'dec')} className="px-3 py-2 hover:bg-slate-50 transition-colors border-r"><Minus size={14}/></button>
                                         <span className="px-4 font-black text-sm">{dest.adults || 1}</span>
                                         <button onClick={() => updateGuests(i, 'adults', 'inc')} className="px-3 py-2 hover:bg-slate-50 transition-colors border-l"><PlusIcon size={14}/></button>
                                      </div>
                                   </div>
                                </div>
                            </div>

                            {/* Right Side: Services & Logistics */}
                            <div className="space-y-8">
                               {/* Transport Toggle */}
                               <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                                   dest.needTransport ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/30 border-slate-100'
                               }`}>
                                   <label className="flex items-center gap-4 cursor-pointer">
                                       <div className="relative">
                                           <input type="checkbox" checked={dest.needTransport || false} onChange={(e) => updateLeg(i, 'needTransport', e.target.checked)} className="hidden" />
                                           <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                               dest.needTransport ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-200'
                                           }`}>
                                              {dest.needTransport && <CheckCircle size={18} className="text-white" />}
                                           </div>
                                       </div>
                                       <div>
                                           <span className="font-black text-slate-800">Private Chauffeur</span>
                                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Transport to {dest.district || 'Dest.'}</p>
                                       </div>
                                   </label>

                                   <AnimatePresence>
                                       {dest.needTransport && (
                                           <Motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-8 pt-8 border-t border-blue-100 space-y-6">
                                               <div className="grid grid-cols-4 gap-2">
                                                   {VEHICLE_TYPES.map(v => (
                                                       <button 
                                                           key={v.id}
                                                           onClick={() => updateLeg(i, 'vehicleType', v.id)}
                                                           className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                                                               dest.vehicleType === v.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-white hover:border-blue-200'
                                                           }`}
                                                       >
                                                           <span className="text-xl">{v.icon}</span>
                                                           <span className="text-[8px] font-black uppercase tracking-tighter">{v.label}</span>
                                                       </button>
                                                   ))}
                                               </div>

                                               {dest.vehicleType && (
                                                   <div className="flex justify-between items-center bg-white/80 p-4 rounded-2xl border border-blue-50 shadow-sm">
                                                       <div>
                                                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{dest.distanceKm ? `${dest.distanceKm} KM` : 'Calculating...'}</span>
                                                           <p className="text-[9px] text-slate-400 font-bold uppercase">{i === 0 ? "BIA Terminal" : "Prev. Location"} <ChevronRight size={8} className="inline"/> {dest.district}</p>
                                                       </div>
                                                       <div className="text-right">
                                                           <span className="text-xl font-black text-slate-900">LKR {dest.transportCost?.toLocaleString()}</span>
                                                       </div>
                                                   </div>
                                               )}
                                           </Motion.div>
                                       )}
                                   </AnimatePresence>
                               </div>

                               {/* Hotel Selection */}
                               <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                                   dest.hotelId ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/30 border-slate-100'
                               }`}>
                                  <header className="flex justify-between items-center mb-6">
                                     <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${dest.hotelId ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                           <HotelIcon size={20} />
                                        </div>
                                        <div>
                                           <span className="font-black text-slate-800">Accommodation</span>
                                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                              {dest.hotelId ? (dest.selectedRooms?.length || 0) + ' Rooms Selected' : 'No Hotel Selected'}
                                           </p>
                                        </div>
                                     </div>
                                      {dest.hotelId && (
                                          <button 
                                             onClick={() => openHotelRooms(dest.hotelDetails, i)}
                                             className="btn-secondary !p-2 !rounded-xl !bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 transition-all"
                                             title="Add more rooms"
                                          >
                                             <Plus size={16} />
                                          </button>
                                      )}
                                  </header>

                                   {dest.hotelDetails && (
                                      <div className="space-y-4">
                                         <div className="bg-white p-4 rounded-2xl border border-emerald-50 shadow-sm flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                               <img src={dest.hotelDetails.photos?.[0] || 'https://placehold.co/100'} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                               <div>
                                                  <p className="text-xs font-black text-slate-800">{dest.hotelDetails.name}</p>
                                                  <p className="text-[10px] text-slate-400 font-bold uppercase">{dest.hotelDetails.city}</p>
                                               </div>
                                            </div>
                                            <button 
                                               onClick={() => updateLeg(i, 'hotelId', '')}
                                               className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
                                            >
                                               <Trash2 size={14} />
                                            </button>
                                         </div>

                                         {/* Selected Rooms List */}
                                         <div className="space-y-2">
                                            {dest.selectedRooms?.map((room, ridx) => (
                                               <Motion.div 
                                                  key={ridx}
                                                  initial={{ opacity: 0, y: -10 }}
                                                  animate={{ opacity: 1, y: 0 }}
                                                  className="bg-white/50 p-3 rounded-xl border border-emerald-50 flex items-center justify-between"
                                               >
                                                  <div className="flex items-center gap-3">
                                                     <BedDouble size={14} className="text-emerald-600" />
                                                     <span className="text-[11px] font-bold text-slate-700">{room.type}</span>
                                                  </div>
                                                  <div className="flex items-center gap-4">
                                                     <span className="text-[11px] font-black text-slate-900">${room.price}</span>
                                                     <button 
                                                        onClick={() => removeRoom(i, ridx)}
                                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                     >
                                                        <X size={12} />
                                                     </button>
                                                  </div>
                                               </Motion.div>
                                            ))}
                                         </div>
                                      </div>
                                   )}
                               </div>

                               {/* Guide Toggle */}
                               <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${
                                   dest.needGuide ? 'bg-amber-50/50 border-amber-100' : 'bg-slate-50/30 border-slate-100'
                               }`}>
                                  <label className="flex items-center gap-4 cursor-pointer">
                                       <div className="relative">
                                           <input type="checkbox" checked={dest.needGuide || false} onChange={(e) => updateLeg(i, 'needGuide', e.target.checked)} className="hidden" />
                                           <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                                               dest.needGuide ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-200' : 'bg-white border-slate-200'
                                           }`}>
                                              {dest.needGuide && <CheckCircle size={18} className="text-white" />}
                                           </div>
                                       </div>
                                       <div>
                                           <span className="font-black text-slate-800">Local Guide</span>
                                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expertise in {dest.district || 'Locale'}</p>
                                       </div>
                                   </label>

                                   <AnimatePresence>
                                       {dest.needGuide && (
                                           <Motion.div 
                                               initial={{ height: 0, opacity: 0 }}
                                               animate={{ height: 'auto', opacity: 1 }}
                                               exit={{ height: 0, opacity: 0 }}
                                               className="mt-8 pt-8 border-t border-amber-100 space-y-6"
                                           >
                                               {loading ? (
                                                   <div className="flex items-center gap-3 text-amber-600 font-bold text-xs">
                                                       <Loader className="animate-spin" size={16} />
                                                       <span>Locating local experts...</span>
                                                   </div>
                                               ) : availableGuides.length > 0 ? (
                                                   <div className="grid grid-cols-1 gap-4">
                                                       {availableGuides.map(g => (
                                                           <button 
                                                               key={g._id}
                                                               onClick={() => selectGuide(i, g)}
                                                               type="button"
                                                               className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                                                                   dest.selectedGuideId === g._id ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-50 hover:border-amber-200'
                                                               }`}
                                                           >
                                                               <img src={g.profileImage || 'https://placehold.co/100'} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={g.name} />
                                                               <div className="flex-1 min-w-0">
                                                                   <p className={`font-black text-xs truncate ${dest.selectedGuideId === g._id ? 'text-white' : 'text-slate-900'}`}>{g.name}</p>
                                                                   <div className="flex gap-2 mt-1">
                                                                       {g.languages?.slice(0, 2).map((l, idx) => (
                                                                           <span key={idx} className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${dest.selectedGuideId === g._id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{l}</span>
                                                                       ))}
                                                                   </div>
                                                               </div>
                                                               <div className="text-right">
                                                                   <p className={`text-[10px] font-black ${dest.selectedGuideId === g._id ? 'text-white' : 'text-amber-600'}`}>LKR {g.pricePerDay || 5000}/Day</p>
                                                               </div>
                                                           </button>
                                                       ))}
                                                   </div>
                                               ) : (
                                                   <p className="text-[10px] text-slate-400 italic font-bold">No registered guides found in this district.</p>
                                               )}
                                           </Motion.div>
                                       )}
                                   </AnimatePresence>
                               </div>
                            </div>
                        </div>

                        {/* Collapsible Hotel List if district selected but no hotel yet */}
                        <AnimatePresence>
                           {dest.district && !dest.hotelId && (
                              <Motion.div 
                                 initial={{ opacity: 0, height: 0 }} 
                                 animate={{ opacity: 1, height: 'auto' }} 
                                 exit={{ opacity: 0, height: 0 }}
                                 className="mt-12 ml-4 lg:ml-10 pt-10 border-t border-slate-50 overflow-hidden"
                              >
                                 <div className="flex items-center justify-between mb-6">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Available Stays in {dest.district}</p>
                                    <span className="text-[10px] text-emerald-600 font-bold italic">Select a hotel to view rooms</span>
                                 </div>
                                 {loading ? (
                                    <div className="flex items-center gap-3 py-4 text-emerald-600 font-bold">
                                       <Loader className="animate-spin" size={20} />
                                       <span>Fetching hotels...</span>
                                    </div>
                                 ) : hotels.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                       {hotels.map(h => (
                                          <button 
                                             key={h._id} 
                                             onClick={() => openHotelRooms(h, i)}
                                             className="group p-4 rounded-3xl bg-slate-50/50 border-2 border-transparent hover:border-emerald-500 hover:bg-white hover:shadow-xl transition-all text-left flex items-center gap-4"
                                          >
                                             <img src={h.photos?.[0] || 'https://placehold.co/100'} className="w-16 h-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt={h.name} />
                                             <div>
                                                <h5 className="font-black text-sm text-slate-900 group-hover:text-emerald-700">{h.name}</h5>
                                                <div className="flex items-center gap-1 text-amber-500 mt-1">
                                                   <Star size={10} fill="currentColor" />
                                                   <span className="text-[10px] font-black">{h.stars || 4.5}</span>
                                                </div>
                                             </div>
                                          </button>
                                       ))}
                                    </div>
                                 ) : (
                                    <p className="text-slate-400 font-bold italic text-sm">No certified hotels found in this area yet.</p>
                                 )}
                              </Motion.div>
                           )}
                        </AnimatePresence>
                    </Motion.div>
                ))}
            </div>

            {/* Modals Overhaul */}
            <AnimatePresence>
            {selectedModalHotel && (
                <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-6 backdrop-blur-md">
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative"
                    >
                        <button onClick={() => setSelectedModalHotel(null)} className="absolute top-8 right-8 z-20 bg-slate-100 p-3 rounded-2xl hover:bg-slate-200 text-slate-600 transition-all">
                           <X size={20} />
                        </button>

                        <div className="flex flex-col md:flex-row h-full">
                           {/* Hotel Sidebar */}
                           <div className="w-full md:w-1/3 bg-slate-50 p-10 flex flex-col justify-between">
                              <div>
                                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Selected Property</p>
                                 <h3 className="text-3xl font-black text-slate-900 leading-tight mb-4">{selectedModalHotel.name}</h3>
                                 <div className="flex items-center gap-2 text-slate-500 mb-8">
                                    <MapPin size={16} />
                                    <span className="text-xs font-bold">{selectedModalHotel.address}</span>
                                 </div>

                                 <div className="space-y-4">
                                    {[
                                       { icon: <Wifi size={14}/>, text: 'Free High-Speed Wifi' },
                                       { icon: <Wind size={14}/>, text: 'Central AC Control' },
                                       { icon: <Coffee size={14}/>, text: 'Complimentary Breakfast' }
                                    ].map((item, idx) => (
                                       <div key={idx} className="flex items-center gap-3 text-slate-600">
                                          <div className="p-2 bg-white rounded-lg shadow-sm">{item.icon}</div>
                                          <span className="text-[10px] font-black uppercase tracking-wider">{item.text}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-8 border-t border-slate-200">
                                 <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                    <Award size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Certified Luxury Partner</span>
                                 </div>
                              </div>
                           </div>

                           {/* Rooms Content */}
                           <div className="flex-1 p-10 overflow-y-auto no-scrollbar">
                              <h4 className="text-xl font-black text-slate-800 mb-8">Available Accommodations</h4>
                              {roomsLoading ? (
                                 <div className="flex flex-col items-center justify-center py-20 text-emerald-600">
                                    <Loader className="animate-spin mb-4" size={32} />
                                    <p className="font-black text-sm uppercase tracking-widest">Syncing inventory...</p>
                                 </div>
                              ) : rooms.length > 0 ? (
                                 <div className="grid grid-cols-1 gap-6">
                                    {rooms.map(r => (
                                       <div key={r._id} className="group flex flex-col sm:flex-row gap-6 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-emerald-500 hover:shadow-xl transition-all">
                                          <div className="w-full sm:w-40 h-40 rounded-2xl overflow-hidden shadow-inner">
                                             <img src={r.photos?.[0] || 'https://placehold.co/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                          </div>
                                          <div className="flex-1 flex flex-col justify-between py-1">
                                             <div>
                                                <div className="flex justify-between items-start mb-2">
                                                   <h5 className="text-lg font-black text-slate-900">{r.type} Room</h5>
                                                   <span className="text-xl font-black text-emerald-600">${r.price}</span>
                                                </div>
                                                <div className="flex gap-2 flex-wrap mb-4">
                                                   {r.features?.slice(0, 3).map((f, idx) => (
                                                      <span key={idx} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">{f}</span>
                                                   ))}
                                                </div>
                                             </div>
                                             <button 
                                                onClick={() => handleAddRoom(r)}
                                                className="btn-primary !py-2 !text-[10px] !rounded-xl !w-fit group-hover:shadow-emerald-200"
                                             >
                                                Book Room <ChevronRight size={12} className="ml-1" />
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              ) : (
                                 <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold italic">No rooms currently published for this property.</p>
                                 </div>
                              )}
                           </div>
                        </div>
                    </Motion.div>
                </div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default DestinationStep;