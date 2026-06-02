import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Globe, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ navLinks, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload(); 
  };

  const getLinkClasses = ({ isActive }) => {
    const baseClasses = "px-5 py-2 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2 relative group";
    const activeClasses = "text-emerald-700 bg-emerald-50";
    const inactiveClasses = "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50";
    
    return isActive ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'py-3' : 'py-6'
    }`}>
      <div className="container mx-auto px-6">
        <div className={`glass-card rounded-[2rem] px-6 py-3 flex justify-between items-center transition-all duration-500 ${
          scrolled ? 'shadow-2xl shadow-emerald-900/5 bg-white/80' : 'bg-white/40 border-transparent'
        }`}>
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-emerald-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-200">
              <Globe size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight leading-none">Ceylon Traveler</span>
              {userRole && userRole !== 'guest' && (
                <span className="text-[10px] uppercase font-black text-emerald-600 tracking-[0.2em] mt-1 flex items-center gap-1">
                  <ShieldCheck size={10} /> {userRole}
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={getLinkClasses}>
                {link.name}
                <motion.div 
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="nav-dot"
                />
              </NavLink>
            ))}

            {userRole && userRole !== 'guest' ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-sm"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="ml-4">
                <Link to="/login" className="btn-primary !py-2.5 !px-6 !text-sm">
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-6 right-6 mt-4"
          >
            <div className="glass-card rounded-[2.5rem] p-6 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all ${
                      isActive 
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              
              {userRole && userRole !== 'guest' ? (
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl text-lg font-bold mt-4"
                >
                  <LogOut size={20} /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-600 text-white rounded-2xl text-lg font-bold mt-4 shadow-lg shadow-emerald-200"
                >
                   Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;