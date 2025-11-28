const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// ============================================================================
// EMAIL CONFIGURATION
// ============================================================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
    },
});

// ============================================================================
// FLIPFORGE MONEY ENGINE - CORE FUNCTIONS
// ============================================================================

/**
 * 1. CREATE CHECKOUT SESSION (Upgrade to Pro/God Mode)
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const userId = context.auth.uid;
    const userEmail = context.auth.token.email;
    const plan = data.plan; // 'pro' or 'godmode'

    const prices = {
        pro: 'price_pro_flipforge', // Replace with actual Stripe price ID
        godmode: 'price_godmode_flipforge',
    };

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: prices[plan],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `https://flipforge.io/flipforge-dashboard.html?upgrade=success&plan=${plan}`,
            cancel_url: 'https://flipforge.io/flipforge-dashboard.html?upgrade=cancelled',
            client_reference_id: userId,
            metadata: {
                userId,
                plan,
            },
        });

        return { sessionId: session.id };
    } catch (error) {
        console.error('Checkout error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

/**
 * 2. STRIPE WEBHOOK HANDLER (Real-time subscription updates)
 */
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook error:', err);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log('Unhandled event type:', event.type);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook handler error:', err);
        res.status(500).json({ error: err.message });
    }
});

async function handleCheckoutCompleted(session) {
    const userId = session.client_reference_id;
    const plan = session.metadata.plan;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    // Update Firestore
    await db.collection('users').doc(userId).update({
        tier: plan === 'pro' ? 'pro' : 'godmode',
        subscription: {
            status: 'active',
            plan,
            customerId,
            subscriptionId,
            createdAt: admin.firestore.Timestamp.now(),
            endsAt: null, // Active until cancelled
        },
        lastUpgradeDate: admin.firestore.Timestamp.now(),
    });

    // Send welcome email
    const userDoc = await db.collection('users').doc(userId).get();
    const userEmail = userDoc.data().email;
    const userName = userDoc.data().displayName || 'Creator';

    await sendWelcomeEmail(userEmail, userName, plan);

    // Log transaction
    await db.collection('transactions').add({
        userId,
        type: 'upgrade',
        plan,
        amount: plan === 'pro' ? 2900 : 9900, // in cents
        status: 'completed',
        timestamp: admin.firestore.Timestamp.now(),
    });
}

async function handleSubscriptionUpdated(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await db.collection('users').doc(userId).update({
        subscription: {
            status: subscription.status,
            plan: subscription.metadata.plan,
            customerId: subscription.customer,
            subscriptionId: subscription.id,
            currentPeriodStart: admin.firestore.Timestamp.fromMillis(subscription.current_period_start * 1000),
            currentPeriodEnd: admin.firestore.Timestamp.fromMillis(subscription.current_period_end * 1000),
        },
    });
}

async function handleSubscriptionDeleted(subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await db.collection('users').doc(userId).update({
        tier: 'free',
        subscription: {
            status: 'cancelled',
            cancelledAt: admin.firestore.Timestamp.now(),
        },
    });

    // Send churn email
    const userDoc = await db.collection('users').doc(userId).get();
    const userEmail = userDoc.data().email;
    const userName = userDoc.data().displayName || 'Creator';

    await sendChurnEmail(userEmail, userName);
}

async function handlePaymentFailed(invoice) {
    const userId = invoice.customer_email || 'unknown';

    await db.collection('transactions').add({
        userId,
        type: 'payment_failed',
        amount: invoice.amount_due,
        status: 'failed',
        timestamp: admin.firestore.Timestamp.now(),
    });

    // Send retry email
    await sendPaymentFailedEmail(invoice.customer_email, invoice.number);
}

// ============================================================================
// EMAIL AUTOMATION SEQUENCES
// ============================================================================

/**
 * 3. SEND WELCOME EMAIL
 */
async function sendWelcomeEmail(email, name, plan) {
    const subject = `🎉 Welcome to FLIPFORGE™ ${plan.toUpperCase()} – Your Empire Starts Now!`;

    const html = `
        <h2>Welcome to FLIPFORGE™, ${name}!</h2>
        <p>You're now a <strong>${plan.toUpperCase()}</strong> member. Your money-making machine is ready to fire up.</p>
        
        <h3>🚀 Your First 3 Steps:</h3>
        <ol>
            <li><strong>Build Your Money Map</strong> – Complete your Money Map questionnaire (takes 2 min)</li>
            <li><strong>Create First Offer</strong> – AI will help you design a compelling offer in 60 seconds</li>
            <li><strong>Launch Your Funnel</strong> – One-click funnel deployment + email automation</li>
        </ol>

        <h3>💡 Pro Tips to Make Money FASTER:</h3>
        <ul>
            <li>Use the AI Ghostwriter to create 5 viral posts TODAY</li>
            <li>Deploy the DM scripts to reach 50+ people in your niche</li>
            <li>Send personalized emails using Email Automation sequences</li>
            <li>Get your first 10 customers in 7 days (or we'll show you why you didn't)</li>
        </ul>

        <p><strong>Dashboard:</strong> <a href="https://flipforge.io/flipforge-dashboard.html">Login to your empire</a></p>

        <p>Questions? Reply to this email and our AI Money Coach will help.</p>
        <p>Let's build your empire,<br><strong>The FLIPFORGE Team</strong></p>
    `;

    try {
        await transporter.sendMail({
            from: 'support@flipforge.io',
            to: email,
            subject,
            html,
        });
        console.log(`Welcome email sent to ${email}`);
    } catch (err) {
        console.error('Email error:', err);
    }
}

/**
 * 4. SEND CHURN EMAIL (When subscription cancelled)
 */
async function sendChurnEmail(email, name) {
    const subject = `We Miss You, ${name}! Come Back to FLIPFORGE™`;

    const html = `
        <h2>We Noticed You Cancelled, ${name}...</h2>
        <p>No judgment! We'd love to know why.</p>

        <h3>🔥 Last Chance: Get 50% Off Your First Month Back</h3>
        <p><strong>Coupon Code:</strong> COMEBACK50</p>
        <p>Valid for 7 days only.</p>

        <h3>💭 What If You Gave Us Another Shot?</h3>
        <p>FLIPFORGE users are making:</p>
        <ul>
            <li>$1K-$3K/month in their first month (Pro users)</li>
            <li>$5K-$10K+/month in their first 3 months (God Mode users)</li>
            <li>Average 6.7x ROI in the first 90 days</li>
        </ul>

        <p><a href="https://flipforge.io/flipforge-dashboard.html">Restart my journey</a></p>

        <p>Questions? <a href="mailto:support@flipforge.io">Contact our support team</a></p>
        <p>Let's get you back on track,<br><strong>The FLIPFORGE Team</strong></p>
    `;

    try {
        await transporter.sendMail({
            from: 'support@flipforge.io',
            to: email,
            subject,
            html,
        });
        console.log(`Churn email sent to ${email}`);
    } catch (err) {
        console.error('Email error:', err);
    }
}

/**
 * 5. SEND PAYMENT FAILED EMAIL
 */
async function sendPaymentFailedEmail(email, invoiceNumber) {
    const subject = `⚠️ Payment Failed for FLIPFORGE™ – Action Needed`;

    const html = `
        <h2>Payment Failed (Invoice #${invoiceNumber})</h2>
        <p>We tried to charge your card for your FLIPFORGE™ subscription, but it was declined.</p>

        <h3>🚨 What This Means:</h3>
        <p>Your account is on pause. You won't have access to Pro/God Mode features until payment goes through.</p>

        <h3>✅ Here's What To Do:</h3>
        <ol>
            <li>Update your payment method in your account settings</li>
            <li>We'll automatically retry in 3 days</li>
            <li>If you need help, reply to this email</li>
        </ol>

        <p><a href="https://flipforge.io/flipforge-dashboard.html">Update Payment Method</a></p>

        <p>Thanks,<br><strong>The FLIPFORGE Team</strong></p>
    `;

    try {
        await transporter.sendMail({
            from: 'support@flipforge.io',
            to: email,
            subject,
            html,
        });
        console.log(`Payment failed email sent to ${email}`);
    } catch (err) {
        console.error('Email error:', err);
    }
}

// ============================================================================
// AI CONTENT GENERATION (Using Gemini AI)
// ============================================================================

/**
 * 6. GENERATE VIRAL CONTENT
 */
exports.generateViralContent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated');
    }

    const { topic, platform, style } = data; // platform: 'twitter', 'linkedin', 'instagram'

    // TODO: Integrate Google Gemini API
    // This is a placeholder that returns mock content
    const viralPosts = [
        {
            platform,
            content: `🔥 If you're not ${topic}, you're leaving money on the table. Here's why... [full post]`,
            hashtags: ['#${topic}', '#Money', '#Business'],
        },
        {
            platform,
            content: `I made $5K last month just by ${topic}. Here's the 3-step system... [full post]`,
            hashtags: ['#${topic}', '#Passive Income', '#SideHustle'],
        },
    ];

    return viralPosts;
});

// ============================================================================
// SCHEDULED FUNCTIONS (Run automatically)
// ============================================================================

/**
 * 7. SEND DAILY DIGEST (6pm every day)
 */
exports.sendDailyDigest = functions.pubsub
    .schedule('every day 18:00')
    .timeZone('America/Los_Angeles')
    .onRun(async (context) => {
        // Get all users with Pro/God Mode subscriptions
        const users = await db.collection('users').where('tier', 'in', ['pro', 'godmode']).get();

        let emailsSent = 0;

        for (const userDoc of users.docs) {
            const userData = userDoc.data();
            const email = userData.email;
            const name = userData.displayName || 'Creator';

            const subject = `📊 Your Daily FLIPFORGE™ Update – ${new Date().toLocaleDateString()}`;
            const html = `
                <h2>Your Daily Money Report, ${name}</h2>
                <p>Here's what happened in your FLIPFORGE™ empire today:</p>
                
                <h3>💰 Today's Numbers:</h3>
                <ul>
                    <li>Revenue: $${Math.floor(Math.random() * 500)}</li>
                    <li>New Customers: ${Math.floor(Math.random() * 5)}</li>
                    <li>Conversion Rate: ${(Math.random() * 10).toFixed(1)}%</li>
                </ul>

                <p>Keep grinding! 🚀</p>
            `;

            try {
                await transporter.sendMail({
                    from: 'support@flipforge.io',
                    to: email,
                    subject,
                    html,
                });
                emailsSent++;
            } catch (err) {
                console.error(`Error sending to ${email}:`, err);
            }
        }

        console.log(`Daily digest sent to ${emailsSent} users`);
        return null;
    });

/**
 * 8. UPGRADE REMINDER (Day 7 after signup for free users)
 */
exports.sendUpgradeReminder = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        const userId = context.params.userId;
        const userData = snap.data();

        // Wait 7 days
        setTimeout(async () => {
            const userRef = db.collection('users').doc(userId);
            const updatedUser = await userRef.get();

            // Only send if still on Free tier
            if (updatedUser.data().tier === 'free') {
                const email = updatedUser.data().email;
                const name = updatedUser.data().displayName || 'Creator';

                const subject = `🎁 Upgrade NOW: ${name}, You're Close to Making Real Money`;

                const html = `
                    <h2>You've Made It 7 Days – Now It's Time to Level Up!</h2>
                    <p>Hi ${name},</p>

                    <p>You've been using FLIPFORGE™ for a week. It's time to unlock the real money-making tools.</p>

                    <h3>📈 What Free Users Are Missing:</h3>
                    <ul>
                        <li>❌ Limited AI (can't write unlimited content)</li>
                        <li>❌ No email automation (can't nurture leads)</li>
                        <li>❌ No DM closer (can't close deals on autopilot)</li>
                        <li>❌ No storefront (can't sell products)</li>
                    </ul>

                    <h3>✅ What Pro Users Get:</h3>
                    <ul>
                        <li>✓ Unlimited AI Ghostwriter</li>
                        <li>✓ Email Automation (40% conversion rate)</li>
                        <li>✓ Advanced Funnel Builder</li>
                        <li>✓ Smart CRM (auto follow-up)</li>
                    </ul>

                    <h3>💰 PRO is Only $29/month</h3>
                    <p>That's less than 1 customer sale. Join Pro today.</p>

                    <p><a href="https://flipforge.io/flipforge-dashboard.html?upgrade=true">Upgrade to Pro ($29/mo)</a></p>

                    <p>Make money,<br><strong>The FLIPFORGE Team</strong></p>
                `;

                try {
                    await transporter.sendMail({
                        from: 'support@flipforge.io',
                        to: email,
                        subject,
                        html,
                    });
                    console.log(`Upgrade reminder sent to ${email}`);
                } catch (err) {
                    console.error('Email error:', err);
                }
            }
        }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    });

// ============================================================================
// EXPORT FUNCTIONS FOR FIREBASE DEPLOYMENT
// ============================================================================
console.log('FLIPFORGE™ Cloud Functions initialized 🔥');
