const sendEmail = async (options) => {
    const url = 'https://api.brevo.com/v3/smtp/email';

    // 1. Format the data exactly how the Brevo API expects it
    const payload = {
        sender: {
            name: 'ResuMatch AI',
            email: 'noreply@resumatchai.dev' // Your shiny new domain!
        },
        to: [
            { email: options.email }
        ],
        subject: options.subject,
        htmlContent: options.message
    };

    try {
        // 2. Make the direct API call
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        // 3. Handle the response
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            throw new Error("Failed to send email via Brevo API");
        }

        const data = await response.json();
        console.log("Email sent successfully via Brevo API! ID:", data.messageId);

    } catch (error) {
        console.error("Email send failed:", error);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;