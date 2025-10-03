import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;

const MechDashboard = () => {
  const [mechanic, setMechanic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMechanicProfile();
  }, []);

  const fetchMechanicProfile = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_ENDPOINT}/profile`, {
        withCredentials: true,
      });
      setMechanic(response.data);
    } catch (error) {
      console.error("Error fetching mechanic profile:", error);
      toast.error("Failed to fetch profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <p className="text-2xl font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!mechanic) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <p className="text-2xl font-semibold text-gray-600">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="bg-white shadow-2xl rounded-3xl max-w-5xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-10 rounded-t-3xl overflow-hidden">
          <h1 className="text-5xl font-bold mb-3 animate-pulse">
            Welcome, {mechanic.name}!
          </h1>
          <p className="text-lg opacity-90">
            Wishing you clarity, confidence, and a day full of purpose.
          </p>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
            className="absolute -bottom-24 -right-24 opacity-10"
          >
            <Sparkles size={300} />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-indigo-100 rounded-xl p-6 shadow-md text-center"
          >
            <h2 className="text-2xl font-semibold text-indigo-700 mb-2">
              ✨ "Excellence is not a skill, it's an attitude."
            </h2>
            <p className="text-gray-700">
              You're not just fixing vehicles — you're building trust, one ride at a time.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="bg-pink-100 rounded-xl p-6 shadow-md text-center"
          >
            <h2 className="text-2xl font-semibold text-pink-700 mb-2">
              🔧 Keep the tools ready
            </h2>
            <p className="text-gray-700">
              Precision, patience, and power — you've got everything it takes.
            </p>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="bg-purple-100 rounded-xl p-6 shadow-md text-center"
          >
            <h2 className="text-2xl font-semibold text-purple-700 mb-2">
              🕒 Time to shine
            </h2>
            <p className="text-gray-700">
              Every hour counts — make your presence impactful and meaningful today.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MechDashboard;