import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Hotel, Car, Map, CreditCard, Mail, Lock, 
  ArrowRight, ShieldCheck, CheckCircle, Briefcase, Camera
} from 'lucide-react';

const registrationRoles = [
  { name: 'Tourist', role: 'tourist', icon: <User size={22} />, color: 'bg-emerald-500', id_placeholder: 'Passport / NIC Number' },
  { name: 'Hotel', role: 'hotel', icon: <Hotel size={22} />, color: 'bg-amber-500', id_placeholder: 'Business Reg Number' },
  { name: 'Taxi', role: 'taxi', icon: <Car size={22} />, color: 'bg-blue-500', id_placeholder: 'Driver License Number' },
  { name: 'Guide', role: 'guide', icon: <Map size={22} />, color: 'bg-indigo-500', id_placeholder: 'Guide License Number' },
];

const RegistrationPage = () => {
  const [selectedRole, setSelectedRole] = useState('tourist');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    identificationNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, identificationNumber } = formData;
  const currentRoleConfig = registrationRoles.find(r => r.role === selectedRole);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/auth/register`, { ...formData, role: selectedRole });
      alert("Account created successfully! Please log in.");
      navigate('/login'); 
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-emerald-50/50 rounded-br-full -z-10"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-6xl glass-card rounded-[3rem] overflow-hidden min-h-[750px] shadow-2xl shadow-emerald-900/10"
      >
        {/* Left Side: Branding & Value Props */}
        <div className="hidden lg:block w-[40%] bg-slate-900 relative overflow-hidden p-16 text-white">
           <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover opacity-40 blur-[2px]" 
                alt="Ceylon" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
           </div>

           <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                 <p className="font-luxury italic text-emerald-400 text-xl mb-4">Ceylon Traveler</p>
                 <h1 className="text-5xl font-black mb-8 leading-tight">Join the Elite <br/>Travel Circle.</h1>
                 <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
                   Connect with verified service providers or start your journey as a traveler in the paradise island.
                 </p>
              </div>

              <div className="space-y-6">
                 {[
                   'Exclusive Member Rates',
                   'Verified Local Expertise',
                   'AI-Powered Trip Planning'
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-4">
                      <div className="bg-emerald-500/20 p-2 rounded-xl text-emerald-400">
                         <CheckCircle size={18} />
                      </div>
                      <span className="font-bold text-slate-200">{text}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh] no-scrollbar">
          <div className="max-w-xl w-full mx-auto">
            <header className="mb-10 text-center lg:text-left">
               <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Create Account</h2>
               <p className="text-slate-500 font-medium">Join our community of passionate travelers.</p>
            </header>

            {/* Role Selection */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
               {registrationRoles.map((r) => (
                 <button
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 border-2 ${
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

            <form onSubmit={onSubmit} className="space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                     <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><User size={18} /></div>
                     <input type="text" name="name" placeholder="Full Name" className="input-field pl-14" value={name} onChange={onChange} required />
                  </div>
                  <div className="relative group">
                     <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Mail size={18} /></div>
                     <input type="email" name="email" placeholder="Email Address" className="input-field pl-14" value={email} onChange={onChange} required />
                  </div>
               </div>

               <div className="relative group">
                  <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><CreditCard size={18} /></div>
                  <input 
                    type="text" 
                    name="identificationNumber" 
                    placeholder={currentRoleConfig.id_placeholder} 
                    className="input-field pl-14" 
                    value={identificationNumber} 
                    onChange={onChange} 
                    required 
                  />
               </div>

               <div className="relative group">
                  <div className="absolute left-5 top-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock size={18} /></div>
                  <input type="password" name="password" placeholder="Create Password" className="input-field pl-14" value={password} onChange={onChange} required />
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full py-4 rounded-2xl group mt-4 shadow-xl shadow-emerald-200"
               >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? 'Setting up your portal...' : 'Join Now'}
                    {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                  </span>
               </button>
            </form>

            <footer className="mt-10 text-center pt-8 border-t border-slate-50">
               <p className="text-slate-500 font-medium">
                 Already a member?{' '}
                 <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                   Log In
                 </Link>
               </p>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;