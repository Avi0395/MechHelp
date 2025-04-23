import React, { useEffect, useState } from "react";
import axios from "axios";

const MechanicRequests = ({ mechanicId }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/requests/mechanic/${mechanicId}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Error fetching mechanic requests:", err));
  }, [mechanicId]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/requests/${id}/status`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  return (
    <div className="p-4 grid gap-4">
      <h2 className="text-xl font-semibold mb-2">Incoming Requests</h2>
      {requests.map((req) => (
        <div key={req._id} className="p-4 bg-white shadow-md rounded-lg">
          <p><strong>User:</strong> {req.userId?.firstName} {req.userId?.lastName}</p>
          <p><strong>Problem:</strong> {req.message}</p>
          <p><strong>Status:</strong> <span className="font-medium text-blue-600">{req.status}</span></p>
          <div className="mt-2 flex gap-2">
            {req.status === "pending" && (
              <>
                <button
                  onClick={() => updateStatus(req._id, "accepted")}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(req._id, "rejected")}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Reject
                </button>
              </>
            )}
            {req.status === "accepted" && (
              <button
                onClick={() => updateStatus(req._id, "completed")}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MechanicRequests;