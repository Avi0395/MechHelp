// src/components/UserRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function UserRequests() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);

    // Get userId from localStorage (or sessionStorage) after login
    const userId = localStorage.getItem("userId"); // Assuming userId is saved in localStorage after login

    useEffect(() => {
        const fetchRequests = async () => {
            if (!userId) {
                setError("User not logged in.");
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/requests/user/${userId}`);
                if (Array.isArray(response.data)) {
                    setRequests(response.data);
                } else {
                    setError("Unexpected response format");
                }
            } catch (err) {
                if (err.response) {
                    setError(`Error: ${err.response.data.message}`);
                } else {
                    setError(err.message);
                }
            }
        };

        fetchRequests();
    }, [userId]);

    const formatLocation = (location) => {
        if (
            location &&
            typeof location === "object" &&
            Array.isArray(location.coordinates) &&
            location.coordinates.length === 2
        ) {
            return `Lat: ${location.coordinates[1]}, Lng: ${location.coordinates[0]}`;
        }
        return "Location not available";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "text-yellow-600 bg-yellow-100";
            case "accepted":
                return "text-blue-600 bg-blue-100";
            case "completed":
                return "text-green-600 bg-green-100";
            case "rejected":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Service Requests</h2>
            {error && <p className="text-red-600 text-center">{error}</p>}
            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request._id}
                            className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">
                                    Mechanic: {request.mechanicId?.name || "Not Available"}
                                </span>
                                <span
                                    className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                                        request.status
                                    )}`}
                                >
                                    {request.status}
                                </span>
                            </div>
                            <div className="text-gray-700 text-sm">
                                <p>
                                    <span className="font-semibold">Problem:</span> {request.message}
                                </p>
                                <p>
                                    <span className="font-semibold">Location:</span>{" "}
                                    {formatLocation(request.userLocation)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No requests found for this user.</p>
            )}
        </div>
    );
}

export default UserRequests;
