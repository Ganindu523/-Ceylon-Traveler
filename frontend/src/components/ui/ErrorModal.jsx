import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCcw, ShieldAlert } from 'lucide-react';

const ErrorModal = ({ isOpen, message, onClose, onRetry }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md glass-card rounded-[3rem] overflow-hidden shadow-2xl border-2 border-red-500/20 bg-white"
                    >
                        <div className="p-10 text-center">
                            <div className="inline-flex items-center justify-center p-5 bg-red-50 rounded-[2rem] mb-6">
                                <ShieldAlert className="text-red-500 w-10 h-10" />
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Something Went Wrong</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                {message || "We encountered an unexpected error. Please try again or contact support if the issue persists."}
                            </p>

                            <div className="flex flex-col gap-3">
                                {onRetry && (
                                    <button 
                                        onClick={onRetry}
                                        className="btn-primary w-full !bg-slate-900 !text-white flex items-center justify-center gap-2 py-4"
                                    >
                                        <RefreshCcw size={18} /> Try Again
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="px-8 py-4 text-slate-400 font-black text-sm uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-red-50/50 py-4 px-6 border-t border-red-50 text-[10px] font-black text-red-400 uppercase tracking-tighter flex items-center justify-center gap-2">
                            <AlertCircle size={12} /> System Reference: ERR_CONNECTION_FAILED
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ErrorModal;
