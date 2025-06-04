const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/FeedbackController');
const { authenticateUser,authenticateMechanic } = require('../Middleware/authMiddleware'); // Assuming you have auth middleware

// Submit feedback (only logged-in users)
router.post('/', authenticateUser, feedbackController.submitFeedback);

// Get feedbacks for a specific mechanic
router.get('/mechanic', authenticateMechanic,feedbackController.getFeedbacksByMechanic);

// Get feedback by request ID - update to use URL parameter
router.get('/request/:requestId', feedbackController.getFeedbackByRequest);

module.exports = router;
