import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, ArrowLeft, Loader, Eye, User } from 'lucide-react';

const AdminApprovalsPage = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const fetchPending = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/admin/pending`, {
                headers: { 'x-auth-token': token }
            });
            setPendingUsers(res.data.users || []);
        } catch (err) {
            // ✅ FIX: Log the error to satisfy ESLint
            console.error("Error fetching pending users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const handleAction = async (action, id) => {
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;
        
        try {
            const token = localStorage.getItem('token');
            const url = action === 'approve' 
                ? `${API_URL}/api/admin/approve/${id}` 
                : `${API_URL}/api/admin/reject/${id}`;
                
            const method = action === 'approve' ? axios.patch : axios.delete;
            
            await method(url, {}, { headers: { 'x-auth-token': token } });
            
            // Remove from list immediately
            setPendingUsers(prev => prev.filter(u => u._id !== id));
            setSelectedUser(null);
            alert(`User ${action}d successfully`);
        } catch (err) {
            console.error("Action failed:", err);
            alert(`Failed to ${action}`);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin text-teal-600"/></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition">
                    <ArrowLeft size={18} className="mr-2"/> Back to Dashboard
                </button>

                <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
                    <ShieldCheck className="text-yellow-500"/> Pending Approvals
                </h1>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {pendingUsers.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <CheckCircle size={48} className="mx-auto mb-4 text-gray-200"/>
                            <p>No pending approvals. Great job!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {pendingUsers.map(user => (
                                <div key={user._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                                            <User size={24}/>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{user.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <span className="capitalize bg-gray-100 px-2 py-0.5 rounded text-xs font-bold">{user.role}</span>
                                                <span>• {user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => setSelectedUser(user)}
                                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 flex items-center gap-2"
                                        >
                                            <Eye size={16}/> View
                                        </button>
                                        <button 
                                            onClick={() => handleAction('approve', user._id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 shadow-lg shadow-green-200 flex items-center gap-2"
                                        >
                                            <CheckCircle size={16}/> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction('reject', user._id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center gap-2"
                                        >
                                            <XCircle size={16}/> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Simple Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><XCircle size={20}/></button>
                        <h2 className="text-2xl font-bold mb-4">Applicant Details</h2>
                        <div className="space-y-3 text-gray-600">
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Role:</strong> <span className="capitalize">{selectedUser.role}</span></p>
                            {selectedUser.vehicleType && <p><strong>Vehicle:</strong> {selectedUser.vehicleType}</p>}
                            {selectedUser.licensePlate && <p><strong>License:</strong> {selectedUser.licensePlate}</p>}
                            <p><strong>Joined:</strong> {new Date(selectedUser.date).toLocaleDateString()}</p>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => handleAction('approve', selectedUser._id)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">Approve</button>
                            <button onClick={() => handleAction('reject', selectedUser._id)} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold">Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApprovalsPage;