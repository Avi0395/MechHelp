import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import profilepic from "../assets/pngegg.png";

const MechanicDashboard = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [mechanic, setMechanic] = useState(null);
  const [updatedData, setUpdatedData] = useState({});
  const [previewImage, setPreviewImage] = useState("");

  const fetchMechanicData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        toast.error("No token found. Please log in again.");
        return;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const mechanicId = decodedToken.id;

      const response = await axios.get(
        `${import.meta.env.VITE_USER_API_END_POINT}/mechanics/profile/${mechanicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMechanic(response.data);
      setUpdatedData({
        name: response.data.name || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
        address: response.data.address || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mechanic data");
    }
  };

  useEffect(() => {
    fetchMechanicData();
  }, []);

  const handleInputChange = (e) => {
    setUpdatedData({
      ...updatedData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatedData({ ...updatedData, profilePic: file });

      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const mechanicId = mechanic._id;

      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("email", updatedData.email);
      formData.append("phone", updatedData.phone);
      formData.append("address", updatedData.address);
      if (updatedData.profilePic) {
        formData.append("profilePic", updatedData.profilePic);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_USER_API_END_POINT}/mechanics/update/${mechanicId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedMechanic = {
        ...response.data,
        profilePic: response.data.profilePic
          ? `${response.data.profilePic}?${Date.now()}`
          : null,
      };

      setMechanic(updatedMechanic);
      setUpdatedData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setPreviewImage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (!mechanic) return <div className="p-6 text-center">Loading...</div>;

  const profileImageSrc = previewImage
    ? previewImage
    : mechanic.profilePic
    ? `${import.meta.env.VITE_USER_API_END_POINT.replace("/api", "")}/uploads/${mechanic.profilePic}`
    : profilepic;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 🌟 Modern Welcome Header */}
      <header className="bg-gray-100 text-black p-6 shadow-lg rounded-b-xl">
        <div className="container mx-auto flex justify-center items-center">
          <h1 className="text-3xl font-semibold tracking-wide">
            👋 Welcome, <span className="text-blue-600">{mechanic.name}</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Profile
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
                />
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-2">
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={updatedData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={updatedData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={updatedData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  src={profileImageSrc}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 mb-4"
                />
                <h3 className="text-2xl font-semibold text-gray-800">
                  {mechanic.name}
                </h3>
                <p className="text-gray-600">Professional Mechanic</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Contact Information
                  </h4>
                  <p className="text-gray-700">Email: {mechanic.email}</p>
                  <p className="text-gray-700">Phone: {mechanic.phone}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Location</h4>
                  <p className="text-gray-700">Address: {mechanic.address}</p>
                  <p className="text-gray-700">
                    Coordinates: {mechanic.location?.coordinates?.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MechanicDashboard;
