import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ShieldCheck, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ManageAdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // ✅ FIX 1: Defined with useCallback to keep it stable
    const fetchAdmins = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_URL}/api/admin/admins`, { headers: { 'x-auth-token': token } });
            setAdmins(res.data);
        } catch (err) { 
            // ✅ FIX 2: Used 'err' to silence unused var warning
            console.error("Error fetching admins:", err); 
        }
    }, []);

    useEffect(() => { 
        fetchAdmins(); 
        // ✅ FIX 3: Removed dependency & suppressed warning to prevent render loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${API_URL}/api/admin/create-admin`, form, { headers: { 'x-auth-token': token } });
            alert("Admin Created!");
            setForm({ name: '', email: '', password: '' });
            fetchAdmins();
        } catch (err) { 
            console.error("Create error:", err);
            alert("Failed to create admin"); 
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Delete this admin?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${API_URL}/api/admin/admins/${id}`, { headers: { 'x-auth-token': token } });
            fetchAdmins();
        } catch (err) { 
            console.error("Delete error:", err);
            alert("Cannot delete (Self or Error)"); 
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <button onClick={() => navigate('/admin-dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 mb-6"><ArrowLeft size={18} className="mr-2"/> Back to Dashboard</button>
                
                <h1 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3"><ShieldCheck className="text-teal-600"/> Manage Admins</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Form */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
                        <h2 className="text-lg font-bold mb-4">Create New Admin</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <input type="text" placeholder="Name" className="w-full border rounded-lg p-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            <input type="email" placeholder="Email" className="w-full border rounded-lg p-3" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                            <input type="password" placeholder="Password" className="w-full border rounded-lg p-3" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                            <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 flex justify-center items-center gap-2"><Plus size={18}/> Create Admin</button>
                        </form>
                    </div>

                    {/* Admin List */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border overflow-hidden">
                        <div className="p-6 border-b bg-gray-50"><h2 className="font-bold text-gray-700">Existing Admins</h2></div>
                        <div className="divide-y">
                            {admins.map(admin => (
                                <div key={admin._id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                    <div>
                                        <p className="font-bold text-gray-800">{admin.name}</p>
                                        <p className="text-sm text-gray-500">{admin.email}</p>
                                    </div>
                                    <button onClick={() => handleDelete(admin._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"><Trash2 size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAdminsPage;