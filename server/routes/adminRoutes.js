// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const verifyAdmin = require('../middleware/adminAuth');
// Ensure your import looks like this:
const { 
    getAdminStats, getAllUsers, 
    createUser, deleteUser, getUserDetails, getAllAnalyses, getAllJobs, deleteJob
} = require('../controllers/adminController');
//router.post('/upgrade', makeMeAdmin);

// All these routes require a valid token AND an Admin role
router.get('/stats', verifyToken, verifyAdmin, getAdminStats);
router.get('/users', verifyToken, verifyAdmin, getAllUsers);

// NEW ROUTES:
router.post('/users', verifyToken, verifyAdmin, createUser);           // Create User
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);     // Delete User
router.get('/users/:id', verifyToken, verifyAdmin, getUserDetails);    // View User Details
router.get('/analyses', verifyToken, verifyAdmin, getAllAnalyses); // <-- NEW
// Job Management Routes
router.get('/jobs', getAllJobs);
router.delete('/jobs/:id', deleteJob);
module.exports = router;