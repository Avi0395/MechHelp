import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Wrench, 
  MapPin, 
  User, 
  Navigation, 
  History, 
  LogOut, 
  Menu, 
  X, 
  AlertTriangle,
  Home,
  Briefcase,
  ShieldCheck
} from "lucide-react";

const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT;

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = async () => {
    try {
      await axios.post(`${USER_API_END_POINT}/logout`, {}, { withCredentials: true });
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { to: "/layout", label: "Home", icon: <Home className="w-4 h-4" />, exact: true },
    { to: "/layout/services", label: "Services", icon: <Briefcase className="w-4 h-4" /> },
    { to: "/layout/nearby-mechanic", label: "Nearby Mechanics", icon: <MapPin className="w-4 h-4" /> },
    { to: "/layout/track", label: "Live Track", icon: <Navigation className="w-4 h-4 text-emerald-600" /> },
    { to: "/layout/history", label: "History", icon: <History className="w-4 h-4" /> },
    { to: "/layout/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 font-sans shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/layout" className="flex items-center space-x-3 group">
          <div className="bg-blue-600 group-hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-2xl tracking-tight leading-none text-slate-900">
              Mech<span className="text-blue-600">Help</span>
            </span>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                Customer Portal
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/90 border border-slate-200/80 p-1.5 rounded-2xl shadow-inner">
          {navLinks.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md scale-102"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70"
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center space-x-3">
          <Link
            to="/layout/nearby-mechanic"
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center space-x-2 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>SOS DISPATCH</span>
          </Link>

          <button
            onClick={handleLogout}
            className="bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden bg-slate-100 border border-slate-200 text-slate-800 p-2.5 rounded-xl hover:bg-slate-200 focus:outline-none"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
        </button>

      </div>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          {navLinks.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.to}
              end={link.exact}
              onClick={toggleMenu}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}

          <div className="pt-4 border-t border-slate-200 space-y-2">
            <Link
              to="/layout/nearby-mechanic"
              onClick={toggleMenu}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center space-x-2 shadow-md"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS EMERGENCY DISPATCH</span>
            </Link>

            <button
              onClick={() => {
                handleLogout();
                toggleMenu();
              }}
              className="w-full bg-slate-100 border border-slate-200 hover:bg-red-600 hover:border-red-600 text-slate-700 hover:text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Nav;
