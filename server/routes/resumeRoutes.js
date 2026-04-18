// server/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Import the new chatWithAssistant function
const { analyzeResume, getHistory, getRecommendedJobs, chatWithAssistant, generateInterviewQuestions } = require('../controllers/resumeController');
const verifyToken = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', verifyToken, upload.single('resume'), analyzeResume);
router.get('/history', verifyToken, getHistory);
router.get('/jobs', verifyToken, getRecommendedJobs);
router.post('/interview', verifyToken, upload.single('resume'), generateInterviewQuestions);
// NEW CHAT ROUTE
router.post('/chat', verifyToken, chatWithAssistant); 

module.exports = router;