import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    CreditCard, Calendar, MapPin, User, Hotel, Car, 
    XCircle, CheckCircle, Edit3, ShieldCheck, Loader, AlertTriangle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
    const navigate = useNavigate();
    
    // Data State
    const [bookings, setBookings] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All'); // Filter State
    
    // UI State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // --- 1. Fetch History ---
    const fetchBookings = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/bookings`, {
                headers: { 'x-auth-token': token }
            });
            setBookings(res.data);
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    // --- 2. Filter Logic ---
    const filteredBookings = bookings.filter(trip => {
        if (filterStatus === 'All') return true;
        return trip.status === filterStatus;
    });

    // --- 3. Handlers ---
    const handleCancelTrip = async () => {
        if(!window.confirm("Are you sure you want to cancel this trip?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/bookings/${selectedTrip._id}/cancel`, {}, {
                headers: { 'x-auth-token': token }
            });
            alert("Trip Cancelled.");
            fetchBookings(); 
            setSelectedTrip(null); // Deselect
        } catch (err) { 
            // ✅ FIX: Log error to satisfy ESLint
            console.error("Cancel Error:", err); 
            alert("Cancellation failed"); 
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/api/bookings/${selectedTrip._id}/confirm`, {
                    cardName: paymentForm.cardName,
                    last4Digits: paymentForm.cardNumber.slice(-4)
                }, { headers: { 'x-auth-token': token } });

                setShowPaymentModal(false);
                setProcessingPayment(false);
                fetchBookings(); 
                alert("Payment Successful!");
                setSelectedTrip(null);
            } catch (err) {
                // ✅ FIX: Log error to satisfy ESLint
                console.error("Payment Error:", err);
                setProcessingPayment(false);
                alert("Payment Failed.");
            }
        }, 1500);
    };

    // --- 4. Cost Calculation ---
    const calculateCosts = (trip) => {
        if (!trip) return { items: [], grandTotalLKR: 0, grandTotalUSD: 0 };
        let items = [], grandTotalLKR = 0, grandTotalUSD = 0;

        // Taxis
        const taxiCost = trip.destinations.reduce((acc, d) => acc + (Number(d.transportCost) || 0), 0);
        if (taxiCost > 0) {
            items.push({ label: 'Total Transport (Taxis)', priceLKR: taxiCost });
            grandTotalLKR += taxiCost;
            grandTotalUSD += (taxiCost / USD_LKR);
        }

        // Hotels
        trip.destinations.forEach((d) => {
            if (d.selectedRooms && d.selectedRooms.length > 0) {
                const roomPriceUSD = d.selectedRooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
                const legTotalUSD = roomPriceUSD * (Number(d.nights) || 1);
                items.push({ label: `Hotel: ${d.hotelDetails?.name || d.district}`, subLabel: `${d.nights} Nights`, priceUSD: legTotalUSD });
                grandTotalUSD += legTotalUSD;
                grandTotalLKR += (legTotalUSD * USD_LKR);
            }
        });

        // Guides
        trip.destinations.forEach((d, i) => {
            if (d.selectedGuideDetails) {
                const guideTotalUSD = (Number(d.selectedGuideDetails.pricePerDay) || 0) * (Number(d.nights) || 1);
                items.push({ label: `Guide: ${d.selectedGuideDetails.name}`, subLabel: `Leg ${i+1}`, priceUSD: guideTotalUSD });
                grandTotalUSD += guideTotalUSD;
                grandTotalLKR += (guideTotalUSD * USD_LKR);
            }
        });

        return { items, grandTotalLKR, grandTotalUSD };
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-teal-600"/></div>;

    const { items, grandTotalLKR, grandTotalUSD } = calculateCosts(selectedTrip);

    // Helper Component for Tabs
    const TabButton = ({ label }) => (
        <button 
            onClick={() => setFilterStatus(label)}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                filterStatus === label ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* --- LEFT: HISTORY & FILTERS --- */}
                <div className="lg:col-span-1 h-[85vh] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 mb-3"><Clock size={20} className="text-teal-600"/> History</h2>
                        <div className="flex flex-wrap gap-2">
                            <TabButton label="All" />
                            <TabButton label="Pending" />
                            <TabButton label="Confirmed" />
                            <TabButton label="Cancelled" />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3">
                        {filteredBookings.length === 0 && (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400">No {filterStatus.toLowerCase()} bookings found.</p>
                                {filterStatus === 'All' && <button onClick={() => navigate('/plan-trip')} className="mt-2 text-xs font-bold text-teal-600 hover:underline">Plan a Trip</button>}
                            </div>
                        )}
                        
                        {filteredBookings.map(b => (
                            <div 
                                key={b._id} 
                                onClick={() => setSelectedTrip(b)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${
                                    selectedTrip?._id === b._id ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500' : 'bg-white border-gray-100 hover:border-teal-300'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-xs text-gray-500">#{b._id.slice(-6).toUpperCase()}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        b.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                        b.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>{b.status}</span>
                                </div>
                                <div className="font-bold text-sm text-gray-800 mb-1">{b.destinations.length} Stop(s) • {b.destinations[0]?.district}</div>
                                <div className="text-xs opacity-60 flex items-center gap-1"><Calendar size={12}/> {new Date(b.createdAt).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT: TRIP DETAILS --- */}
                <div className="lg:col-span-3">
                    {selectedTrip ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {/* Trip Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-800">Trip Details</h1>
                                    <p className="text-gray-500 text-sm mt-1">ID: <span className="font-mono text-teal-600">#{selectedTrip._id}</span></p>
                                </div>
                                <div className="flex gap-3 mt-4 md:mt-0">
                                    {selectedTrip.status === 'Pending' && (
                                        <>
                                            <button onClick={handleCancelTrip} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl text-sm hover:bg-red-50 transition">Cancel</button>
                                            <button onClick={() => navigate('/plan-trip', { state: { trip: selectedTrip } })} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-200 transition flex items-center gap-2 border border-gray-200"><Edit3 size={14}/> Edit Plan</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Itinerary & Payment */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <div className="xl:col-span-2 space-y-6">
                                    {selectedTrip.destinations.map((dest, i) => (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500"></div>
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><MapPin className="text-teal-500" size={20}/> {dest.district}</h3>
                                                <p className="text-xs text-gray-400 font-bold uppercase bg-gray-100 px-2 py-1 rounded">Leg {i+1}</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {/* Details Cards */}
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stay</p>
                                                    <div className="flex items-center gap-2"><Hotel size={16} className="text-teal-600"/><p className="font-bold text-sm text-gray-800 truncate">{dest.hotelDetails?.name || 'None'}</p></div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Ride</p>
                                                    <div className="flex items-center gap-2"><Car size={16} className="text-blue-600"/><p className="font-bold text-sm text-gray-800">{dest.transportCost ? 'Taxi' : 'None'}</p></div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Guide</p>
                                                    <div className="flex items-center gap-2"><User size={16} className="text-orange-600"/><p className="font-bold text-sm text-gray-800 truncate">{dest.selectedGuideDetails?.name || 'None'}</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Summary Panel */}
                                <div className="xl:col-span-1">
                                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-6">
                                        <h2 className="text-xl font-black text-gray-800 mb-6">Payment Summary</h2>
                                        <div className="space-y-3 mb-6">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-gray-100 pb-2">
                                                    <div><p className="font-medium text-gray-700">{item.label}</p>{item.subLabel && <p className="text-[10px] text-gray-400">{item.subLabel}</p>}</div>
                                                    <div className="text-right">
                                                        {item.priceUSD ? (
                                                            <>
                                                                <p className="font-bold text-gray-800">${(item.priceUSD || 0).toLocaleString()}</p>
                                                                <p className="text-[10px] text-gray-400">≈ LKR {((item.priceUSD || 0) * (USD_LKR || 325)).toLocaleString()}</p>
                                                            </>
                                                        ) : (
                                                            <p className="font-bold text-gray-800">LKR {(item.priceLKR || 0).toLocaleString()}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-5 mb-6 text-white shadow-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Total (LKR)</p>
                                                <p className="text-2xl font-black">LKR {(grandTotalLKR || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="w-full h-px bg-gray-700 my-2"></div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-xs text-gray-400 uppercase font-bold">Total (USD)</p>
                                                <p className="text-lg font-bold text-teal-400">${(grandTotalUSD || 0).toLocaleString(undefined, {maximumFractionDigits:2})}</p>
                                            </div>
                                        </div>
                                        
                                        {selectedTrip.status === 'Pending' ? (
                                            <button onClick={() => setShowPaymentModal(true)} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 transition shadow-lg shadow-teal-200"><CreditCard size={18}/> Pay & Confirm</button>
                                        ) : selectedTrip.status === 'Confirmed' ? (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"><CheckCircle className="mx-auto text-green-600 mb-2" size={32}/><p className="font-bold text-green-800">Paid & Confirmed</p></div>
                                        ) : (
                                            <div className="bg-gray-100 rounded-xl p-4 text-center text-gray-500 font-bold">Booking Cancelled</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 min-h-[400px] border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
                            <MapPin size={64} className="mb-4 text-gray-300"/>
                            <p className="text-lg font-bold text-gray-500">Select a trip to view details</p>
                            <p className="text-sm text-gray-400">Choose from your history on the left.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-teal-400"/> Secure Payment</h3>
                            <button onClick={() => setShowPaymentModal(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><XCircle size={20}/></button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-8 space-y-5">
                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Card Number</label><input required type="text" placeholder="0000 0000 0000 0000" maxLength="19" value={paymentForm.cardNumber} onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 font-mono text-gray-700 outline-none"/></div>
                            <div className="grid grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Expiry</label><input required type="text" placeholder="MM/YY" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none"/></div><div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">CVV</label><input required type="password" placeholder="123" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none"/></div></div>
                            <div><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Name</label><input required type="text" placeholder="Cardholder Name" value={paymentForm.cardName} onChange={(e) => setPaymentForm({...paymentForm, cardName: e.target.value})} className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none"/></div>
                            <button type="submit" disabled={processingPayment} className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-lg hover:bg-teal-700 disabled:opacity-70 flex justify-center items-center gap-2">{processingPayment ? <Loader className="animate-spin"/> : `Pay LKR ${grandTotalLKR.toLocaleString()}`}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;