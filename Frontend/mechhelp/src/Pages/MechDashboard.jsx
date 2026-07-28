import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Wrench, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Inbox, 
  User, 
  History, 
  AlertTriangle, 
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;
const REQUEST_API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;

export default function MechDashboard() {
  const [mechanic, setMechanic] = useState(null);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchMechanicData();
  }, []);

  const fetchMechanicData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Mechanic Profile
      const profileRes = await axios.get(`${API_ENDPOINT}/profile`, {
        withCredentials: true,
      });
      setMechanic(profileRes.data);
      if (profileRes.data?.availability?.isAvailable !== undefined) {
        setIsAvailable(profileRes.data.availability.isAvailable);
      }

      // 2. Fetch Requests Count
      const reqRes = await axios.get(`${REQUEST_API_ENDPOINT}/mechanic`, {
        withCredentials: true,
      });
      if (Array.isArray(reqRes.data)) {
        const active = reqRes.data.filter(r => r.status === "pending" || r.status === "accepted");
        const completed = reqRes.data.filter(r => r.status === "completed");
        setActiveRequestsCount(active.length);
        setCompletedCount(completed.length);
      }
    } catch (error) {
      console.error("Error fetching mechanic data:", error);
      toast.error("Failed to fetch dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;
      await axios.put(
        `${API_ENDPOINT}/availability`,
        { isAvailable: newStatus },
        { withCredentials: true }
      );
      setIsAvailable(newStatus);
      toast.success(newStatus ? "You are now ONLINE & Available!" : "You are now OFFLINE");
    } catch (err) {
      console.error("Failed to update availability:", err);
      toast.error("Could not update availability.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-3 text-slate-600 font-semibold text-lg">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Operations Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      
      {/* 1. TOP HERO COMMAND BAR (ROYAL BLUE THEME - NO ORANGE) */}
      <section className="bg-white border-b border-slate-200 py-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-700">
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`}></span>
                <span>{isAvailable ? "Dispatch System Active" : "Status: Offline"}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back, <span className="text-blue-600">{mechanic?.name || "Mechanic"}</span>! 🔧
              </h1>
              <p className="text-slate-600 text-sm md:text-base max-w-xl">
                Ready for breakdown dispatches? Manage your customer requests, track active emergency calls, and monitor performance.
              </p>
            </div>

            {/* Online / Offline Toggle Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-6 shadow-xs shrink-0">
              <div className="text-left">
                <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Your Availability</div>
                <div className={`text-base font-extrabold mt-0.5 ${isAvailable ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {isAvailable ? "🟢 ONLINE (Receiving Calls)" : "🔴 OFFLINE"}
                </div>
              </div>

              <button
                onClick={toggleAvailability}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${
                  isAvailable 
                    ? "bg-slate-900 hover:bg-slate-800 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isAvailable ? "Go Offline" : "Go Online Now"}
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 text-left">
            <Link 
              to="/MechDashboard/requests"
              className="bg-slate-50 border border-slate-200 hover:border-blue-600 rounded-2xl p-5 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Active Calls</span>
                <Inbox className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{activeRequestsCount}</div>
              <div className="text-xs text-blue-600 font-bold mt-1">Pending / Accepted →</div>
            </Link>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Repairs Fixed</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">{completedCount}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Completed Services</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Rating</span>
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">4.9 / 5</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Verified Customer Score</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Response Time</span>
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2">12 Min</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Average Dispatch Speed</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. COMMAND ACTION BAR & ACTIVE DISPATCH SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 mt-12 space-y-10">
        
        {/* Quick Launch Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          <Link
            to="/MechDashboard/requests"
            className="bg-white border-2 border-blue-600 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              {activeRequestsCount > 0 && (
                <span className="bg-red-600 text-white font-extrabold text-xs px-3 py-1 rounded-full animate-bounce">
                  {activeRequestsCount} NEW REQUESTS
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Customer Requests
            </h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              View incoming breakdown requests, accept jobs, and launch live GPS map navigation.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-sm font-extrabold text-blue-600">
              <span>Open Requests Inbox</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/MechDashboard/history"
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl">
                <History className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Service History
            </h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Review all past completed repairs, customer notes, and earnings summary.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-sm font-extrabold text-slate-700">
              <span>View History Log</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/MechDashboard/profile"
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-3xl p-8 shadow-xs hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-100 text-slate-700 p-3 rounded-2xl">
                <User className="w-8 h-8" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Profile & Workshop
            </h3>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              Update your contact details, service radius, specialization, and working hours.
            </p>
            <div className="mt-6 flex items-center space-x-2 text-sm font-extrabold text-slate-700">
              <span>Edit Profile Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* 3. OPERATIONS CHECKLIST & TIP OF THE DAY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          
          {/* Dispatch Readiness */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Dispatch Preparedness Checklist</h3>
            </div>

            <div className="space-y-3">
              {[
                "OBD-II Diagnostic Scanner Charged & Ready",
                "Battery Jumpstart Booster Box Full Charge",
                "Mobile Tire Patch & Air Compressor Kit Stocked",
                "GPS Location Sensor Active on Mobile Device"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Mechanic Tip */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-md space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-600/30 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold text-blue-400">
                <Zap className="w-3.5 h-3.5" />
                <span>EXCELLENCE IN SERVICE</span>
              </div>
              <h3 className="text-2xl font-bold text-white">"Precision & Speed Build Customer Loyalty"</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                When you accept a request, open the Live Map immediately so the customer can see your real-time ETA. Clear communication builds 5-star reviews!
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>MECHHELP OPERATIONS V2.0</span>
              <span className="text-emerald-400 font-bold">SYSTEM ACTIVE</span>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}