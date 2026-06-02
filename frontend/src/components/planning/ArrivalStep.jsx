import React, { useState } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Plane, Car, Loader, Calendar, Clock, Hash, CheckCircle2, ArrowRight } from 'lucide-react';

const VEHICLE_CATEGORIES = [
    { value: 'Tuk Tuk', label: 'Tuk Tuk', sub: '3-Wheeler' },
    { value: 'Nano', label: 'Mini Car', sub: 'Budget Hatch' },
    { value: 'Car', label: 'Sedan', sub: 'Comfort Travel' },
    { value: 'Van', label: 'Van', sub: 'Group Travel' },
];

const ArrivalStep = ({ tripData, setTripData, taxiRates }) => {
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [loading, setLoading] = useState(false);

    const getRate = (type) => {
        const data = taxiRates[type];
        return data?.rate || (typeof data === 'number' ? data : 0);
    };

    const handleVehicleSelect = async (vehicle) => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${API_URL}/api/planning/taxis?vehicleType=${vehicle}`);
            setAvailableDrivers(Array.isArray(res.data) ? res.data : []);
            
            setTripData(prev => {
                const updatedDests = [...(prev.destinations || [])];
                if (updatedDests.length > 0) {
                    const rate = getRate(vehicle);
                    updatedDests[0] = {
                        ...updatedDests[0],
                        transportCost: (updatedDests[0].distanceKm || 0) * rate
                    };
                }
                return { 
                    ...prev, 
                    transferVehicle: vehicle,
                    destinations: updatedDests 
                };
            });
        } catch (err) { 
            console.error("Error fetching drivers:", err); 
        } finally { setLoading(false); }
    };

    return (
        <div className="space-y-12">
            <header>
               <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-600">
                     <Plane size={24} />
                  </div>
                  Arrival Details
               </h3>
               <p className="text-slate-500 font-medium mt-2">When and how will you reach Sri Lanka?</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Date</label>
                    <div className="relative">
                       <Calendar size={18} className="absolute left-4 top-4 text-slate-400" />
                       <input 
                           type="date" 
                           value={tripData.arrivalDate} 
                           onChange={(e) => setTripData(prev => ({...prev, arrivalDate: e.target.value}))} 
                           className="input-field pl-12" 
                       />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Arrival Time</label>
                    <div className="relative">
                       <Clock size={18} className="absolute left-4 top-4 text-slate-400" />
                       <input 
                           type="time" 
                           value={tripData.arrivalTime} 
                           onChange={(e) => setTripData(prev => ({...prev, arrivalTime: e.target.value}))} 
                           className="input-field pl-12" 
                       />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flight Number</label>
                    <div className="relative">
                       <Hash size={18} className="absolute left-4 top-4 text-slate-400" />
                       <input 
                           type="text" 
                           placeholder="UL 101" 
                           value={tripData.flightNumber} 
                           onChange={(e) => setTripData(prev => ({...prev, flightNumber: e.target.value}))} 
                           className="input-field pl-12" 
                       />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ArrivalStep;