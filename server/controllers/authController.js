// server/controllers/authController.js
const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your custom email utility!
const sendEmail = require('../utils/sendEmail'); 

// Helper function to generate and send OTP
const sendOTP = async (email) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    
    // Save to database
    await Otp.create({ email, otp: otpCode });

    // Use your clean utility to send the email
    await sendEmail({
        email: email,
        subject: 'Your ResuMatch AI Verification Code',
        message: `<h2>Your OTP Code is: <strong>${otpCode}</strong></h2><p>This code will expire in 5 minutes.</p>`
    });
};


// --- STEP 1: INITIATE LOGIN OR REGISTER ---

const initiateRegister = async (req, res) => {
    try {
        const { email } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already exists" });

        await sendOTP(email);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("NODEMAILER ERROR:", err);//new added
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

const initiateLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        await sendOTP(email);
        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        console.error("NODEMAILER ERROR:", err);// New added
        res.status(500).json({ error: "Failed to send OTP" });
    }
};

// --- STEP 2: VERIFY OTP AND FINISH ---

const verifyRegister = async (req, res) => {
    try {
        // 1. Extract the 'role' that the user selected on the frontend
        const { name, email, password, otp, role } = req.body; 
        
        // Check OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ error: "Invalid or expired OTP" });

        // 2. Assign the requested role (defaulting to 'seeker'), unless they are the admin!
        let assignedRole = role || 'seeker';
        if (email === process.env.ADMIN_EMAIL) {
            assignedRole = 'admin';
        }

        // Create User with the correct role
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, role: assignedRole });
        
        // Clean up OTP
        await Otp.deleteMany({ email });

        res.status(201).json({ message: "Registration successful. Please log in." });
    } catch (err) {
        console.error("REGISTRATION CRASH:", err);
        res.status(500).json({ error: "Registration failed" });
    }
};

const verifyLogin = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ error: "Invalid or expired OTP" });

        // Find user and give token
        const user = await User.findOne({ email });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Clean up OTP
        await Otp.deleteMany({ email });

        // 3. IMPORTANT: Send the user's role back so the React Dashboard knows which view to load!
        res.status(200).json({ 
            token, 
            userName: user.name, 
            role: user.role, 
            email: user.email// <--- This is the magic key for the frontend
        });
    } catch (err) {
        res.status(500).json({ error: "Login failed" });
    }
};
// --- NEW FEATURE: RESEND OTP ---

const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        await Otp.deleteMany({ email }); 
        await sendOTP(email);
        
        res.status(200).json({ message: "A new OTP has been sent via Brevo." });
    } catch (err) {
        console.error("Brevo Resend Error:", err);
        res.status(500).json({ error: "Failed to resend OTP" });
    }
};

// --- NEW FEATURE: FORGOT PASSWORD ---

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "No account found with that email." });

        await Otp.deleteMany({ email });
        await sendOTP(email);
        
        res.status(200).json({ message: "OTP sent to email for password reset." });
    } catch (err) {
        console.error("Brevo Forgot Password Error:", err);
        res.status(500).json({ error: "Failed to process request." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // 1. Verify the OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) return res.status(400).json({ error: "Invalid or expired OTP" });

        // 2. Find the user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });

        // 3. CHECK PASSWORD HISTORY
        // A. Check against their CURRENT password
        const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (isSameAsCurrent) {
            return res.status(400).json({ error: "New password cannot be the same as your current password." });
        }

        // B. Check against their PAST passwords
        if (user.passwordHistory && user.passwordHistory.length > 0) {
            for (let oldHashedPassword of user.passwordHistory) {
                const isMatch = await bcrypt.compare(newPassword, oldHashedPassword);
                if (isMatch) {
                    return res.status(400).json({ error: "You have used this password recently. Please choose a different one." });
                }
            }
        }

        // 4. Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update the history array (keep last 3)
        let updatedHistory = user.passwordHistory || [];
        updatedHistory.push(user.password); 

        if (updatedHistory.length > 3) {
            updatedHistory.shift(); 
        }

        // 6. Save the new data
        user.password = hashedNewPassword;
        user.passwordHistory = updatedHistory;
        await user.save();
        
        // 7. Clean up the used OTP
        await Otp.deleteMany({ email });

        res.status(200).json({ message: "Password reset successful! You can now log in." });
    } catch (err) {
        console.error("Reset Error:", err);
        res.status(500).json({ error: "Failed to reset password." });
    }
};

module.exports = { 
    initiateRegister, 
    initiateLogin, 
    verifyRegister, 
    verifyLogin, 
    resendOTP, 
    forgotPassword, 
    resetPassword 
};