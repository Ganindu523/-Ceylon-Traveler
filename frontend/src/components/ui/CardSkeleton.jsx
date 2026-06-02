import React from 'react';
import { motion } from 'framer-motion';

const CardSkeleton = () => {
    return (
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-2 border-slate-50 bg-white p-6 space-y-6 shadow-sm">
            {/* Image Placeholder */}
            <div className="relative h-48 w-full bg-slate-100 rounded-3xl overflow-hidden">
                <motion.div 
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                />
            </div>

            {/* Content Placeholder */}
            <div className="space-y-4">
                <div className="h-6 w-3/4 bg-slate-100 rounded-lg relative overflow-hidden">
                    <motion.div 
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    />
                </div>
                <div className="space-y-2">
                    <div className="h-3 w-full bg-slate-50 rounded-lg" />
                    <div className="h-3 w-5/6 bg-slate-50 rounded-lg" />
                </div>
                <div className="flex justify-between items-center pt-4">
                    <div className="h-8 w-24 bg-slate-100 rounded-xl" />
                    <div className="h-8 w-8 bg-slate-100 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default CardSkeleton;
