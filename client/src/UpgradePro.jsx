// client/src/components/UpgradePro.jsx
import React from 'react';
import axios from 'axios';

const UpgradePro = ({ userEmail, userName }) => {

    // Helper function to load Razorpay script
    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        // 1. Load Razorpay script
        const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            return;
        }

        try {
            // 2. Ask backend to create an order
            const result = await axios.post('http://localhost:5000/api/payment/create-order');
            const { amount, id: order_id, currency } = result.data;

            // 3. Set up Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Vite env variable
                amount: amount.toString(),
                currency: currency,
                name: "ResuMatch AI",
                description: "Upgrade to Pro Version",
                order_id: order_id,
                
                // 4. Handle success response
                handler: async function (response) {
                    const data = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        email: userEmail // Pass the logged-in user's email to upgrade them
                    };

                    // Send payment details to backend for secure verification
                    const verifyResult = await axios.post('http://localhost:5000/api/payment/verify', data);
                    
                    if (verifyResult.status === 200) {
                        alert("Payment Successful! You are now a Pro user 🚀");
                        // Here you can refresh the page or update global state to show Pro features
                        window.location.reload(); 
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                },
                theme: {
                    color: "#6366f1", // Match this to your app's main color!
                },
            };

            // 5. Open the Razorpay Window
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment initialization failed:", error);
            alert("Something went wrong with the payment setup.");
        }
    };

return (
        <button 
            onClick={handlePayment}
            style={{ padding: '10px 20px', background: 'linear-gradient(135deg, var(--amber-400), var(--amber-500))', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-display)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)', transition: 'transform 0.2s' }} 
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            Upgrade to Pro (₹499)
        </button>
    );
};

export default UpgradePro;