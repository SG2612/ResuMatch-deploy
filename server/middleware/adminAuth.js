// server/middleware/adminAuth.js
const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
    try {
        // req.user.id comes from your existing verifyToken middleware
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: "Access Denied: Requires Admin Privileges" });
        }
        
        next(); // They are an admin, let them through!
    } catch (error) {
        res.status(500).json({ error: "Server error during admin verification" });
    }
};

module.exports = verifyAdmin;