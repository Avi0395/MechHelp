// POST /api/feedback
const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
    try {
      const { mechanicId, requestId, rating, comment } = req.body;
      const userId = req.user.id; // assuming you are using auth middleware and req.user is available
  
      const feedback = new Feedback({
        userId,
        mechanicId,
        requestId,
        rating,
        comment,
      });
  
      await feedback.save();
      res.status(201).json({ message: "Feedback submitted successfully." });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error submitting feedback", error: error.message });
    }
  };
  
  exports.getFeedbacksByMechanic = async (req, res) => {
    try {
      const  mechanicId  = req.mechanic.id;
  
      const feedbacks = await Feedback.find({ mechanicId }).populate('userId', 'name');
      res.status(200).json(feedbacks);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching feedbacks", error: error.message });
    }
  };
  
  exports.getFeedbackByRequest = async (req, res) => {
    try {
      const { requestId } = req.params;  // Get from URL params
      
      const feedback = await Feedback.findOne({ requestId });
      
      if (!feedback) {
        return res.status(404).json({ message: "Feedback not found for this request." });
      }
      
      res.status(200).json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Error fetching feedback", error: error.message });
    }
  };
  
