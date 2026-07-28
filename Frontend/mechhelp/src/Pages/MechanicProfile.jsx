import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wrench, 
  Briefcase, 
  Clock, 
  Star, 
  CheckCircle2, 
  Edit3, 
  Save, 
  X, 
  Sparkles,
  ShieldCheck
} from "lucide-react";

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;

export const MECHANIC_AVATARS = [
  { id: "mech1", name: "Engine Specialist 🔧", url: "https://api.dicebear.com/7.x/bottts/svg?seed=EngineTech&backgroundColor=b6e3f4" },
  { id: "mech2", name: "Auto Electrician ⚡", url: "https://api.dicebear.com/7.x/bottts/svg?seed=AutoSpark&backgroundColor=d1d4f9" },
  { id: "mech3", name: "Tire & Suspension 🛞", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TireMaster&backgroundColor=c0aede" },
  { id: "mech4", name: "Tow Master 🚚", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TowMaster&backgroundColor=ffd5dc" },
  { id: "mech5", name: "Bodywork & Paint 🎨", url: "https://api.dicebear.com/7.x/bottts/svg?seed=BodyCraft&backgroundColor=ffdfbf" },
  { id: "mech6", name: "Chief Tech 🛠️", url: "https://api.dicebear.com/7.x/bottts/svg?seed=ChiefTech&backgroundColor=c1e1c1" },
];

export default function MechanicProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);

  const [mechanic, setMechanic] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specializations: [],
    serviceTypes: [],
    availability: {
      isAvailable: true,
      workingHours: {
        start: "08:00 AM",
        end: "08:00 PM",
      },
    },
    rating: 4.9,
    totalCompletedServices: 0,
    verified: true,
    avatar: MECHANIC_AVATARS[0].url,
  });

  useEffect(() => {
    fetchMechanicProfile();
  }, []);

  const fetchMechanicProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINT}/profile`, {
        withCredentials: true,
      });
      if (response.data) {
        setMechanic(prev => ({
          ...prev,
          ...response.data,
          specializations: response.data.specializations || ["Engine Repair", "Diagnostics"],
          serviceTypes: response.data.serviceTypes || ["Emergency Breakdown", "Doorstep Maintenance"],
          availability: response.data.availability || { isAvailable: true, workingHours: { start: "08:00 AM", end: "08:00 PM" } },
          avatar: response.data.avatar || response.data.profilePic || MECHANIC_AVATARS[0].url,
        }));
      }
    } catch (error) {
      console.error("Error fetching mechanic profile:", error);
      toast.error("Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMechanic(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecializationsChange = (e) => {
    const { value } = e.target;
    setMechanic(prev => ({ ...prev, specializations: value.split(",").map(item => item.trim()) }));
  };

  const handleServiceTypesChange = (e) => {
    const { value } = e.target;
    setMechanic(prev => ({ ...prev, serviceTypes: value.split(",").map(item => item.trim()) }));
  };

  const handleAvatarSelect = (avatarUrl) => {
    setMechanic(prev => ({ ...prev, avatar: avatarUrl }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const updatePayload = {
        name: mechanic.name,
        phone: mechanic.phone,
        address: mechanic.address,
        specializations: mechanic.specializations,
        serviceTypes: mechanic.serviceTypes,
        avatar: mechanic.avatar,
        profilePic: mechanic.avatar,
        availability: {
          isAvailable: mechanic.availability.isAvailable,
          workingHours: {
            start: mechanic.availability.workingHours?.start || "08:00 AM",
            end: mechanic.availability.workingHours?.end || "08:00 PM",
          }
        }
      };

      const response = await axios.put(`${API_ENDPOINT}/updateprofile`, updatePayload, {
        withCredentials: true,
      });

      setIsEditing(false);
      toast.success(response.data.message || "Mechanic Profile updated successfully!");
      fetchMechanicProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityToggle = async () => {
    const newStatus = !mechanic.availability.isAvailable;
    setIsUpdatingAvailability(true);

    try {
      const response = await axios.put(
        `${API_ENDPOINT}/availability`,
        { isAvailable: newStatus },
        { withCredentials: true }
      );

      toast.success(response.data.message || "Availability updated!");
      setMechanic(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          isAvailable: newStatus,
        }
      }));
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Failed to update availability.");
    } finally {
      setIsUpdatingAvailability(false);
    }
  };

  if (isLoading && !mechanic.name) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-slate-600 font-semibold">
          <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-left">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Workshop & Service Profile</span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Mechanic Profile</h1>
            <p className="text-slate-600 text-sm">Manage your workshop details, specializations, and dispatch availability.</p>
          </div>

          {/* Availability Switch */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between space-x-4 shadow-xs shrink-0">
            <div className="text-left">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Dispatch Status</div>
              <div className={`text-sm font-extrabold ${mechanic.availability.isAvailable ? 'text-emerald-700' : 'text-slate-600'}`}>
                {mechanic.availability.isAvailable ? "🟢 ONLINE" : "🔴 OFFLINE"}
              </div>
            </div>

            <button
              onClick={handleAvailabilityToggle}
              disabled={isUpdatingAvailability}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                mechanic.availability.isAvailable
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {mechanic.availability.isAvailable ? "Set Offline" : "Set Online"}
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-8">
          
          {/* Avatar Display */}
          <div className="flex flex-col items-center space-y-4 pt-2">
            <div className="relative w-32 h-32 rounded-3xl p-2 bg-slate-100 border-2 border-blue-600 shadow-md">
              <img
                src={mechanic.avatar}
                alt="Mechanic Avatar"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <h2 className="text-2xl font-bold text-slate-900">{mechanic.name || "Mechanic"}</h2>
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{mechanic.email}</p>
            </div>
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* Contact Information */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Phone</span>
                      <p className="font-bold text-slate-900">{mechanic.phone}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Email</span>
                      <p className="font-bold text-slate-900">{mechanic.email}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Workshop Address</span>
                      <p className="font-bold text-slate-900">{mechanic.address || "Main Street Workshop"}</p>
                    </div>
                  </div>
                </div>

                {/* Service Capability */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 flex items-center space-x-2">
                    <Wrench className="w-4 h-4 text-blue-600" />
                    <span>Workshop Capability</span>
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Specializations</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mechanic.specializations.map((spec, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-bold uppercase">Supported Services</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {mechanic.serviceTypes.map((st, i) => (
                          <span key={i} className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Mechanic Avatar</span>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE WITH MECHANIC AVATAR PICKER */
            <form onSubmit={handleSubmit} className="space-y-8 text-left">
              
              {/* MECHANIC AVATAR SELECTOR GRID */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Choose Mechanic Badge Avatar</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {MECHANIC_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleAvatarSelect(av.url)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center space-y-1.5 ${
                        mechanic.avatar === av.url
                          ? "border-blue-600 bg-blue-50/80 shadow-md scale-105"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-12 h-12 object-contain" />
                      <span className="text-[10px] font-bold text-slate-800 text-center leading-tight">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EDIT FORM INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={mechanic.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={mechanic.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Workshop Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={mechanic.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Specializations (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={mechanic.specializations.join(", ")}
                    onChange={handleSpecializationsChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Supported Service Types (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={mechanic.serviceTypes.join(", ")}
                    onChange={handleServiceTypesChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl transition-all flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}