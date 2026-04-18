const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

// Import API Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const chatRoutes = require('./routes/chatRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:5173", "https://resumatch-ai-cyan.vercel.app"], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// --- API MODULES ---
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/payment', paymentRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));