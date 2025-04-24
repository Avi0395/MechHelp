import React, { useEffect, useState } from "react";

const USER_API_END_POINT = import.meta.env.VITE_USER_API_END_POINT;

const RequestDashboard = ({ mechanicId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${USER_API_END_POINT}/requests/mechanic/${mechanicId}`);
        const data = await res.json();
        setRequests(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    };

    if (mechanicId) {
      fetchRequests();
    }
  }, [mechanicId]);

  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (requests.length === 0) {
    return <div>No requests available.</div>;
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request._id} className="border p-4 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold">User: {request.userId.name}</h3>
          <p className="text-sm text-gray-600">
            Problem: <strong>{request.message}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Location: {`Lat: ${request.userLocation.coordinates[1]}, Lng: ${request.userLocation.coordinates[0]}`}
          </p>
          <p className="text-sm text-gray-500">Status: {request.status}</p>
        </div>
      ))}
    </div>
  );
};

export default RequestDashboard;
