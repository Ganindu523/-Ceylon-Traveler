import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building, Car, Map, Mail, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const loginRoles = [
  { name: 'Tourist', role: 'tourist', icon: <User size={20} />, color: 'bg-emerald-500' },
  { name: 'Hotel', role: 'hotel', icon: <Building size={20} />, color: 'bg-amber-500' },
  { name: 'Taxi', role: 'taxi', icon: <Car size={20} />, color: 'bg-blue-500' },
  { name: 'Guide', role: 'guide', icon: <Map size={20} />, color: 'bg-indigo-500' },
  { name: 'Admin', role: 'admin', icon: <ShieldCheck size={20} />, color: 'bg-slate-700' },
];

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('tourist');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;
  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const parseJwt = (token) => {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch (e) { console.error("JWT Parse Error:", e); return null; }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use env variable for API URL
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      const { token } = res.data;
      localStorage.setItem('token', token);
      
      const decoded = parseJwt(token); 
      const userRole = decoded?.user?.role;

      setTimeout(() => {
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'hotel') navigate('/hotel-admin/dashboard');
        else if (userRole === 'taxi') navigate('/taxi-admin/dashboard');
        else if (userRole === 'guide') navigate('/guide-admin/dashboard');
        else navigate('/user_home');
      }, 800);

    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-teal-50 rounded-tr-full -z-10"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-6xl glass-card rounded-[3rem] overflow-hidden min-h-[700px] shadow-2xl shadow-emerald-900/10"
      >
        
        {/* Left Side: Dynamic Image & Branding */}
        <div className="hidden lg:block w-[45%] relative overflow-hidden bg-slate-900">
           <AnimatePresence mode="wait">
              <motion.div
                key={selectedRole}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img 
                  src={`https://images.unsplash.com/photo-${
                    selectedRole === 'tourist' ? '1529253355930-ddbe423a2ac7' : 
                    selectedRole === 'hotel' ? '1566073771259-6a8506099945' : 
                    selectedRole === 'taxi' ? '1540304453526-6197514a77b0' : 
                    selectedRole === 'guide' ? '1506744038136-46273834b3fb' : '1451187580459-43490279c0fa'
                  }?auto=format&fit=crop&w=800&q=80`}
                  className="w-full h-full object-cover opacity-60"
                  alt="Ceylon"
                />
              </motion.div>
           </AnimatePresence>
           
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
           
           <div className="absolute bottom-16 left-12 right-12 text-white z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="font-luxury italic text-emerald-400 text-xl mb-4">Ceylon Traveler</p>
                <h1 className="text-5xl font-black mb-6 leading-tight">Your gateway to the <br/> island paradise.</h1>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-sm">Trusted by 10,000+ happy travelers</span>
                </div>
              </motion.div>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <header className="mb-12">
               <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Sign In</h2>
               <p className="text-slate-500 font-medium">Please select your role and enter credentials.</p>
            </header>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-5 gap-3 mb-10">
               {loginRoles.map((r) => (
                 <button
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 border-2 ${
                      selectedRole === r.role 
                        ? `${r.color} text-white border-transparent shadow-lg transform -translate-y-1` 
                        : 'bg-slate-50 text-slate-400 border-slate-50 hover:border-slate-200'
                    }`}
                 >
                    {r.icon}
                    <span className="text-[10px] font-black uppercase mt-2 tracking-wider">{r.name}</span>
                 </button>
               ))}
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
               <div className="space-y-4">
                  <div className="relative group">
                     <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <Mail size={18} />
                     </div>
                     <input 
                        type="email" 
                        name="email" 
                        placeholder="Email Address" 
                        className="input-field pl-14" 
                        value={email} 
                        onChange={onChange} 
                        required 
                     />
                  </div>
                  
                  <div className="relative group">
                     <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                        <Lock size={18} />
                     </div>
                     <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        className="input-field pl-14" 
                        value={password} 
                        onChange={onChange} 
                        required 
                     />
                  </div>
               </div>

               <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                     <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                     <span className="text-sm text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Forgot Password?</a>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-4 rounded-2xl group relative overflow-hidden"
               >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Authenticating...' : `Continue as ${selectedRole}`}
                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
               </button>
            </form>

            <footer className="mt-12 text-center pt-8 border-t border-slate-50">
               <p className="text-slate-500 font-medium">
                 New to Ceylon Traveler?{' '}
                 <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                   Create Account
                 </Link>
               </p>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;