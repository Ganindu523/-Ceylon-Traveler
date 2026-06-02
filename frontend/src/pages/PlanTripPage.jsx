import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Loader, Plane, MapPin, ClipboardList, Sparkles } from 'lucide-react';
import ArrivalStep from '../components/planning/ArrivalStep';
import DestinationStep from '../components/planning/DestinationStep';
import SummaryStep from '../components/planning/SummaryStep';

const PlanTripPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    const [taxiRates, setTaxiRates] = useState({});
    const [usdToLkrRate, setUsdToLkrRate] = useState(325);

    const [tripData, setTripData] = useState(() => {
        if (location.state && location.state.trip) return location.state.trip;
        return {
            arrivalDate: '', arrivalTime: '', flightNumber: '',
            needAirportTransfer: false, transferVehicle: '', selectedDriverId: null,
            destinations: [{ 
                id: Date.now(), district: '', hotelId: '', hotelDetails: null, 
                roomId: '', roomDetails: null, checkIn: '', checkOut: '', 
                needGuide: false, selectedGuideId: null, selectedGuideDetails: null,
                distanceKm: 0, transportCost: 0, nights: 0, selectedRooms: []
            }],
            totalPriceLKR: 0
        };
    });

    const isEditing = !!(location.state && location.state.trip);

    useEffect(() => {
        const calculateTotal = () => {
            const totalTaxiLKR = tripData.destinations.reduce((acc, curr) => acc + (Number(curr.transportCost) || 0), 0);
            const totalHotelUSD = tripData.destinations.reduce((acc, dest) => {
                if (dest.selectedRooms?.length > 0) {
                    const nightlyCost = dest.selectedRooms.reduce((sum, room) => sum + (Number(room.price) || 0), 0);
                    return acc + (nightlyCost * (Number(dest.nights) || 1));
                }
                return acc;
            }, 0);
            const totalGuideUSD = tripData.destinations.reduce((acc, curr) => {
                if (curr.selectedGuideDetails) return acc + ((Number(curr.selectedGuideDetails.pricePerDay) || 0) * (Number(curr.nights) || 1));
                return acc;
            }, 0);

            const grandTotal = totalTaxiLKR + (totalHotelUSD * usdToLkrRate) + (totalGuideUSD * usdToLkrRate);
            if (Math.round(grandTotal) !== tripData.totalPriceLKR) {
                setTripData(prev => ({ ...prev, totalPriceLKR: Math.round(grandTotal) }));
            }
        };
        calculateTotal();
    }, [tripData.destinations, usdToLkrRate]); // Removed totalPriceLKR to avoid potential update loops

    useEffect(() => {
        const initData = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const taxiRes = await axios.get(`${API_URL}/api/planning/taxi-rates`);
                setTaxiRates(taxiRes.data || {});
                
                const apiKey = import.meta.env.VITE_EXCHANGERATE_API_KEY;
                if (apiKey) {
                    const rateRes = await axios.get(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
                    if(rateRes.data.conversion_rates.LKR) setUsdToLkrRate(rateRes.data.conversion_rates.LKR);
                }
            } catch (err) { console.error("Init Data Error:", err); }
        };
        initData();
    }, []);

    const handleSubmitTrip = async () => {
        setLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const totalTaxiLKR = tripData.destinations.reduce((acc, curr) => acc + (Number(curr.transportCost) || 0), 0);
            const totalHotelUSD = tripData.destinations.reduce((acc, dest) => {
                if (dest.selectedRooms?.length > 0) {
                    const nightlyCost = dest.selectedRooms.reduce((sum, room) => sum + (Number(room.price) || 0), 0);
                    return acc + (nightlyCost * (Number(dest.nights) || 1));
                }
                return acc;
            }, 0);
            const totalGuideUSD = tripData.destinations.reduce((acc, curr) => {
                if (curr.selectedGuideDetails) return acc + ((Number(curr.selectedGuideDetails.pricePerDay) || 0) * (Number(curr.nights) || 1));
                return acc;
            }, 0);

            const grandTotal = totalTaxiLKR + (totalHotelUSD * usdToLkrRate) + (totalGuideUSD * usdToLkrRate);
            const payload = { ...tripData, totalPriceLKR: Math.round(grandTotal) };

            if (isEditing) {
                await axios.put(`${API_URL}/api/bookings/${tripData._id}`, payload, { headers: { 'x-auth-token': localStorage.getItem('token') } });
                alert("Trip Updated Successfully!"); 
            } else {
                await axios.post(`${API_URL}/api/trips`, payload, { headers: { 'x-auth-token': localStorage.getItem('token') } });
                alert("Trip Saved Successfully!"); 
            }
            navigate('/my-bookings');
        } catch (err) { 
            alert(err.response?.data?.msg || "Save Failed. Please check your connection."); 
        } finally { setLoading(false); }
    };

    const steps = [
        { id: 1, name: 'Arrival', icon: <Plane size={20} /> },
        { id: 2, name: 'Destinations', icon: <MapPin size={20} /> },
        { id: 3, name: 'Review', icon: <ClipboardList size={20} /> }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-24 px-6 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-emerald-50 rounded-bl-full -z-10"></div>
            
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-16">
                    <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">
                            {isEditing ? "Refine Your Journey" : "Design Your Escape"}
                        </h1>
                        <p className="text-slate-500 font-luxury italic text-xl">Crafting the perfect Sri Lankan adventure, just for you.</p>
                    </Motion.div>
                </header>
                
                {/* Modern Stepper */}
                <div className="flex justify-center items-center mb-16 gap-4 md:gap-12 relative">
                   <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-10 rounded-full"></div>
                   {steps.map((s) => (
                      <div key={s.id} className="flex flex-col items-center group relative">
                         <Motion.div 
                            animate={{ 
                                scale: step === s.id ? 1.1 : 1,
                                backgroundColor: step >= s.id ? '#059669' : '#fff'
                            }}
                            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border-4 transition-colors z-10 ${
                                step >= s.id ? 'border-emerald-100 text-white' : 'border-slate-50 text-slate-400'
                            }`}
                         >
                            {step > s.id ? <CheckCircle size={24} /> : s.icon}
                         </Motion.div>
                         <span className={`absolute -bottom-8 font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-colors ${
                             step >= s.id ? 'text-emerald-700' : 'text-slate-400'
                         }`}>
                             {s.name}
                         </span>
                      </div>
                   ))}
                </div>

                <Motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card rounded-[3rem] p-10 md:p-12 min-h-[600px] relative"
                >
                    <AnimatePresence mode="wait">
                        <Motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {step === 1 && (
                                <ArrivalStep 
                                    tripData={tripData} 
                                    setTripData={setTripData} 
                                    taxiRates={taxiRates} 
                                />
                            )}
                            {step === 2 && (
                                <DestinationStep 
                                    tripData={tripData} 
                                    setTripData={setTripData} 
                                    usdToLkrRate={usdToLkrRate}
                                    taxiRates={taxiRates} 
                                />
                            )}
                            {step === 3 && (
                                <SummaryStep 
                                    tripData={tripData} 
                                    usdToLkrRate={usdToLkrRate} 
                                />
                            )}
                        </Motion.div>
                    </AnimatePresence>
                </Motion.div>

                {/* Navigation Controls */}
                <div className="flex justify-between mt-12 items-center">
                    <button 
                        onClick={() => setStep(s => s - 1)} 
                        disabled={step === 1} 
                        className="btn-secondary !px-6 !py-3 disabled:opacity-0"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Cost</span>
                            <span className="text-emerald-600 font-black text-lg">LKR {Math.round(tripData.totalPriceLKR || 0).toLocaleString()}</span>
                        </div>
                        {step < 3 ? 
                            <button 
                                onClick={() => setStep(s => s + 1)} 
                                className="btn-primary !px-10 !py-4 shadow-emerald-200"
                            >
                                Continue <ArrowRight size={18} />
                            </button> : 
                            <button 
                                onClick={handleSubmitTrip} 
                                disabled={loading} 
                                className="btn-primary !bg-slate-900 !px-10 !py-4 shadow-slate-200"
                            >
                                {loading ? <Loader className="animate-spin" /> : <Sparkles size={18} />} 
                                {isEditing ? "Update Itinerary" : "Finalize Trip"}
                            </button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanTripPage;