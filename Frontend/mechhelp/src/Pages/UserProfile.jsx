import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "react-router-dom"; // Import useParams

const API_ENDPOINT = import.meta.env.VITE_USER_API_END_POINT;

const ProfilePage = () => {
    // const { id: userId } = useParams(); // Extract the userId from the route parameters
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        photo: "https://raw.githubusercontent.com/SahilMalavi/mechhelp-storage/main/profile.png",
    });

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`${API_ENDPOINT}/profile`, {
                withCredentials: true
            });
            console.log("Fetched profile:", response.data);
            setUser(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("Failed to fetch profile.");
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const photoURL = URL.createObjectURL(file);
            setUser({ ...user, photo: photoURL });
        }
    };

    const handleSave = async () => {
        try {
            const response = await axios.put(`${API_ENDPOINT}/updateprofile}`, {
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                // photo upload should be handled separately if needed
            }, {
                withCredentials: true
            });
            setIsEditing(false);
            toast.success(response.data.message || "Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to update profile.");
        }
    };

    return (
        <motion.div
            className="min-h-screen bg-white flex items-center justify-center py-8 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <Toaster position="top-right" />

            <div className="bg-blue-50 w-full max-w-2xl p-6 rounded-2xl shadow-xl border-t-4 border-blue-600">
                <div className="flex justify-center mb-6">
                    <div className="relative w-32 h-32">
                        <img
                            src={user.photo}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-full border-4 border-blue-400"
                        />
                    </div>
                </div>

                {!isEditing && (
                    <div className="text-center mb-6">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full font-semibold transition-all hover:scale-105"
                        >
                            Edit Profile
                        </button>
                    </div>
                )}

                {!isEditing ? (
                    <div className="space-y-4 text-blue-800 text-lg">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phoneNumber}</p>
                    </div>
                ) : (
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-blue-700">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={user.name}
                                    onChange={handleChange}
                                    className="w-full p-2 rounded border border-blue-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-blue-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                className="w-full p-2 rounded border border-blue-300"
                            />
                        </div>

                        <div>
                            <label className="text-blue-700">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={user.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-2 rounded border border-blue-300"
                            />
                        </div>

                        <div>
                            <label className="text-blue-700">Upload Profile Photo</label><br />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="mt-2"
                            />
                        </div>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-full transition hover:scale-105"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </motion.div>
    );
};

export default ProfilePage;
