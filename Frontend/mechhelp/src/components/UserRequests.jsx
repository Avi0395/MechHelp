// src/components/UserRequests.js
import React, { useEffect, useState } from "react";
import axios from "axios";

function UserRequests() {
    const [requests, setRequests] = useState([]); // Initialize as an array
    const [error, setError] = useState(null);

    const userId = "exampleUserId"; // Replace with actual user ID

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/requests/user/${userId}`);

                // Check if data is an array before setting it
                if (Array.isArray(response.data)) {
                    setRequests(response.data);
                } else {
                    setError("Unexpected response format");
                }
            } catch (err) {
                // Axios automatically handles network errors, so err.response is available
                if (err.response) {
                    // If the error response exists (i.e., backend error)
                    setError(`Error: ${err.response.data.message}`);
                } else {
                    // If the error is something else (e.g., network error)
                    setError(err.message);
                }
            }
        };

        fetchRequests();
    }, [userId]);

    return (
        <div>
            <h2>User Requests</h2>
            {error && <p>{error}</p>}
            <ul>
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <li key={request._id}>
                            <p>Mechanic: {request.mechanicId?.name || "Not Available"}</p>
                            <p>Status: {request.status}</p>
                            <p>Location: {request.userLocation}</p>
                            <p>Problem: {request.message}</p>
                        </li>
                    ))
                ) : (
                    <p>No requests found for this user.</p>
                )}
            </ul>
        </div>
    );
}

export default UserRequests;
