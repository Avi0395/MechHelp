// import React, { useEffect, useState } from "react";
// import axios from "axios";
// const API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;

// function MechanicRequestHistory() {
//     const [requests, setRequests] = useState([]);
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [groupedRequests, setGroupedRequests] = useState({});

//     const fetchRequestHistory = async () => {
//         try {
//             setLoading(true);
//             const response = await axios.get(`${API_ENDPOINT}/mechanic`, {
//                 withCredentials: true
//             });

//             console.log("Fetched request history:", response.data);
//             if (Array.isArray(response.data)) {
//                 // Filter to show only completed and rejected requests
//                 const historyRequests = response.data.filter(
//                     request => request.status === "completed" || request.status === "rejected"
//                 );

//                 // Sort by date, newest first
//                 historyRequests.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

//                 setRequests(historyRequests);

//                 // Group requests by date
//                 const grouped = groupRequestsByDate(historyRequests);
//                 setGroupedRequests(grouped);
//             } else {
//                 setError("Unexpected response format");
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchRequestHistory();
//     }, []);

//     // Group requests by date (similar to WhatsApp)
//     const groupRequestsByDate = (requests) => {
//         const groups = {};

//         requests.forEach(request => {
//             // Use updatedAt if available, otherwise fallback to createdAt
//             const date = new Date(request.updatedAt || request.createdAt);
//             const dateKey = date.toDateString(); // e.g., "Mon Apr 27 2025"

//             if (!groups[dateKey]) {
//                 groups[dateKey] = [];
//             }

//             groups[dateKey].push(request);
//         });

//         return groups;
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case "completed":
//                 return "text-green-600 bg-green-100";
//             case "rejected":
//                 return "text-red-600 bg-red-100";
//             default:
//                 return "text-gray-600 bg-gray-100";
//         }
//     };

//     // Format time only (hours & minutes)
//     const formatTime = (dateString) => {
//         const date = new Date(dateString);
//         return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     };

//     // Format relative date (Today, Yesterday, or full date)
//     const formatRelativeDate = (dateString) => {
//         const date = new Date(dateString);
//         const today = new Date();
//         const yesterday = new Date();
//         yesterday.setDate(today.getDate() - 1);

//         if (date.toDateString() === today.toDateString()) {
//             return "Today";
//         } else if (date.toDateString() === yesterday.toDateString()) {
//             return "Yesterday";
//         } else {
//             // Format: April 27, 2025
//             return date.toLocaleDateString([], {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric'
//             });
//         }
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             <h2 className="text-2xl font-bold mb-6 text-center">Request History</h2>

//             {error && <p className="text-red-600 text-center mb-4">{error}</p>}

//             {loading ? (
//                 <p className="text-center text-gray-500">Loading request history...</p>
//             ) : Object.keys(groupedRequests).length > 0 ? (
//                 <div className="space-y-6">
//                     {/* Iterate through each date group */}
//                     {Object.keys(groupedRequests).map(dateKey => (
//                         <div key={dateKey} className="space-y-4">
//                             {/* Date header (similar to WhatsApp) */}
//                             <div className="flex justify-center">
//                                 <div className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-sm font-medium">
//                                     {formatRelativeDate(dateKey)}
//                                 </div>
//                             </div>

//                             {/* Requests for this date */}
//                             {groupedRequests[dateKey].map(request => (
//                                 <div
//                                     key={request._id}
//                                     className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
//                                 >
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="font-semibold text-lg">
//                                             {request.userId?.name || "Unknown User"}
//                                         </span>

//                                         <div className="flex items-center space-x-2">
//                                             <span
//                                                 className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(
//                                                     request.status
//                                                 )}`}
//                                             >
//                                                 {request.status}
//                                             </span>
//                                             <span className="text-xs text-gray-500">
//                                                 {formatTime(request.updatedAt || request.createdAt)}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     <div className="text-gray-700 text-sm mb-2">
//                                         <p>
//                                             <span className="font-semibold">Problem:</span> {request.message}
//                                         </p>
//                                         <p className="mt-1">
//                                             <span className="font-semibold">Address:</span>{" "}
//                                             {request.userLocation?.address || "Address not available"}
//                                         </p>
//                                         <p className="mt-1">
//                                             <span className="font-semibold">Phone:</span>{" "}
//                                             {request.userId?.phoneNumber || request.userId?.phone || "Not available"}
//                                         </p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p className="text-center text-gray-500">No completed or rejected requests in your history.</p>
//             )}
//         </div>
//     );
// }

// export default MechanicRequestHistory;

import React, { useEffect, useState } from "react";
import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;
const FEEDBACK_API_ENDPOINT = import.meta.env.VITE_FEEDBACK_API_END_POINT;


function MechanicRequestHistory() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groupedRequests, setGroupedRequests] = useState({});
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState(null);
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    const fetchRequestHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_ENDPOINT}/mechanic`, {
                withCredentials: true
            });

            console.log("Fetched request history:", response.data);

            if (Array.isArray(response.data)) {
                const historyRequests = response.data.filter(
                    request => request.status === "completed" || request.status === "rejected" || request.status === "cancelled"
                );

                historyRequests.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

                setRequests(historyRequests);

                const grouped = groupRequestsByDate(historyRequests);
                setGroupedRequests(grouped);
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
        fetchRequestHistory();
    }, []);

    const groupRequestsByDate = (requests) => {
        const groups = {};

        requests.forEach(request => {
            const date = new Date(request.updatedAt || request.createdAt);
            const dateKey = date.toDateString();
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(request);
        });

        return groups;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "text-green-600 bg-green-100";
            case "rejected":
                return "text-red-600 bg-red-100";
            case "cancelled":
                return "text-gray-600 bg-gray-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatRelativeDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        } else {
            return date.toLocaleDateString([], {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const getStatusExplanation = (status) => {
        switch (status) {
            case "completed":
                return "Service was successfully completed";
            case "rejected":
                return "Service request was declined";
            case "cancelled":
                return "User cancelled this request";
            default:
                return "";
        }
    };

    const handleViewFeedback = async (request) => {
        try {
            setLoadingFeedback(true);
            const response = await axios.get(`${FEEDBACK_API_ENDPOINT}/request/${request._id}`, {
                withCredentials: true
            });

            if (response.data) {
                console.log("Received feedback:", response.data);
                setCurrentFeedback(response.data);
                setFeedbackModal(true);
            } else {
                alert("No feedback found for this request.");
            }
        } catch (err) {
            console.error("Error fetching feedback:", err);
            if (err.response && err.response.status === 404) {
                alert("No feedback has been provided for this request yet.");
            } else {
                setError("Error fetching feedback: " + (err.response?.data?.message || err.message));
            }
        } finally {
            setLoadingFeedback(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span
                    key={i}
                    className={`text-2xl ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="max-w-6xl mx-auto p-6 pb-20">
                <h2 className="text-3xl font-bold mb-8 text-center">Request History</h2>

                {error && <p className="text-red-600 text-center mb-4">{error}</p>}

                {loading ? (
                    <p className="text-center text-gray-500">Loading request history...</p>
                ) : Object.keys(groupedRequests).length > 0 ? (
                    <div className="space-y-10">
                        {Object.keys(groupedRequests).map(dateKey => (
                            <div key={dateKey} className="space-y-6">
                                <div className="flex justify-center">
                                    <div className="bg-gray-300 text-gray-700 px-5 py-1 rounded-full text-sm font-semibold">
                                        {formatRelativeDate(dateKey)}
                                    </div>
                                </div>

                                {groupedRequests[dateKey].map(request => (
                                    <div
                                        key={request._id}
                                        className="bg-white shadow-lg rounded-2xl p-6 border border-gray-300 mx-2 md:mx-0"
                                    >
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                                            <span className="font-semibold text-xl">
                                                Customer: {request.userId?.name || "Unknown User"}
                                            </span>

                                            <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                                <span
                                                    className={`text-sm px-4 py-1 rounded-full font-semibold capitalize ${getStatusColor(request.status)}`}
                                                >
                                                    {request.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(request.updatedAt || request.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-gray-700 text-base mb-3">
                                            <p className="mb-1">
                                                <span className="font-semibold">Problem:</span> {request.message}
                                            </p>
                                            <p className="mb-1">
                                                <span className="font-semibold">Address:</span> {request.userLocation?.address || "Address not available"}
                                            </p>
                                            {request.userId && (
                                                <p className="mb-1">
                                                    <span className="font-semibold">Customer Phone:</span> {request.userId?.phoneNumber || "Not available"}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 text-sm italic text-gray-600">
                                            {getStatusExplanation(request.status)}
                                        </div>

                                        {/* View Feedback button for completed requests */}
                                        {request.status === "completed" && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handleViewFeedback(request)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                                    disabled={loadingFeedback}
                                                >
                                                    {loadingFeedback ? "Loading..." : "View Feedback"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">You don't have any completed or cancelled requests in your history.</p>
                )}
            </div>

            {/* Feedback View Modal */}
            {feedbackModal && currentFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Customer Feedback</h3>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-1">From: {currentFeedback.userId?.name || "Customer"}</p>
                            <p className="text-gray-600 mb-3">Date: {formatDate(currentFeedback.createdAt)}</p>

                            <div className="mb-4">
                                <p className="font-medium mb-1">Rating:</p>
                                <div className="flex">
                                    {renderStars(currentFeedback.rating)}
                                </div>
                            </div>

                            {currentFeedback.comment && (
                                <div>
                                    <p className="font-medium mb-1">Comment:</p>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        {currentFeedback.comment}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                onClick={() => setFeedbackModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MechanicRequestHistory;