import React, { useEffect, useState } from "react";
import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_REQUEST_API_END_POINT;
const FEEDBACK_API_ENDPOINT = import.meta.env.VITE_FEEDBACK_API_END_POINT;

function UserRequestHistory() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [groupedRequests, setGroupedRequests] = useState({});
    const [feedbackModal, setFeedbackModal] = useState(false);
    const [currentRequest, setCurrentRequest] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedbackSuccess, setFeedbackSuccess] = useState(false);

    const fetchRequestHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_ENDPOINT}/user`, {
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
                return "Service request was declined by mechanic";
            case "cancelled":
                return "You cancelled this request";
            default:
                return "";
        }
    };

    const handleFeedbackClick = (request) => {
        // Check if feedback already exists for this request
        const checkExistingFeedback = async () => {
            try {
                const response = await axios.get(`${FEEDBACK_API_ENDPOINT}/request/${request._id}`, {
                    withCredentials: true
                });

                // If feedback exists, show message
                if (response.data) {
                    alert("You've already provided feedback for this request.");
                    return;
                }

                // If no feedback exists, open the modal
                setCurrentRequest(request);
                setFeedbackModal(true);
            } catch (err) {
                // If error is 404 (feedback not found), open modal
                if (err.response && err.response.status === 404) {
                    setCurrentRequest(request);
                    setFeedbackModal(true);
                } else {
                    console.error("Error checking feedback:", err);
                    setError("Error checking feedback status");
                }
            }
        };

        checkExistingFeedback();
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        try {
            setSubmitting(true);
            console.log("Submitting feedback:", {
                mechanicId: currentRequest.mechanicId._id,
                requestId: currentRequest._id,
                rating,
                comment
            });

            await axios.post(`${FEEDBACK_API_ENDPOINT}/`, {
                mechanicId: currentRequest.mechanicId._id,
                requestId: currentRequest._id,
                rating,
                comment
            }, {
                withCredentials: true
            });

            setFeedbackSuccess(true);
            setTimeout(() => {
                setFeedbackModal(false);
                setFeedbackSuccess(false);
                setRating(0);
                setComment("");
                setCurrentRequest(null);
            }, 2000);

        } catch (err) {
            console.error("Error submitting feedback:", err);
            setError(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    className={`text-2xl ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                    ★
                </button>
            );
        }
        return stars;
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
                                                Mechanic: {request.mechanicId?.name || "Not assigned"}
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
                                            {request.mechanicId && (
                                                <p className="mb-1">
                                                    <span className="font-semibold">Mechanic Phone:</span> {request.mechanicId?.phone || "Not available"}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-3 text-sm italic text-gray-600">
                                            {getStatusExplanation(request.status)}
                                        </div>

                                        {/* Feedback button for completed requests with mechanic assigned */}
                                        {request.status === "completed" && request.mechanicId && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handleFeedbackClick(request)}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
                                                >
                                                    Leave Feedback
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

            {/* Feedback Modal */}
            {feedbackModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full">
                        {feedbackSuccess ? (
                            <div className="text-center">
                                <div className="text-green-500 text-5xl mb-4">✓</div>
                                <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                                <p>Your feedback has been submitted successfully.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold mb-4">
                                    Rate Your Experience with {currentRequest?.mechanicId?.name}
                                </h3>
                                <form onSubmit={handleSubmitFeedback}>
                                    <div className="mb-6">
                                        <label className="block mb-2 font-medium">Rating</label>
                                        <div className="flex space-x-1">
                                            {renderStars()}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label htmlFor="comment" className="block mb-2 font-medium">
                                            Comments (Optional)
                                        </label>
                                        <textarea
                                            id="comment"
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 min-h-24"
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Share your experience..."
                                            maxLength={500}
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md"
                                            onClick={() => {
                                                setFeedbackModal(false);
                                                setRating(0);
                                                setComment("");
                                            }}
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                            disabled={submitting}
                                        >
                                            {submitting ? "Submitting..." : "Submit Feedback"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserRequestHistory;