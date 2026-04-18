// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

// Initialize Razorpay
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
const createOrder = async (req, res) => {
    try {
        const options = {
            amount: 499 * 100, // Amount in PAISE (e.g., ₹499 -> 49900 paise)
            currency: "INR",
            receipt: `receipt_order_${Math.floor(Math.random() * 1000)}`,
        };

        const order = await razorpayInstance.orders.create(options);
        if (!order) return res.status(500).send("Some error occurred");

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: "Failed to create order" });
    }
};

// 2. Verify Payment & Upgrade User
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = req.body;

        // Create the expected signature using your secret key
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        // Check if the signatures match
        if (razorpay_signature === expectedSign) {
            // Payment is legit! Upgrade the user in the database
            await User.findOneAndUpdate(
                { email: email }, 
                { isPro: true }
            );

            return res.status(200).json({ message: "Payment verified successfully. Welcome to Pro!" });
        } else {
            return res.status(400).json({ error: "Invalid signature sent!" });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Failed to verify payment" });
    }
};

module.exports = { createOrder, verifyPayment };