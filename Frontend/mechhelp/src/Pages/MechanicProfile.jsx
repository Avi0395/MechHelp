import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;

const MechanicProfile = () => {
  const navigate = useNavigate();
  // const { id: mechanicId } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [showAvailabilitySidebar, setShowAvailabilitySidebar] = useState(false);

  const [mechanic, setMechanic] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specializations: [],
    serviceTypes: [],
    availability: {
      isAvailable: false,
      workingHours: {
        start: "",
        end: "",
      },
    },
    rating: 0,
    totalCompletedServices: 0,
    verified: false,
    profilePic: "https://raw.githubusercontent.com/SahilMalavi/mechhelp-storage/main/profile.png",
  });

  useEffect(() => {
    fetchMechanicProfile();
  }, []);

  const fetchMechanicProfile = async () => {
    setIsLoading(true);
    toast.info("Loading profile...");
    try {
      const response = await axios.get(`${API_ENDPOINT}/profile`, {
        withCredentials: true,
      });
      setMechanic(prev => ({
        ...prev,
        ...response.data,
        availability: response.data.availability || { isAvailable: false, workingHours: { start: "", end: "" } },
      }));
      toast.dismiss();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    toast.info("Updating profile...");

    try {
      const formData = new FormData();
      formData.append("name", mechanic.name);
      formData.append("phone", mechanic.phone);
      formData.append("address", mechanic.address);
      formData.append("specializations", JSON.stringify(mechanic.specializations));
      formData.append("serviceTypes", JSON.stringify(mechanic.serviceTypes));

      const availabilityData = {
        isAvailable: mechanic.availability.isAvailable,
        workingHours: {
          start: mechanic.availability.workingHours.start,
          end: mechanic.availability.workingHours.end
        }
      };
      formData.append("availability", JSON.stringify(availabilityData));

      // DEBUG: Check what's in the FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await axios.put(`${API_ENDPOINT}/updateprofile`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data', // Make sure this header is set
        },
      });

      setIsEditing(false);
      toast.success(response.data.message || "Profile updated successfully!");
      fetchMechanicProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleAvailabilityChange = async (e) => {
    const isAvailable = e.target.value === "true";
    setIsUpdatingAvailability(true);
    toast.info("Updating availability...");

    try {
      // Updated to match the route pattern
      const response = await axios.put(
        `${API_ENDPOINT}/availability`,
        { isAvailable },
        { withCredentials: true }
      );

      toast.success(response.data.message || "Availability updated!");
      setMechanic(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          isAvailable: isAvailable,
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-xl font-semibold text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Availability Toggle Button */}
      <div className="lg:hidden bg-white border-b p-4">
        <button
          onClick={() => setShowAvailabilitySidebar(!showAvailabilitySidebar)}
          className="w-full flex items-center justify-between bg-blue-50 p-3 rounded-lg border"
        >
          <span className="font-medium">Availability Settings</span>
          <span className={`transform transition-transform ${showAvailabilitySidebar ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Mobile Availability Panel */}
        {showAvailabilitySidebar && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Availability</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="availability"
                  value="true"
                  checked={mechanic.availability.isAvailable}
                  onChange={handleAvailabilityChange}
                  disabled={isUpdatingAvailability}
                  className="text-blue-600"
                />
                <span>Available</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="availability"
                  value="false"
                  checked={!mechanic.availability.isAvailable}
                  onChange={handleAvailabilityChange}
                  disabled={isUpdatingAvailability}
                  className="text-red-600"
                />
                <span>Not Available</span>
              </label>
              {isUpdatingAvailability && (
                <div className="text-sm text-blue-600">Updating...</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar for Availability */}
        <aside className="hidden lg:block w-64 bg-white p-6 border-r">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Availability</h2>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="availability"
                  value="true"
                  checked={mechanic.availability.isAvailable}
                  onChange={handleAvailabilityChange}
                  disabled={isUpdatingAvailability}
                  className="text-blue-600"
                />
                <span>Available</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="availability"
                  value="false"
                  checked={!mechanic.availability.isAvailable}
                  onChange={handleAvailabilityChange}
                  disabled={isUpdatingAvailability}
                  className="text-red-600"
                />
                <span>Not Available</span>
              </label>
              {isUpdatingAvailability && (
                <div className="text-sm text-blue-600">Updating...</div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Profile Content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Your Profile</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                disabled={isLoading}
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture - Static */}
                <div className="flex flex-col items-center">
                  <img
                    src={mechanic.profilePic || "https://raw.githubusercontent.com/SahilMalavi/mechhelp-storage/main/profile.png"}
                    alt="Profile Preview"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-300 mb-4"
                  />
                </div>

                {/* Editable Fields */}
                <InputField label="Name" name="name" value={mechanic.name} onChange={handleInputChange} required />
                <InputField label="Phone" name="phone" value={mechanic.phone} onChange={handleInputChange} required />
                <InputField label="Address" name="address" value={mechanic.address} onChange={handleInputChange} />
                <InputField label="Specializations (comma separated)" name="specializations" value={mechanic.specializations.join(", ")} onChange={handleSpecializationsChange} />
                <InputField label="Service Types (comma separated)" name="serviceTypes" value={mechanic.serviceTypes.join(", ")} onChange={handleServiceTypesChange} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Working Hours Start" name="start" value={mechanic.availability.workingHours.start} onChange={(e) => {
                    setMechanic(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, start: e.target.value },
                      },
                    }));
                  }} />
                  <InputField label="Working Hours End" name="end" value={mechanic.availability.workingHours.end} onChange={(e) => {
                    setMechanic(prev => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        workingHours: { ...prev.availability.workingHours, end: e.target.value },
                      },
                    }));
                  }} />
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6 lg:space-y-8">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={mechanic.profilePic || "https://raw.githubusercontent.com/SahilMalavi/mechhelp-storage/main/profile.png"}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-blue-300 mb-4"
                  />
                  <h3 className="text-xl lg:text-2xl font-semibold">{mechanic.name}</h3>
                  <p className="text-gray-500">{mechanic.verified ? "Verified Mechanic" : "Unverified Mechanic"}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <InfoCard title="Contact Details" items={[
                    { label: "Email", value: mechanic.email },
                    { label: "Phone", value: mechanic.phone },
                    { label: "Address", value: mechanic.address },
                  ]} />
                  <InfoCard title="Workshop Info" items={[
                    { label: "Specializations", value: mechanic.specializations.join(", ") },
                    { label: "Service Types", value: mechanic.serviceTypes.join(", ") },
                    { label: "Working Hours", value: `${mechanic.availability.workingHours.start} - ${mechanic.availability.workingHours.end}` },
                    { label: "Rating", value: mechanic.rating },
                    { label: "Total Services Done", value: mechanic.totalCompletedServices },
                  ]} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, required }) => (
  <div>
    <label className="block text-gray-700 mb-2 text-sm lg:text-base">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 text-sm lg:text-base"
    />
  </div>
);

const InfoCard = ({ title, items }) => (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
    <h4 className="font-semibold text-blue-700 mb-3 text-base lg:text-lg">{title}</h4>
    <div className="space-y-2">
      {items.map((item, index) => (
        <p key={index} className="text-gray-700 text-sm lg:text-base break-words">
          <strong>{item.label}:</strong> {item.value}
        </p>
      ))}
    </div>
  </div>
);

export default MechanicProfile;