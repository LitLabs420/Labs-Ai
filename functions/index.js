// ===== GLAMFLOW AI - CLOUD FUNCTIONS =====
// Handles: Stripe/PayPal Webhooks | Email Automation | Affiliate Tracking | Workflow Triggers

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ===== VALIDATE CONFIGURATION =====
function validateConfiguration() {
    const requiredEnvVars = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ CRITICAL: Missing required environment variables:', missingVars);
    }
    
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (!emailConfigured) {
        console.warn('⚠️ WARNING: Email credentials not configured. Confirmation emails will NOT send.');
        console.warn('⚠️ Set email credentials using: firebase functions:config:set email.user="..." email.pass="..."');
    }
    
    return { 
        stripeConfigured: missingVars.length === 0,
        emailConfigured 
    };
}

// Run validation on startup
const config = validateConfiguration();

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

        // Handle LIFETIME purchases
        if (planId === 'lifetime') {
            await db.collection('users').doc(userId).update({
                tier: 'lifetime',
                subscription: 'lifetime',
                stripeCustomerId: session.customer,
                subscriptionUpdatedAt: new Date().toISOString(),
                paymentMethod: 'stripe',
                lifetimeAccessGrantedAt: new Date().toISOString(),
                status: 'active'
            });

            console.log('✅ Lifetime access granted to:', userEmail);

            // Send lifetime welcome email
            await sendEmail(userEmail, '🔥 Welcome to GLAMFLOW AI LIFETIME! 🔥', `
                <h2>You Own GLAMFLOW AI Forever!</h2>
                <p>Thank you for the <strong>$200 one-time payment</strong> for lifetime access.</p>
                <p>You now have:</p>
                <ul>
                    <li>✅ All Enterprise features forever</li>
                    <li>✅ Every future update included</li>
                    <li>✅ Lifetime priority support</li>
                    <li>✅ No monthly fees ever</li>
                </ul>
                <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
            `);
        } else {
            // Handle regular subscription updates
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
                tier: plan,
                subscription: {
                    plan: plan,
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                subscriptionUpdatedAt: new Date().toISOString(),
                paymentMethod: 'stripe',
                status: 'active'
            });

            console.log('✅ Subscription updated for:', userEmail, 'Plan:', plan);

            // Send confirmation email with plan details
            const planDetails = {
                'pro': { price: '$29/month', features: 'Advanced features + Priority support' },
                'enterprise': { price: '$99/month', features: 'Everything + Custom integrations' },
                'lifetime': { price: 'One-time', features: 'Lifetime access to all features' }
            };
            const details = planDetails[plan] || { price: 'Custom', features: 'Custom plan' };
            
            await sendEmail(userEmail, '🎉 Welcome to GLAMFLOW AI ' + plan.toUpperCase() + '!', `
                <h2>Subscription Confirmed!</h2>
                <p>Thank you for upgrading to <strong>${plan.toUpperCase()}</strong> (${details.price}).</p>
                <p>You now have: ${details.features}</p>
                <p>Amount: <strong>$${amount.toFixed(2)}</strong></p>
                <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
            `);
        }

        // Log transaction
        await db.collection('transactions').add({
            sessionId: session.id,
            userId: userId,
            email: userEmail,
            amount: amount,
            status: 'completed',
            type: planId === 'lifetime' ? 'Lifetime Purchase' : 'Subscription Upgrade',
            plan: planId,
            timestamp: new Date().toISOString(),
            metadata: { planId }
        });

        // Process referral commission (if applicable)
        if (userId && amount > 0) {
            await processReferralCommission(userId, amount);
        }

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
    try {
        console.log('Processing subscription update:', subscription.id);

        if (!subscription || !subscription.customer) {
            console.error('❌ Invalid subscription object');
            return;
        }

        const userQuery = await db.collection('users')
            .where('stripeCustomerId', '==', subscription.customer).get();

        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            const items = subscription.items?.data || [];
            const priceId = items[0]?.price?.id;

            // Map price ID to plan
            const planMap = {
                'price_1SYMhF440X4TKc4a2MfVCkFt': 'pro',
                'price_1SYMnG440X4TKc4aVC48Pls5': 'enterprise'
            };

            await db.collection('users').doc(userDoc.id).update({
                stripeSubscriptionId: subscription.id,
                subscription: {
                    status: subscription.status,
                    plan: planMap[priceId] || 'unknown'
                },
                subscriptionUpdatedAt: new Date().toISOString()
            });
            console.log('✅ Subscription updated for:', userDoc.id);
        }
    } catch (error) {
        console.error('❌ Error updating subscription:', error);
    }
}

// ===== HANDLE SUBSCRIPTION CANCELED =====
async function handleSubscriptionCanceled(subscription) {
    try {
        console.log('Processing subscription cancellation:', subscription.id);

        if (!subscription || !subscription.customer) {
            console.error('❌ Invalid subscription object');
            return;
        }

        const userQuery = await db.collection('users')
            .where('stripeCustomerId', '==', subscription.customer).get();

        if (!userQuery.empty) {
            const userDoc = userQuery.docs[0];
            const user = userDoc.data();

            // Downgrade to free
            await db.collection('users').doc(userDoc.id).update({
                tier: 'free',
                subscription: {
                    plan: 'free',
                    status: 'canceled'
                },
                subscriptionUpdatedAt: new Date().toISOString(),
                status: 'active'
            });

            // Send goodbye email
            if (user.email) {
                await sendEmail(user.email, 'We\'ll Miss You! 😢', `
                    <h2>Subscription Canceled</h2>
                    <p>Your subscription has been canceled.</p>
                    <p>You can still use our free tier. Come back anytime!</p>
                    <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Back to Dashboard</a></p>
                `);
            }

            console.log(`😢 User ${user.email} canceled subscription`);
        }
    } catch (error) {
        console.error('❌ Error canceling subscription:', error);
    }
}

// ===== SEND EMAIL =====
async function sendEmail(to, subject, htmlContent) {
    try {
        // Validate email
        if (!to || typeof to !== 'string' || !to.includes('@')) {
            console.error('❌ Invalid email address:', to);
            return false;
        }

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️ Email credentials not configured, skipping email to:', to);
            return false;
        }

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
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return false;
    }
}

// ===== PROCESS REFERRAL COMMISSION =====
async function processReferralCommission(userId, purchaseAmount) {
    try {
        if (!userId || !purchaseAmount || purchaseAmount <= 0) {
            console.error('❌ Invalid referral commission parameters');
            return;
        }

        // Find referrer
        const referralQuery = await db.collection('referrals')
            .where('referredUserId', '==', userId).get();

        if (!referralQuery.empty) {
            const referral = referralQuery.docs[0].data();
            const affiliateId = referral.affiliateId;
            const commission = purchaseAmount * 0.2; // 20% commission

            if (!affiliateId) {
                console.error('❌ No affiliate ID in referral');
                return;
            }

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

            console.log(`💰 Commission $${commission.toFixed(2)} credited to affiliate ${affiliateId}`);
        }
    } catch (error) {
        console.error('❌ Error processing referral commission:', error);
    }
}

// ===== CREATE CHECKOUT SESSION =====
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { plan, email } = data;
    
    // Map of plan IDs to Stripe price IDs
    const priceMap = {
        'pro': 'price_1SYMhF440X4TKc4a2MfVCkFt',        // $29/month
        'enterprise': 'price_1SYMnG440X4TKc4aVC48Pls5'   // $99/month
    };

    try {
        // Create line item with dynamic amount if price not in map
        let lineItem = {};
        if (priceMap[plan]) {
            lineItem = {
                price: priceMap[plan],
                quantity: 1
            };
        } else {
            console.error('❌ Unknown plan:', plan);
            throw new functions.https.HttpsError('invalid-argument', 'Invalid plan specified');
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [lineItem],
            success_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html?session_id={CHECKOUT_SESSION_ID}',
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

// ===== CREATE LIFETIME ONE-TIME PURCHASE =====
exports.createLifetimePurchase = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { email } = data;
    const userId = context.auth.uid;

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',  // ONE-TIME payment, not subscription
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'GLAMFLOW AI Lifetime Access',
                        description: 'One-time payment for lifetime access to all features, updates, and priority support'
                    },
                    unit_amount: 20000  // $200 in cents
                },
                quantity: 1
            }],
            success_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html?canceled=true',
            customer_email: email,
            metadata: {
                plan: 'lifetime',
                userId: userId,
                type: 'lifetime_access'
            }
        });

        return { sessionId: session.id };
    } catch (error) {
        console.error('Lifetime purchase error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create lifetime purchase');
    }
});

// ===== CREATE PORTAL SESSION (for subscription management) =====
exports.createPortalSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const userId = context.auth.uid;
    
    try {
        // Get user's Stripe customer ID
        const userDoc = await db.collection('users').doc(userId).get();
        const stripeCustomerId = userDoc.data()?.stripeCustomerId;

        if (!stripeCustomerId) {
            throw new functions.https.HttpsError('not-found', 'No Stripe customer found');
        }

        // Create portal session for managing subscriptions
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: 'https://studio-4627045237-a2fe9.web.app/dashboard.html',
        });

        return { url: session.url };
    } catch (error) {
        console.error('Portal session error:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create portal session');
    }
});

// ===== SEND WELCOME EMAIL (triggered on user creation) =====
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    try {
        const email = user.email;

        await sendEmail(email, 'Welcome to GLAMFLOW AI! 🎉', `
            <h2>Welcome, ${user.displayName || 'Friend'}!</h2>
            <p>You're now part of the GLAMFLOW AI community.</p>
            <p>Start with our <strong>Free Plan</strong> and upgrade whenever you're ready:</p>
            <ul>
                <li>✅ All core features</li>
                <li>✅ Community support</li>
                <li>✅ Free tier limits</li>
            </ul>
            <p><strong>Ready to upgrade?</strong></p>
            <ul>
                <li>📈 Pro: $29/month</li>
                <li>🚀 Enterprise: $99/month</li>
            </ul>
            <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
        `);
        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
});

// ===== SCHEDULED TASK: SEND UPGRADE REMINDERS (Weekly) =====
exports.sendUpgradeReminders = functions.pubsub
    .schedule('every sunday 09:00')
    .timeZone('America/New_York')
    .onRun(async (context) => {
        try {
            const snapshot = await db.collection('users')
                .where('tier', '==', 'free')
                .get();

            let emailCount = 0;
            for (const doc of snapshot.docs) {
                const user = doc.data();
                if (user.email) {
                    await sendEmail(user.email, '🚀 Upgrade Your GLAMFLOW AI Account', `
                        <h2>Ready to Unlock More Power?</h2>
                        <p>Hi ${user.displayName || 'Friend'}!</p>
                        <p>You're using GLAMFLOW AI's Free tier. Ready for more?</p>
                        <p>Upgrade to unlock:</p>
                        <ul>
                            <li>📈 <strong>Pro</strong> ($29/month) - Advanced features + priority support</li>
                            <li>🚀 <strong>Enterprise</strong> ($99/month) - Everything + custom integrations</li>
                        </ul>
                        <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">View Plans</a></p>
                    `);
                    emailCount++;
                }
            }

            console.log(`📧 Sent ${emailCount} upgrade reminders`);
            return null;
        } catch (error) {
            console.error('Error sending upgrade reminders:', error);
            return null;
        }
    });

console.log('🚀 GLAMFLOW AI Cloud Functions initialized');
