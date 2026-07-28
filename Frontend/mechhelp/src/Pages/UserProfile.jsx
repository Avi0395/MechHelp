import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { User, Phone, Mail, CheckCircle2, Edit3, Save, X, Sparkles } from "lucide-react";

const API_ENDPOINT = import.meta.env.VITE_USER_API_END_POINT;

export const AVATARS = [
  { id: "avatar1", name: "Master Tech 🧑‍🔧", url: "https://api.dicebear.com/7.x/bottts/svg?seed=MasterTech&backgroundColor=b6e3f4" },
  { id: "avatar2", name: "Speed Racer 🏎️", url: "https://api.dicebear.com/7.x/bottts/svg?seed=SpeedRacer&backgroundColor=c0aede" },
  { id: "avatar3", name: "Turbo Driver 🚗", url: "https://api.dicebear.com/7.x/bottts/svg?seed=TurboDriver&backgroundColor=d1d4f9" },
  { id: "avatar4", name: "Gearhead Pro 🛠️", url: "https://api.dicebear.com/7.x/bottts/svg?seed=GearheadPro&backgroundColor=ffd5dc" },
  { id: "avatar5", name: "Road Specialist 🛡️", url: "https://api.dicebear.com/7.x/bottts/svg?seed=RoadSpecialist&backgroundColor=ffdfbf" },
  { id: "avatar6", name: "Cruiser Ace 🛵", url: "https://api.dicebear.com/7.x/bottts/svg?seed=CruiserAce&backgroundColor=c1e1c1" },
];

export default function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    avatar: AVATARS[0].url,
  });

  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINT}/profile`, {
        withCredentials: true,
      });
      if (response.data) {
        setUser({
          name: response.data.name || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          avatar: response.data.avatar || response.data.photo || AVATARS[0].url,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatarUrl) => {
    setUser({ ...user, avatar: avatarUrl });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      // Fixed URL typo: removed trailing brace
      const response = await axios.put(
        `${API_ENDPOINT}/updateprofile`,
        {
          name: user.name,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar,
        },
        {
          withCredentials: true,
        }
      );

      setIsEditing(false);
      toast.success(response.data.message || "Profile updated successfully!");
      fetchUserProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user.name) {
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
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="text-left space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Account Settings</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">Customer Profile</h1>
          <p className="text-slate-600 text-sm">Manage your personal information and profile avatar.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-8">
          
          {/* Avatar Display */}
          <div className="flex flex-col items-center space-y-4 pt-2">
            <div className="relative w-32 h-32 rounded-3xl p-2 bg-slate-100 border-2 border-blue-600 shadow-md">
              <img
                src={user.avatar}
                alt="Profile Avatar"
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">{user.name || "Customer"}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{user.email}</p>
            </div>
          </div>

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Full Name</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{user.name}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email Address</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{user.email}</div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 md:col-span-2">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Phone Number</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">{user.phoneNumber}</div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-2 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Avatar</span>
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE WITH AVATAR PICKER */
            <form onSubmit={handleSave} className="space-y-8 text-left">
              
              {/* AVATAR SELECTOR GRID */}
              <div className="space-y-3">
                <label className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Choose Profile Avatar</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => handleAvatarSelect(av.url)}
                      className={`p-2 rounded-2xl border-2 transition-all flex flex-col items-center space-y-1 ${
                        user.avatar === av.url
                          ? "border-blue-600 bg-blue-50/80 shadow-md scale-105"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-12 h-12 object-contain" />
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                        {av.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* EDIT FORM INPUTS */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleChange}
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
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address (Read Only)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
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
