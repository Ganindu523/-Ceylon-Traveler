import React from 'react';
import { motion as Motion } from 'framer-motion';
import { 
    Hotel, Car, MapPin, User, DollarSign, Calendar, CheckCircle, Calculator, 
    BedDouble, ChevronRight, ArrowRight, Wallet, ShieldCheck, Sparkles,
    Plane, Clock
} from 'lucide-react';

const SummaryStep = ({ tripData, usdToLkrRate }) => {
    const totalTaxiLKR = (tripData.destinations || []).reduce((acc, curr) => acc + (curr.transportCost || 0), 0);
    const totalHotelUSD = (tripData.destinations || []).reduce((acc, curr) => {
        const roomTotal = (curr.selectedRooms || []).reduce((sum, r) => sum + (Number(r.price) || 0), 0);
        return acc + (roomTotal * (Number(curr.nights) || 1));
    }, 0);
    const totalGuideLKR = (tripData.destinations || []).reduce((acc, curr) => {
        if (curr.selectedGuideDetails) {
            return acc + ((Number(curr.selectedGuideDetails.pricePerDay) || 5000) * (Number(curr.nights) || 1));
        }
        return acc;
    }, 0);

    const totalHotelLKR = totalHotelUSD * usdToLkrRate;
    const grandTotalLKR = totalTaxiLKR + totalHotelLKR + totalGuideLKR;

    return (
        <div className="space-y-12 pb-20">
            <header className="text-center space-y-4">
               <Motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-[2rem] mb-2"
               >
                  <ShieldCheck className="text-emerald-600 w-10 h-10" />
               </Motion.div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight">Your Sri Lankan Odyssey</h2>
               <p className="text-slate-500 font-medium max-w-lg mx-auto">
                  A premium, custom-tailored journey through the Pearl of the Indian Ocean.
               </p>
            </header>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Timeline / Itinerary */}
                <div className="xl:col-span-2 space-y-8 relative">
                    <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-100 hidden md:block"></div>

                    {(tripData.destinations || []).map((dest, i) => (
                        <Motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative md:pl-24"
                        >
                            {/* Marker */}
                            <div className="absolute left-8 top-0 -ml-px w-5 h-5 rounded-full border-4 border-white bg-emerald-600 shadow-xl z-10 hidden md:block mt-12"></div>

                            <div className="glass-card rounded-[2.5rem] overflow-hidden border-2 border-slate-100 hover:shadow-2xl transition-all duration-500">
                                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                       <div className="p-4 bg-white rounded-3xl shadow-sm text-slate-800">
                                          <MapPin size={24} />
                                       </div>
                                       <div>
                                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Leg {i + 1}</span>
                                          <h4 className="text-2xl font-black text-slate-900">{dest.district}</h4>
                                          <p className="text-xs font-bold text-slate-400 mt-1">{dest.checkIn} — {dest.checkOut}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span className="px-4 py-2 bg-white rounded-2xl text-[10px] font-black text-slate-900 shadow-sm border border-slate-100">
                                          {dest.nights || 0} NIGHTS
                                       </span>
                                    </div>
                                </div>
                                
                                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Stay Details */}
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 mb-2">
                                          <Hotel size={16} className="text-slate-400" />
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accommodation</span>
                                       </div>
                                       <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                          <p className="font-black text-slate-900 text-lg mb-1">{dest.hotelDetails?.name || 'Self-Arranged'}</p>
                                          {dest.selectedRooms?.map((r, idx) => (
                                             <div key={idx} className="flex justify-between items-center mt-2 text-xs font-bold text-slate-500">
                                                <span>{r.type}</span>
                                                <span className="text-emerald-600">${r.price}</span>
                                             </div>
                                          ))}
                                       </div>
                                    </div>

                                    {/* Services */}
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 mb-2">
                                          <Car size={16} className="text-slate-400" />
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transport & Support</span>
                                       </div>
                                       <div className="space-y-3">
                                          {dest.transportCost > 0 && (
                                             <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                                <div className="flex items-center gap-3">
                                                   <Car size={14} className="text-blue-600" />
                                                   <span className="text-xs font-black text-slate-700">Private Transfer</span>
                                                </div>
                                                <span className="text-xs font-black text-blue-700">LKR {dest.transportCost.toLocaleString()}</span>
                                             </div>
                                          )}
                                          {dest.selectedGuideDetails && (
                                             <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                                <div className="flex items-center gap-3">
                                                   <User size={14} className="text-amber-600" />
                                                   <span className="text-xs font-black text-slate-700">Tour Guide</span>
                                                </div>
                                                <span className="text-xs font-black text-amber-700">LKR {((dest.selectedGuideDetails.pricePerDay || 5000) * (dest.nights || 1)).toLocaleString()}</span>
                                             </div>
                                          )}
                                       </div>
                                    </div>
                                </div>
                            </div>
                        </Motion.div>
                    ))}
                </div>

                {/* Bill / Summary Card */}
                <div className="space-y-8">
                   <Motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="glass-card rounded-[3rem] p-10 border-2 border-emerald-500/20 shadow-2xl shadow-emerald-900/5 sticky top-12"
                   >
                      <h4 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                         <Wallet className="text-emerald-600" /> Investment Summary
                      </h4>

                      <div className="space-y-4 pb-8 border-b border-slate-100">
                         <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                               <Hotel size={16} className="text-emerald-600" />
                               <span className="text-slate-500 font-bold text-xs">Hotels & Stays</span>
                            </div>
                            <div className="text-right">
                               <p className="text-slate-900 font-black">${totalHotelUSD.toLocaleString()}</p>
                               <p className="text-[10px] text-slate-400 font-bold">LKR {totalHotelLKR.toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                               <User size={16} className="text-amber-600" />
                               <span className="text-slate-500 font-bold text-xs">Professional Guides</span>
                            </div>
                            <div className="text-right">
                               <p className="text-slate-900 font-black">LKR {totalGuideLKR.toLocaleString()}</p>
                               <p className="text-[10px] text-slate-400 font-bold">${(totalGuideLKR / usdToLkrRate).toFixed(2)}</p>
                            </div>
                         </div>
                         <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                               <Car size={16} className="text-blue-600" />
                               <span className="text-slate-500 font-bold text-xs">Private Transport</span>
                            </div>
                            <div className="text-right">
                               <p className="text-slate-900 font-black">LKR {totalTaxiLKR.toLocaleString()}</p>
                               <p className="text-[10px] text-slate-400 font-bold">${(totalTaxiLKR / usdToLkrRate).toFixed(2)}</p>
                            </div>
                         </div>
                      </div>

                      <div className="py-8 space-y-4">
                         <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                            <div className="text-right">
                               <p className="text-4xl font-black text-slate-900">LKR {grandTotalLKR.toLocaleString()}</p>
                               <p className="text-lg font-black text-emerald-600 mt-1">USD ${ (grandTotalLKR / usdToLkrRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }</p>
                            </div>
                         </div>
                      </div>

                      <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 mb-8">
                         <div className="flex gap-4">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
                               <ShieldCheck size={20} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-900">Premium Booking Protected</p>
                               <p className="text-[10px] text-slate-500 font-bold mt-1">Secure escrow payments and 24/7 localized support included.</p>
                            </div>
                         </div>
                      </div>

                      <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-tighter leading-relaxed">
                         * Estimates based on {usdToLkrRate} LKR/USD exchange. Provider availability verified at booking.
                      </p>
                   </Motion.div>
                </div>
            </div>
        </div>
    );
};

export default SummaryStep;