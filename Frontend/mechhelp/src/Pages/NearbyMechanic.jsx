import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import socket from "../services/socketService";

const API_ENDPOINT = import.meta.env.VITE_MECHANIC_API_END_POINT;
const REQUEST_API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;
const GEOCODE_API_KEY = import.meta.env.VITE_GEOCODE_API_KEY;

const normalizeLatLng = (loc) => {
    if (!loc || !Array.isArray(loc) || loc.length < 2) return null;
    const a = Number(loc[0]);
    const b = Number(loc[1]);
    if (isNaN(a) || isNaN(b) || (a === 0 && b === 0)) return null;

    if (Math.abs(a) > 50 && Math.abs(b) < 45) {
        return [b, a]; // Return [lat, lng]
    }
    if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
        return [b, a];
    }
    return [a, b];
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        0.5 -
        Math.cos(dLat) / 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        (1 - Math.cos(dLng)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

export default function NearbyMechanic() {
    const [mechanics, setMechanics] = useState([]);
    const [selectedMechanic, setSelectedMechanic] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState("");
    const [customProblem, setCustomProblem] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [userLocation, setUserLocation] = useState({ lat: null, lng: null, address: "" });
    const [radius, setRadius] = useState(20000);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getUserLocation();
    }, []);

    useEffect(() => {
        if (userLocation.lat && userLocation.lng) {
            fetchNearbyMechanics();
        }
    }, [userLocation, radius]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude, address: "" });
                    getAddressFromCoordinates(latitude, longitude);
                },
                (error) => {
                    if (error.code === error.PERMISSION_DENIED) {
                        setError("Location access denied. Please enable location services in your browser.");
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        setError("Position unavailable. Please try again later.");
                    } else if (error.code === error.TIMEOUT) {
                        setError("Location request timed out. Please try again.");
                    } else {
                        setError("An unknown error occurred while accessing location.");
                    }
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
            setLoading(false);
        }
    };

    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const res = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
                params: {
                    q: `${lat},${lng}`,
                    key: GEOCODE_API_KEY,
                    language: "en",
                },
            });
            if (res.data.results.length > 0) {
                const address = res.data.results[0].formatted;
                setUserLocation((prevState) => ({ ...prevState, address }));
            }
        } catch (error) {
            setError("Failed to fetch address.");
        }
    };

    const fetchNearbyMechanics = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_ENDPOINT}/nearby`, {
                params: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                    radius: radius,
                },
            });

            const responseMechanics = res.data.mechanics;

            if (responseMechanics && responseMechanics.length > 0) {
                const sortedMechanics = responseMechanics
                    .map((mech) => {
                        const norm = normalizeLatLng(mech.location?.coordinates);
                        if (norm) {
                            const [lat, lng] = norm;
                            const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
                            return { ...mech, distance };
                        }
                        return null;
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.distance - b.distance);

                setMechanics(sortedMechanics);
                setError("");
            } else {
                setError("No mechanics found in the selected area.");
            }
        } catch (error) {
            setError("Could not fetch nearby mechanics.");
            console.error("Error fetching mechanics:", error);
        }
        setLoading(false);
    };

    const handleRequest = (mechanic) => {
        setSelectedMechanic(mechanic);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalProblem = selectedProblem === "Other" ? customProblem : selectedProblem;
        try {
            // Mongo GeoJSON standard expects [longitude, latitude]
            const userCoords = [userLocation.lng, userLocation.lat];
            const mechCoords = selectedMechanic.location?.coordinates || [userLocation.lng + 0.15, userLocation.lat + 0.15];

            const response = await axios.post(
                `${REQUEST_API_ENDPOINT}/`,
                {
                    mechanicId: selectedMechanic._id,       
                    message: finalProblem,                  
                    userLocation: {
                        type: "Point",
                        coordinates: userCoords,
                        address: userLocation.address        
                    },
                    mechanicLocation: {
                        type: "Point",
                        coordinates: mechCoords,
                        address: selectedMechanic.address   
                    }
                },
                {
                    withCredentials: true
                }
            );

            toast.success(`Request sent to ${selectedMechanic.name} for: ${finalProblem}`);
            setShowForm(false);
            setRequestSent(true);
            
            // Real-time socket emit for immediate frontend sync
            try {
              socket.emit("new_request_created", response.data.request);
            } catch (sErr) {
              console.log("Socket emit note:", sErr);
            }

            setTimeout(() => setRequestSent(false), 4000);
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error("Failed to send request. Try again.");
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 relative p-6">
            <Toaster position="top-center" />

            {userLocation.lat && userLocation.lng && (
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow-md text-sm z-10 text-right">
                    <p className="font-semibold">📍 Your Location</p>
                    <p>{userLocation.address}</p>
                    <p className="text-xs text-gray-500">[{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}]</p>
                </div>
            )}

            <h2 className="text-3xl font-bold text-blue-600 mb-12 text-left">Available Mechanics</h2>

            <div className="text-center mb-6">
                <label className="mr-4 font-semibold">Search Radius:</label>
                <input
                    type="range"
                    min="1000"
                    max="50000"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-2/3"
                />
                <span className="ml-4">{(radius / 1000).toFixed(1)} km</span>
            </div>

            {loading ? (
                <div className="text-center">Loading nearby mechanics...</div>
            ) : (
                <div>
                    {error ? <div className="text-red-600 text-center">{error}</div> : null}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mechanics.map((mechanic) => (
                            <div key={mechanic._id || mechanic.id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-bold text-gray-800">{mechanic.name}</h3>
                                <p className="text-gray-600 mt-1">{mechanic.specializations[0] + "," + mechanic.specializations[1] || "General Mechanic"}</p>
                                <p className="text-gray-700 mt-2">📞 {mechanic.phone || "Not Available"}</p>
                                <p className="text-sm text-gray-500 mt-1">📍 {mechanic.address || "Address not available"}</p>
                                <p className="mt-2 font-semibold text-blue-600">Distance: {mechanic.distance?.toFixed(2)} km</p>
                                <button
                                    onClick={() => handleRequest(mechanic)}
                                    className="bg-blue-600 text-white mt-4 px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Request Service
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 flex justify-center items-center z-20 bg-black bg-opacity-50">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg shadow-md w-80"
                    >
                        <h3 className="text-xl font-semibold mb-4">Request Service</h3>

                        <div>
                            <label className="block font-semibold mb-2">Select Problem</label>
                            <select
                                className="border p-2 w-full rounded"
                                value={selectedProblem}
                                onChange={(e) => setSelectedProblem(e.target.value)}
                                required
                            >
                                <option value="">Select...</option>
                                <option value="Puncture">Puncture</option>
                                <option value="Fuel Problem">Fuel Problem</option>
                                <option value="Engine Issue">Engine Issue</option>
                                <option value="Brake Failure">Brake Failure</option>
                                <option value="Battery Issue">Battery Issue</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        {selectedProblem === "Other" && (
                            <div className="mt-4">
                                <label className="block font-semibold mb-2">Describe the Issue</label>
                                <textarea
                                    className="border p-2 w-full rounded"
                                    rows="3"
                                    value={customProblem}
                                    onChange={(e) => setCustomProblem(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 mt-6 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            )}

            {requestSent && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-lg shadow-lg z-20">
                    Request sent successfully!
                </div>
            )}
        </div>
    );
}

