// server/routes/jobRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { postJob, getRecruiterJobs, updateJob, deleteJob, getInternalMatchedJobs } = require('../controllers/jobController');

// Recruiter Routes
router.post('/post', verifyToken, postJob); 
router.get('/recruiter', verifyToken, getRecruiterJobs); // Fetch their jobs
router.put('/:id', verifyToken, updateJob);              // Edit a job
router.delete('/:id', verifyToken, deleteJob);           // Delete a job

// Seeker Routes
router.get('/matches', verifyToken, getInternalMatchedJobs); 

module.exports = router;