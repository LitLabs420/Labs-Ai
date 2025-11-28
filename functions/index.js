// ===== GLAMFLOW AI - CLOUD FUNCTIONS =====
// Handles: Stripe/PayPal Webhooks | Email Automation | Affiliate Tracking | Workflow Triggers

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ===== EMAIL CONFIGURATION =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ===== STRIPE WEBHOOK HANDLER =====
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    // ⚠️ SECURITY: Webhook signature verification is MANDATORY
    if (!sig) {
        console.error('Webhook called without signature');
        return res.status(401).json({ error: 'Signature required' });
    }

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Signature verification failed', details: err.message });
    }

    // Validate event structure
    if (!event || !event.type) {
        console.error('Invalid event structure received');
        return res.status(400).json({ error: 'Invalid event structure' });
    }

    try {
        switch (event.type) {
            // Payment successful
            case 'checkout.session.completed':
                console.log('Processing checkout.session.completed:', event.id);
                await handlePaymentSuccess(event.data.object);
                break;

            // Payment failed
            case 'invoice.payment_failed':
                console.log('Processing invoice.payment_failed:', event.id);
                await handlePaymentFailed(event.data.object);
                break;

            // Subscription updated
            case 'customer.subscription.updated':
                console.log('Processing customer.subscription.updated:', event.id);
                await handleSubscriptionUpdated(event.data.object);
                break;

            // Subscription canceled
            case 'customer.subscription.deleted':
                console.log('Processing customer.subscription.deleted:', event.id);
                await handleSubscriptionCanceled(event.data.object);
                break;

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        res.json({ received: true, eventId: event.id });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        // Don't expose internal error details to client
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ===== HANDLE PAYMENT SUCCESS =====
async function handlePaymentSuccess(session) {
    try {
        // ⚠️ SECURITY: Validate input data
        if (!session || !session.id) {
            throw new Error('Invalid session object');
        }

        const userEmail = session.customer_email;
        const planId = session.metadata?.plan;
        const amount = session.amount_total / 100;

        // Validate required fields
        if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
            console.error('❌ Invalid email in session:', userEmail);
            return;
        }

        if (!planId) {
            console.error('❌ No plan ID in session metadata');
            return;
        }

        // Validate amount is reasonable (not negative, not too large)
        if (amount < 0 || amount > 10000) {
            console.error('❌ Suspicious amount:', amount);
            return;
        }

        console.log('Processing successful payment for:', userEmail, 'Amount:', amount);

        // Update user subscription in Firestore
        const userQuery = await db.collection('users').where('email', '==', userEmail).get();
        
        if (userQuery.empty) {
            console.error('❌ User not found:', userEmail);
            // Still log the transaction for manual review
            await db.collection('transactions').add({
                sessionId: session.id,
                email: userEmail,
                amount: amount,
                status: 'user_not_found',
                type: 'Subscription Upgrade',
                timestamp: new Date().toISOString(),
                metadata: { planId }
            });
            return;
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;

        // Map Stripe price to plan
        const planMap = {
            'price_1SYMhF440X4TKc4a2MfVCkFt': 'pro',
            'price_1SYMnG440X4TKc4aVC48Pls5': 'enterprise'
        };

        const plan = planMap[planId];
        if (!plan) {
            console.error('❌ Unknown plan ID:', planId);
            return;
        }

        // Update user
        await db.collection('users').doc(userId).update({
            subscription: plan,
            stripeCustomerId: session.customer,
            subscriptionUpdatedAt: new Date().toISOString(),
            paymentMethod: 'stripe',
            'subscription.status': 'active',
            'subscription.plan': plan,
            'subscription.createdAt': new Date().toISOString()
        });

        // Log transaction
        await db.collection('transactions').add({
            sessionId: session.id,
            userId: userId,
            email: userEmail,
            amount: amount,
            status: 'completed',
            type: 'Subscription Upgrade',
            plan: plan,
            timestamp: new Date().toISOString(),
            metadata: { planId }
        });

        // Send confirmation email
        await sendEmail(userEmail, '🎉 Welcome to GLAMFLOW ' + plan.toUpperCase() + '!', `
            <h2>Subscription Confirmed!</h2>
            <p>Thank you for upgrading to <strong>${plan.toUpperCase()}</strong>.</p>
            <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
            <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
        `);

        console.log('✅ Payment processed successfully for user:', userId);
    } catch (error) {
        console.error('❌ Error processing payment success:', error);
        // Don't throw - log and continue
    }
}

// ===== HANDLE PAYMENT FAILED =====
async function handlePaymentFailed(invoice) {
    try {
        // ⚠️ SECURITY: Validate input data
        if (!invoice || !invoice.id) {
            console.error('❌ Invalid invoice object');
            return;
        }

        const userEmail = invoice.customer_email;
        const amount = invoice.amount_paid / 100;

        if (!userEmail || typeof userEmail !== 'string' || !userEmail.includes('@')) {
            console.error('❌ Invalid email in invoice:', userEmail);
            return;
        }

        console.log('Processing failed payment for:', userEmail);

        // Log failed transaction
        await db.collection('transactions').add({
            userEmail,
            amount,
            type: 'Payment Failed',
            status: 'failed',
            method: 'stripe',
            timestamp: new Date().toISOString(),
            invoiceId: invoice.id
        });

        // Send retry email (dunning)
        await sendEmail(userEmail, '⚠️ Payment Failed - Please Update', `
            <h2>Payment Unsuccessful</h2>
            <p>Your recent payment failed to process.</p>
            <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
            <p>Your subscription may be paused. Please update your payment method to continue service.</p>
            <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Update Payment Method</a></p>
        `);

        console.log(`❌ Payment failed for ${userEmail}`);
    } catch (error) {
        console.error('❌ Error handling payment failure:', error);
    }
}

// ===== HANDLE SUBSCRIPTION UPDATED =====
async function handleSubscriptionUpdated(subscription) {
    console.log('Processing subscription update:', subscription.id);

    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', subscription.customer).get();

    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];

        await db.collection('users').doc(userDoc.id).update({
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionUpdatedAt: new Date().toISOString()
        });
    }
}

// ===== HANDLE SUBSCRIPTION CANCELED =====
async function handleSubscriptionCanceled(subscription) {
    console.log('Processing subscription cancellation:', subscription.id);

    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', subscription.customer).get();

    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        const user = userDoc.data();

        // Downgrade to free
        await db.collection('users').doc(userDoc.id).update({
            subscription: 'free',
            subscriptionStatus: 'canceled',
            subscriptionUpdatedAt: new Date().toISOString()
        });

        // Send goodbye email
        await sendEmail(user.email, 'We\'ll Miss You! 😢', `
            <h2>Subscription Canceled</h2>
            <p>Your ${user.subscription} subscription has been canceled.</p>
            <p>You can still use our free tier. Come back anytime!</p>
            <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Back to Dashboard</a></p>
        `);

        console.log(`😢 User ${user.email} canceled subscription`);
    }
}

// ===== SEND EMAIL =====
async function sendEmail(to, subject, htmlContent) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: linear-gradient(135deg, #00d4ff, #ff0080); padding: 2rem; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0;">✨ GLAMFLOW AI</h1>
                    </div>
                    <div style="background: #f5f5f5; padding: 2rem; border-radius: 0 0 8px 8px;">
                        ${htmlContent}
                        <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 0.9rem;">© 2025 GLAMFLOW AI. All rights reserved.</p>
                    </div>
                </div>
            `
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

// ===== PROCESS REFERRAL COMMISSION =====
async function processReferralCommission(userId, purchaseAmount) {
    // Find referrer
    const referralQuery = await db.collection('referrals')
        .where('referredUserId', '==', userId).get();

    if (!referralQuery.empty) {
        const referral = referralQuery.docs[0].data();
        const affiliateId = referral.affiliateId;
        const commission = purchaseAmount * 0.2; // 20% commission

        // Update affiliate earnings
        await db.collection('affiliates').doc(affiliateId).update({
            earnings: admin.firestore.FieldValue.increment(commission),
            referralCount: admin.firestore.FieldValue.increment(1),
            lastCommissionDate: new Date().toISOString()
        });

        // Log commission transaction
        await db.collection('transactions').add({
            type: 'Referral Commission',
            affiliateId,
            referralUserId: userId,
            amount: commission,
            originalAmount: purchaseAmount,
            status: 'pending_payout',
            timestamp: new Date().toISOString()
        });

        console.log(`💰 Commission $${commission} credited to affiliate ${affiliateId}`);
    }
}

// ===== CREATE CHECKOUT SESSION =====
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { plan, email } = data;
    const priceMap = {
        'pro': 'price_1SYMhF440X4TKc4a2MfVCkFt',
        'enterprise': 'price_1SYMnG440X4TKc4aVC48Pls5'
    };

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: priceMap[plan],
                quantity: 1
            }],
            success_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html?success=true',
            cancel_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html?canceled=true',
            customer_email: email,
            metadata: {
                plan,
                userId: context.auth.uid
            }
        });

        return { sessionId: session.id };
    } catch (error) {
        console.error('Checkout session error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create checkout session');
    }
});

// ===== CREATE PAYPAL PAYMENT =====
exports.createPayPalPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { plan, email } = data;
    const amountMap = { 'pro': 29, 'enterprise': 99 };

    try {
        // In production, use PayPal API
        // This is a placeholder
        return {
            paymentLink: `https://sandbox.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${process.env.PAYPAL_EMAIL}&item_name=GLAMFLOW ${plan.toUpperCase()}&amount=${amountMap[plan]}&return=https://studio-4627045237-a2fe9.web.app/dashboard.html`
        };
    } catch (error) {
        console.error('PayPal payment error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create PayPal payment');
    }
});

// ===== SEND WELCOME EMAIL =====
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    const email = user.email;

    await sendEmail(email, 'Welcome to GLAMFLOW AI! 🎉', `
        <h2>Welcome, ${user.displayName || 'Friend'}!</h2>
        <p>You're now part of the GLAMFLOW AI community.</p>
        <p>Start with our <strong>Free Plan</strong> and upgrade whenever you're ready:</p>
        <ul>
            <li>✅ 10 posts/month</li>
            <li>✅ 100 messages</li>
            <li>✅ Basic support</li>
        </ul>
        <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
    `);
});

// ===== SCHEDULED TASK: SEND UPGRADE REMINDERS =====
exports.sendUpgradeReminders = functions.pubsub
    .schedule('every sunday 09:00')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        const snapshot = await db.collection('users')
            .where('subscription', '==', 'free')
            .where('postsCreated', '>=', 5)
            .get();

        for (const doc of snapshot.docs) {
            const user = doc.data();
            await sendEmail(user.email, '🚀 Ready to Go Pro?', `
                <h2>You're Ready for PRO!</h2>
                <p>You've created ${user.postsCreated} posts and are hitting limits.</p>
                <p>Upgrade to PRO for only <strong>$29/month</strong> and get:</p>
                <ul>
                    <li>500 posts/month (vs 10)</li>
                    <li>10k messages (vs 100)</li>
                    <li>Advanced analytics</li>
                </ul>
                <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Upgrade Now</a></p>
            `);
        }

        console.log(`📧 Sent ${snapshot.docs.length} upgrade reminders`);
        return null;
    });

console.log('🚀 GLAMFLOW AI Cloud Functions initialized');
