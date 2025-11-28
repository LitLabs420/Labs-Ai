// Email notification system for new payments
// Add this to functions/index.js

exports.sendPaymentNotification = functions.https.onCall(async (data, context) => {
    const { userEmail, amount, plan, recipientEmail } = data;
    
    if (!userEmail || !amount || !plan) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }
    
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: recipientEmail || process.env.EMAIL_USER,
            subject: `💰 New Payment Received - ${amount} USD`,
            html: `
                <h2>💰 Payment Received!</h2>
                <p><strong>Customer:</strong> ${userEmail}</p>
                <p><strong>Plan:</strong> ${plan}</p>
                <p><strong>Amount:</strong> $${amount}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                
                <p style="margin-top: 2rem;">
                    <a href="https://dashboard.stripe.com/payments" style="background: #ff0080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        View in Stripe Dashboard
                    </a>
                </p>
                
                <p style="color: #666; margin-top: 2rem; font-size: 0.9rem;">
                    Money will be deposited to your bank account within 2-3 business days.
                </p>
            `
        });
        
        return { success: true, message: 'Email sent' };
    } catch (error) {
        console.error('Email send error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send email');
    }
});

exports.sendSignupNotification = functions.auth.user().onCreate(async (user) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `👤 New Signup - ${user.email}`,
            html: `
                <h2>👤 New User Signed Up!</h2>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                
                <p style="margin-top: 2rem;">
                    Check your dashboard to see who's using GLAMFLOW AI!
                </p>
            `
        });
    } catch (error) {
        console.error('Signup notification error:', error);
    }
});
