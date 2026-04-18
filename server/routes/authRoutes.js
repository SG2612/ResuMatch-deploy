// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { 
    initiateRegister, initiateLogin, verifyRegister, verifyLogin,
    resendOTP, forgotPassword, resetPassword 
} = require('../controllers/authController');

router.post('/register', initiateRegister);
router.post('/login', initiateLogin);
router.post('/verify-register', verifyRegister);
router.post('/verify-login', verifyLogin);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;