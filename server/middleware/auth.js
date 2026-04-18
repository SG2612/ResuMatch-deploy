// server/middleware/auth.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Look for the token in the headers
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        // Verify the token and extract the user's ID
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach the ID to the request
        next(); // Move on to the controller
    } catch (err) {
        res.status(400).json({ error: "Invalid or expired token." });
    }
};

module.exports = verifyToken;