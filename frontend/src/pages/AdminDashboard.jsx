import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Users, CheckSquare, ShieldCheck, Activity, DollarSign, Map, LogOut, ArrowRight 
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUsers: 0, pendingApprovals: 0, totalEarnings: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/admin/stats`, {
                    headers: { 'x-auth-token': token }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

  
    if (loading) return <div className="h-screen flex items-center justify-center text-teal-600 font-bold text-lg animate-pulse">Loading Dashboard...</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-72 bg-gray-900 text-white flex flex-col p-6 shadow-2xl z-10">
                <h1 className="text-3xl font-black text-teal-400 mb-12 flex items-center gap-3">
                    <ShieldCheck size={32}/> Admin
                </h1>
                
                <nav className="flex-1 space-y-3">
                    <SidebarItem icon={<Activity/>} label="Overview" active />
                    <SidebarItem icon={<Users/>} label="Manage Admins" onClick={() => navigate('/admin/manage-admins')} />
                    <SidebarItem icon={<CheckSquare/>} label="Approvals" badge={stats.pendingApprovals} onClick={() => navigate('/admin/approvals')} />
                   
                </nav>

               
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-12">
                <header className="mb-12">
                    <h2 className="text-4xl font-black text-gray-800">Dashboard</h2>
                    <p className="text-gray-500 mt-2 text-lg">Platform Overview & Management Controls</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard title="Active Users" value={stats.totalUsers} icon={<Users/>} color="bg-blue-500 shadow-blue-200"/>
                    <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={<CheckSquare/>} color="bg-yellow-500 shadow-yellow-200"/>
                    <StatCard title="Platform Fees (10%)" value={`LKR ${stats.totalEarnings?.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={<DollarSign/>} color="bg-green-500 shadow-green-200"/>
                </div>

                {/* Management Cards Section */}
                <h3 className="text-xl font-bold text-gray-700 mb-6 uppercase tracking-wider">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* 1. Manage Admins Card */}
                    <div onClick={() => navigate('/admin/manage-admins')} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-32 bg-purple-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-5 bg-purple-100 text-purple-600 rounded-2xl shadow-sm">
                                <Users size={32}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl text-gray-800">Admin Team</h3>
                                <p className="text-gray-500 mt-1">Add or remove system administrators.</p>
                            </div>
                            <div className="ml-auto bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-purple-600 group-hover:text-white transition">
                                <ArrowRight size={20}/>
                            </div>
                        </div>
                    </div>

                    {/* 2. Trip Monitor Card */}
                    <div onClick={() => navigate('/admin/trip-management')} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-32 bg-teal-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="p-5 bg-teal-100 text-teal-600 rounded-2xl shadow-sm">
                                <Map size={32}/>
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl text-gray-800">Trip Monitor</h3>
                                <p className="text-gray-500 mt-1">Track all active trips and itinerary details.</p>
                            </div>
                            <div className="ml-auto bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-teal-600 group-hover:text-white transition">
                                <ArrowRight size={20}/>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, badge, onClick }) => (
    <div onClick={onClick} className={`flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer transition-all duration-200 ${active ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
        <div className="flex items-center gap-4">
            {React.cloneElement(icon, { size: 20 })}
            <span className="font-bold tracking-wide text-sm">{label}</span>
        </div>
        {badge > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">{badge}</span>}
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{title}</p>
            <h3 className="text-4xl font-black text-gray-800">{value}</h3>
        </div>
        <div className={`p-5 rounded-2xl text-white shadow-lg ${color}`}>
            {React.cloneElement(icon, { size: 28 })}
        </div>
    </div>
);

export default AdminDashboard;