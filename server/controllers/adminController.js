// server/controllers/adminController.js
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const bcrypt = require('bcryptjs'); // Need this to create users securely
const Job = require('../models/Jobs'); // Adjust this path/name to match your actual Job model!

// 1. Get Platform Stats
const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalAnalyses = await Analysis.countDocuments();

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); 
        sevenDaysAgo.setHours(0, 0, 0, 0); 

        // 1. UPDATED: Group by BOTH Date and Role!
        const userStats = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { 
                $group: { 
                    _id: { 
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        role: "$role" 
                    }, 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        const analysisStats = await Analysis.aggregate([
            { $match: { date: { $gte: sevenDaysAgo } } }, 
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        const chartData = [];
        
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() - i);
            const dateString = targetDate.toISOString().split('T')[0];
            const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' }); 

            // 2. UPDATED: Separate the counts based on the role
            const seekersCount = userStats.find(u => u._id.date === dateString && u._id.role === 'seeker')?.count || 0;
            const recruitersCount = userStats.find(u => u._id.date === dateString && u._id.role === 'recruiter')?.count || 0;
            const analysesCount = analysisStats.find(a => a._id === dateString)?.count || 0;

            chartData.push({
                name: dayName,
                seekers: seekersCount,
                recruiters: recruitersCount,
                analyses: analysesCount
            });
        }

        res.status(200).json({ totalUsers, totalAnalyses, chartData });
        
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
};

// 2. Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

// 3. NEW: Admin creates a user manually
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'user' });
        
        // Remove password before sending back
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({ message: "User created successfully", user: userResponse });
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
};

// 4. NEW: Admin deletes a user & their data
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Don't let the admin delete themselves by accident!
        if (userId === req.user.id) return res.status(400).json({ error: "You cannot delete your own admin account." });

        // Delete the user
        await User.findByIdAndDelete(userId);
        
        // CRITICAL: Delete all analyses belonging to this user so we don't leave junk data
        await Analysis.deleteMany({ userId: userId });

        res.status(200).json({ message: "User and all associated data deleted." });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
};

// 5. NEW: Admin views a specific user's history
const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select('-password');
        const history = await Analysis.find({ userId: userId }).sort({ date: -1 });

        res.status(200).json({ user, history });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user details" });
    }
};
// NEW: Fetch EVERY analysis on the platform
const getAllAnalyses = async (req, res) => {
    try {
        const analyses = await Analysis.find().sort({ date: -1 });
        res.status(200).json(analyses);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch all analyses" });
    }
};
const getAllJobs = async (req, res) => {
    try {
        // Find all jobs and sort by newest first
        const jobs = await Job.find()
            .sort({ createdAt: -1 })
            .populate('recruiterId', 'name email');
        res.status(200).json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
};

const deleteJob = async (req, res) => {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Job deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete job" });
    }
};
// Secret Route
/*const makeMeAdmin = async (req, res) => {
    try {
        const { email } = req.body;
        await User.findOneAndUpdate({ email }, { role: 'admin' });
        res.status(200).json({ message: `${email} is now an Admin!` });
    } catch (err) {
        res.status(500).json({ error: "Failed to update role" });
    }
};*/

// Replace the bottom line with this:
module.exports = { getAdminStats, getAllUsers, createUser, deleteUser, getUserDetails, getAllAnalyses, getAllJobs, deleteJob };