import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import UserSideMap from "../components/UserSideMap"; // Reuse the MechanicSideMap component
const API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;

function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // Store selected request for map

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINT}/user`, {
        withCredentials: true,
      });
      if (Array.isArray(response.data)) {
        const activeRequests = response.data.filter(
          (request) =>
            request.status === "pending" || request.status === "accepted"
        );
        setRequests(activeRequests);
      } else {
        setError("Unexpected response format");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axios.patch(
        `${API_ENDPOINT}/u/status`,
        {
          requestId,
          status: "cancelled",
        },
        {
          withCredentials: true,
        }
      );
      fetchRequests();
    } catch (error) {
      console.error("Error canceling request:", error);
      setError(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto p-4 mt-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            My Active Requests
          </h2>

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {loading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="space-y-6">
              {requests.map((request) => (
                <motion.div
                  key={request._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow-lg rounded-xl p-5 border-2 border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                  onClick={() => setSelectedRequest(request)} // Open map on click
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-xl text-gray-900">
                      Mechanic: {request.mechanicId?.name || "Not assigned yet"}
                    </span>
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="text-gray-700 text-sm mb-3">
                    <p>
                      <span className="font-semibold">Problem:</span>{" "}
                      {request.message}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span>{" "}
                      {formatLocation(request.userLocation)}
                    </p>
                    {request.mechanicId && (
                      <p>
                        <span className="font-semibold">Mechanic Phone:</span>{" "}
                        {request.mechanicId?.phone || "Not available"}
                      </p>
                    )}
                    {request.createdAt && (
                      <p>
                        <span className="font-semibold">Requested on:</span>{" "}
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCancelRequest(request._id)}
                        className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition-all duration-300"
                      >
                        Cancel Request
                      </button>
                    </div>
                  )}

                  {request.status === "accepted" && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-blue-800 text-sm font-medium">
                        A mechanic has accepted your request and is on the way.
                        Please be available at the provided location.
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              You don't have any active service requests.
            </p>
          )}
        </div>
      </main>

      {/* MAP MODAL */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            className="fixed top-0 left-0 z-50 w-full h-full bg-white bg-opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRequest(null)} // Close the map by setting selectedRequest to null
          >
            <motion.div
              className="absolute inset-0 flex justify-center items-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing the map if clicking inside
            >
              <UserSideMap
                userLocation={selectedRequest?.userLocation?.coordinates}
                mechanicLocation={
                  selectedRequest?.mechanicId?.location?.coordinates
                }
              />
            </motion.div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition-all duration-300"
            >
              Close Map
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer>{/* Your footer component */}</footer>
    </div>
  );
}

export default UserRequests;
