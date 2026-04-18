// server/routes/applicationRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/auth');
const Application = require('../models/Application');
const Job = require('../models/Jobs');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

// 1. Configure Multer to save PDFs locally
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir); // Create folder if it doesn't exist
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Make filename unique
    }
});
const upload = multer({ storage });

// 2. SEEKER: Apply for a job (Uploads PDF)
router.post('/apply', verifyToken, upload.single('resume'), async (req, res) => {
    try {
        const { jobId, recruiterId } = req.body;
        if (!req.file) return res.status(400).json({ error: "Resume PDF is required." });

        const newApp = await Application.create({
            jobId,
            recruiterId,
            seekerId: req.user.id,
            resumePath: req.file.path
        });
        // 2. 🌟 NEW: NOTIFY THE RECRUITER 🌟
        // Fetch the recruiter and the job details
        const recruiter = await User.findById(recruiterId);
        const job = await Job.findById(jobId);
        const seeker = await User.findById(req.user.id);

        if (recruiter && job && seeker) {
            const message = `Hello ${recruiter.name},\n\nGreat news! ${seeker.name} has just applied for your open position: ${job.title}.\n\nLog in to your ResuMatch Recruiter Dashboard to review their resume and ATS score.\n\nBest,\nThe ResuMatch Team`;
            
            // Send the email in the background (don't use await here so it doesn't slow down the UI)
            sendEmail({
                email: recruiter.email,
                subject: `New Applicant for ${job.title}!`,
                message: message
            });
        }
        res.status(201).json({ success: true, data: newApp });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit application." });
    }
});

// 3. RECRUITER: Get applicants for their jobs
router.get('/recruiter/:jobId', verifyToken, async (req, res) => {
    try {
        // Ensure the recruiter asking actually owns this job
        const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user.id });
        if (!job) return res.status(403).json({ error: "Unauthorized access." });

        // Fetch applications and populate the Seeker's details
        const applications = await Application.find({ jobId: req.params.jobId })
            .populate('seekerId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ error: "Failed to load applicants." });
    }
});

module.exports = router;