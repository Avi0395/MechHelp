import React, { useEffect, useState } from "react";
import MechanicSideMap from "../components/MechanicSideMap"; // Map component
const API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;

function MechanicRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isServiceCompleted, setIsServiceCompleted] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINT}/mechanic`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched requests:", data);

      if (Array.isArray(data)) {
        const activeRequests = data.filter(
          (req) => req.status === "pending" || req.status === "accepted"
        );
        setRequests(activeRequests);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatLocation = (location) => {
    if (location && typeof location === "object" && location.address) {
      return location.address;
    }
    return "Address not available";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "accepted":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleStatusChange = async (requestId, status) => {
    try {
      const response = await fetch(`${API_ENDPOINT}/m/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ requestId, status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update local state immediately for better UX
      setRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === requestId ? { ...req, status } : req
        ).filter(req => req.status !== "completed") // Remove completed requests from active list
      );
      
      // Don't immediately close modal when service is completed - let it show completion message first
      if (selectedRequest && selectedRequest._id === requestId && status === "completed") {
        setIsServiceCompleted(true);
        // Auto-close modal after 3 seconds to show completion message
        setTimeout(() => {
          setSelectedRequest(null);
          setIsServiceCompleted(false);
        }, 3000);
      }
      
      // Fetch updated data from server
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
    }
  };

  const handleServiceCompleted = async (requestId) => {
    console.log("Service automatically completed for request:", requestId);
    setIsServiceCompleted(true); // Set completion state immediately for UI
    await handleStatusChange(requestId, "completed");
  };

  const handleContainerClick = (request) => {
    if (request.status === "accepted") {
      setSelectedRequest(request);
      setIsServiceCompleted(false); // Reset completion state when opening modal
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">
        🚗 Active Service Requests
      </h2>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500">Loading requests...</p>
      ) : requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="bg-white shadow-md rounded-xl p-5 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-102"
              onClick={() => handleContainerClick(request)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-lg">
                  User: {request.userId?.name || "Unknown"}
                </span>
                <span
                  className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status}
                  {request.status === "accepted" && (
                    <span className="ml-1">📍</span>
                  )}
                </span>
              </div>
              <div className="text-gray-700 text-sm mb-2">
                <p>
                  <span className="font-semibold">Problem:</span>{" "}
                  {request.message}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {formatLocation(request.userLocation)}
                </p>
                <p>
                  <span className="font-semibold">User Phone:</span>{" "}
                  {request.userId?.phoneNumber || "Not available"}
                </p>
                {request.createdAt && (
                  <p>
                    <span className="font-semibold">Requested on:</span>{" "}
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              {request.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(request._id, "accepted");
                    }}
                    className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(request._id, "rejected");
                    }}
                    className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}

              {request.status === "accepted" && (
                <div className="flex gap-2 items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(request._id, "completed");
                    }}
                    className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                  <span className="text-xs text-blue-600 font-medium">
                    📍 Click to view live tracking
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No active service requests assigned to you.
        </p>
      )}

      {/* MAP MODAL - Using simple CSS animations instead of Framer Motion */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => {
            if (!isServiceCompleted) {
              setSelectedRequest(null);
              setIsServiceCompleted(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg p-4 w-[90%] md:w-[60%] h-[80%] relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              Live Location Tracking 🗺️
            </h3>

            <div className="w-full h-full overflow-hidden rounded-lg">
              <MechanicSideMap
                userLocation={selectedRequest?.userLocation?.coordinates}
                mechanicLocation={selectedRequest?.mechanicLocation?.coordinates}
                onServiceCompleted={handleServiceCompleted}
                requestId={selectedRequest?._id}
              />
            </div>

            <button
              onClick={() => {
                setSelectedRequest(null);
                setIsServiceCompleted(false);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors z-10"
            >
              Close
            </button>
            
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm z-10">
              {isServiceCompleted ? "Service Completed! Auto-closing..." : "Auto-complete at 50m range"}
            </div>
          </div>
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MechanicRequests;