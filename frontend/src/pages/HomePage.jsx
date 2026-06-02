import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHotel, FaTaxi, FaCompass, FaStar, FaShieldAlt, FaHeadset, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

const topDestinations = [
  { name: 'Ella', image: 'https://images.pexels.com/photos/2639943/pexels-photo-2639943.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'Mist-wrapped mountains and emerald tea estates.' },
  { name: 'Galle Fort', image: 'https://images.pexels.com/photos/2088279/pexels-photo-2088279.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'A colonial masterpiece where history meets the ocean.' },
  { name: 'Sigiriya', image: 'https://images.pexels.com/photos/1601041/pexels-photo-1601041.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', description: 'The majestic lion rock, an eighth wonder of the world.' },
];

const testimonials = [
  { name: 'Sophia Chen', quote: 'The AI assistant planned my entire honeymoon in minutes. Simply magical.', role: 'Traveler' },
  { name: 'Marcus Wright', quote: 'Finding a reliable guide in Kandy was effortless. Excellent service!', role: 'Adventurer' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleProtectedAction = (path) => {
    if (token) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-slate-50 overflow-hidden">
      
      {/* 1. Luxury Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50 rounded-bl-[200px] -z-10"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-2 px-4 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6 tracking-wider uppercase">
              ✨ Experience Sri Lanka Like Never Before
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-[1.1]">
              Discover the <span className="gradient-text">Pearl</span> of the Orient
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              Your gateway to paradise. Book luxury stays, hire expert local guides, and travel in comfort with our premium tourism ecosystem.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleProtectedAction('/plan-trip')} 
                className="btn-primary cursor-pointer"
              >
                Plan Your Journey <FaArrowRight />
              </button>
              <button 
                onClick={() => handleProtectedAction('/tours')} 
                className="btn-secondary cursor-pointer"
              >
                View All Tours
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://res.cloudinary.com/drk4vxbrr/image/upload/v1767987211/srilanka_orfqlv.jpg" 
                alt="Sri Lanka" 
                className="w-full h-[500px] object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>
            {/* Floating Info Cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-10 -left-10 glass-card p-6 rounded-3xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg">
                  <FaStar />
                </div>
                <div>
                  <p className="font-bold text-slate-800">4.9/5 Rating</p>
                  <p className="text-xs text-slate-500">Trusted by 10k+ Travelers</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. Top Destinations Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Curated Destinations</h2>
              <p className="text-slate-500 max-w-md italic font-luxury">Hand-picked locations that define the soul of Sri Lanka.</p>
            </div>
            <Link to="/destinations" className="text-emerald-600 font-bold hover:underline flex items-center gap-2">
              View All Destinations <FaArrowRight />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {topDestinations.map((dest, idx) => (
              <motion.div 
                key={dest.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-lg mb-6">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => handleProtectedAction('/destinations')}
                      className="w-full bg-white text-slate-900 font-bold py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2"
                    >
                      Explore {dest.name} <FaCompass />
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-600 transition-colors">{dest.name}</h3>
                <p className="text-slate-500 leading-relaxed">{dest.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-24 bg-slate-900 text-white rounded-[4rem] mx-6">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black mb-4">Seamless Experience</h2>
            <p className="text-slate-400">Everything you need for a perfect vacation in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <FaHotel />, title: 'Luxury Stays', desc: 'From beachfront villas to jungle retreats.', path: '/destinations' },
              { icon: <FaCompass />, title: 'Expert Guides', desc: 'Verified local guides who know every hidden gem.', path: '/tours' },
              { icon: <FaTaxi />, title: 'Safe Transport', desc: 'Comfortable rides with professional chauffeurs.', path: '/plan-trip' }
            ].map((f, i) => (
              <div 
                key={i} 
                onClick={() => handleProtectedAction(f.path)}
                className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-emerald-600/10 transition-colors group cursor-pointer"
              >
                <div className="bg-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. AI Promo Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[4rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center gap-12 shadow-2xl shadow-emerald-200">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">AI-Powered Trip Planning</h2>
            <p className="text-emerald-50 text-lg mb-10 leading-relaxed opacity-90">
              Stop guessing. Our Gemini-powered AI Assistant creates tailored itineraries, calculates costs, and recommends the best routes across Sri Lanka instantly.
            </p>
            <button 
              onClick={() => handleProtectedAction('/ai-assistant')}
              className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black py-4 px-10 rounded-2xl shadow-xl hover:scale-105 transition-transform active:scale-95 cursor-pointer"
            >
              Chat with Assistant <FaCompass className="animate-spin-slow" />
            </button>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="glass-card bg-white/20 p-8 rounded-3xl border-white/30 backdrop-blur-xl animate-float">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 text-2xl font-bold">CT</div>
                  <div>
                    <p className="font-bold">Ceylon Traveler AI</p>
                    <p className="text-xs opacity-70">Planning your perfect trip...</p>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="bg-white/20 p-4 rounded-2xl text-sm italic">"Finding the best waterfall in Ella for you..."</div>
                  <div className="bg-emerald-500 p-4 rounded-2xl text-sm font-medium ml-8">"Check out Diyaluma Falls! It's only 40 mins away."</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-3xl font-black gradient-text mb-6">Ceylon Traveler</p>
          <div className="flex justify-center gap-8 mb-10 text-slate-400 font-bold">
            <button onClick={() => handleProtectedAction('/destinations')} className="hover:text-emerald-600 transition-colors cursor-pointer">Destinations</button>
            <button onClick={() => handleProtectedAction('/tours')} className="hover:text-emerald-600 transition-colors cursor-pointer">Tours</button>
            <Link to="/login" className="hover:text-emerald-600 transition-colors">Partner Login</Link>
          </div>
          <p className="text-slate-400 text-sm">&copy; {new Date().getFullYear()} Ceylon Traveler. Crafted for Luxury & Adventure.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;