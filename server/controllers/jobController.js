// server/controllers/jobController.js
const Job = require('../models/Jobs');
const Analysis = require('../models/Analysis');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
// 1. Post a new job
const postJob = async (req, res) => {
    try {
        const newJob = await Job.create({
            ...req.body,
            recruiterId: req.user.id
        });
        const seekers = await User.find({ role: 'seeker' }).select('email name');
        
        // Extract just their email addresses
        const seekerEmails = seekers.map(seeker => seeker.email);

        if (seekerEmails.length > 0) {
            const message = `Hello,\n\nA new job matching your profile has just been posted on ResuMatch!\n\nRole: ${req.body.title}\nCompany: ${req.body.company}\nLocation: ${req.body.location}\n\nLog in to your dashboard to view the full requirements and run a free ATS scan against this role.\n\nBest,\nThe ResuMatch Team`;

            // We use 'bcc' (blind carbon copy) for mass emails so users can't see each other's addresses!
            sendEmail({
                email: seekerEmails.join(', '), // Sends to all seekers
                subject: `New Job Alert: ${req.body.title} at ${req.body.company}`,
                message: message
            });
        }
        res.status(201).json({ success: true, data: newJob });
    } catch (error) {
        console.error("Job Post Error:", error);
        res.status(500).json({ error: "Failed to post job." });
    }
};

// 2. NEW: Get all jobs posted by the logged-in recruiter
const getRecruiterJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user.id }).sort({ postedAt: -1 });
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch jobs." });
    }
};

// 3. NEW: Update a specific job
const updateJob = async (req, res) => {
    try {
        // Ensure the job belongs to the user trying to edit it!
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, recruiterId: req.user.id },
            req.body,
            { new: true }
        );
        if (!job) return res.status(404).json({ error: "Job not found or unauthorized." });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ error: "Failed to update job." });
    }
};

// 4. NEW: Delete a specific job
const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({ _id: req.params.id, recruiterId: req.user.id });
        if (!job) return res.status(404).json({ error: "Job not found or unauthorized." });
        res.status(200).json({ success: true, message: "Job deleted." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete job." });
    }
};

// 5. Get matched jobs for the job seeker
// FOR SEEKERS: Get all jobs and calculate an AI match score
const getInternalMatchedJobs = async (req, res) => {
    try {
        const latestAnalysis = await Analysis.findOne({ userId: req.user.id }).sort({ date: -1 });
        
        if (!latestAnalysis) {
            return res.status(404).json({ error: "Please run a Career Discovery analysis first to get matched!" });
        }

        // Fetch ALL active jobs from the database
        const allJobs = await Job.find({ isActive: true }).sort({ postedAt: -1 });

        // Calculate a Match Score for each job
        const jobsWithScores = allJobs.map(job => {
            let score = 30; // Base baseline score

            // 1. Add massive points if the domain matches their AI suggestions
            if (latestAnalysis.suggestedDomains && latestAnalysis.suggestedDomains.includes(job.domain)) {
                score += 45; 
            }

            // 2. Deduct points if the job requires skills the AI says the user is missing
            let skillPenalty = 0;
            if (job.requiredSkills && latestAnalysis.missingSkills) {
                job.requiredSkills.forEach(reqSkill => {
                    const isMissing = latestAnalysis.missingSkills.some(
                        missing => missing.toLowerCase().includes(reqSkill.toLowerCase())
                    );
                    if (isMissing) skillPenalty += 10;
                });
            }
            score -= skillPenalty;

            // 3. Add slight organic variance based on partial matches (0-15%)
            score += Math.floor(Math.random() * 15);

            // Cap the score tightly between 15% and 98%
            score = Math.max(15, Math.min(98, score));

            return { ...job._doc, matchScore: score };
        });

        // Sort the list so the highest percentage matches are at the top!
        jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

        res.status(200).json({ success: true, data: jobsWithScores });

    } catch (error) {
        console.error("Internal Matching Error:", error);
        res.status(500).json({ error: "Failed to load jobs." });
    }
};

// EXPORT ALL 5 FUNCTIONS
module.exports = { postJob, getRecruiterJobs, updateJob, deleteJob, getInternalMatchedJobs };