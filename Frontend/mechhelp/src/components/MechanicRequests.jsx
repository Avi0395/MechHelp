import React, { useEffect, useState } from "react";
import axios from "axios";
import MechanicLocationMap from "./MechanicMap"; // Adjust the import path if needed

function MechanicRequests() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [mechanicId, setMechanicId] = useState("");
    const [activeRequestId, setActiveRequestId] = useState(null); // New: Track clicked accepted request

    useEffect(() => {
        const mechanicData = JSON.parse(localStorage.getItem("mechanicInfo"));
        if (mechanicData && mechanicData._id) {
            setMechanicId(mechanicData._id);
        } else {
            setError("Mechanic not logged in or ID not found.");
        }
    }, []);

    const fetchRequests = async () => {
        if (!mechanicId) {
            setError("Invalid mechanicId");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:5000/api/requests/mechanic/${mechanicId}`);
            if (Array.isArray(response.data)) {
                setRequests(response.data);
            } else {
                setError("Unexpected response format");
            }
        } catch (err) {
            setError(err.response ? err.response.data.message : err.message);
        }
    };

    useEffect(() => {
        if (mechanicId) {
            fetchRequests();
        }
    }, [mechanicId]);

    const formatLocation = (location) => {
        if (location?.coordinates?.length === 2) {
            return `Lat: ${location.coordinates[1]}, Lng: ${location.coordinates[0]}`;
        }
        return "Location not available";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending": return "text-yellow-600 bg-yellow-100";
            case "accepted": return "text-blue-600 bg-blue-100";
            case "completed": return "text-green-600 bg-green-100";
            case "rejected": return "text-red-600 bg-red-100";
            default: return "text-gray-600 bg-gray-100";
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/requests/${id}/status`, { status });
            fetchRequests(); // Refresh data
        } catch (error) {
            console.error("Error updating status:", error);
            setError("Error updating status.");
        }
    };

    const handleContainerClick = (request) => {
        if (request.status === "accepted") {
            setActiveRequestId(request._id === activeRequestId ? null : request._id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Service Requests</h2>

            {error && <p className="text-red-600 text-center">{error}</p>}

            {requests.length > 0 ? (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request._id}
                            className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                            onClick={() => handleContainerClick(request)}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">
                                    User: {request.userId?.name || "Unknown"}
                                </span>
                                <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}>
                                    {request.status}
                                </span>
                            </div>

                            <div className="text-gray-700 text-sm mb-2">
                                <p><span className="font-semibold">Problem:</span> {request.message}</p>
                                <p><span className="font-semibold">Location:</span> {formatLocation(request.userLocation)}</p>
                            </div>

                            {request.status === "pending" && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent triggering container click
                                            handleStatusChange(request._id, "accepted");
                                        }}
                                        className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleStatusChange(request._id, "rejected");
                                        }}
                                        className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {/* Map will only show when clicking an accepted request */}
                            {request._id === activeRequestId && request.status === "accepted" && (
                                <div className="mt-4">
                                    <MechanicLocationMap mechanicId={mechanicId} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No service requests assigned to you yet.</p>
            )}
        </div>
    );
}

export default MechanicRequests;
