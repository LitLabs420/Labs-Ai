const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe (use your secret key)
// Get from: https://dashboard.stripe.com/apikeys
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_SECRET_KEY_HERE');

const db = admin.firestore();

// Cloud Function: Create Stripe Checkout Session
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;
    const { priceId, plan } = data;

    try {
        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // Create or get Stripe customer
        let customerId = userData.stripeCustomerId;
        
        if (!customerId) {
            const customer = await stripeClient.customers.create({
                email: context.auth.token.email,
                metadata: {
                    firebaseUid: userId,
                    displayName: userData.displayName || 'User'
                }
            });
            customerId = customer.id;
            
            // Save customer ID
            await db.collection('users').doc(userId).update({
                stripeCustomerId: customerId
            });
        }

        // Create checkout session
        const session = await stripeClient.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `${process.env.DOMAIN || 'https://studio-4627045237-a2fe9.web.app'}/dashboard.html?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${process.env.DOMAIN || 'https://studio-4627045237-a2fe9.web.app'}/dashboard.html?cancelled=true`,
            metadata: {
                userId: userId,
                plan: plan
            }
        });

        return { sessionId: session.id };
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Cloud Function: Verify Payment
exports.verifyPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { sessionId } = data;
    const userId = context.auth.uid;

    try {
        // Retrieve session from Stripe
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            // Get subscription details
            const subscription = await stripeClient.subscriptions.retrieve(session.subscription);
            
            const plan = session.metadata.plan || 'pro';
            const nextBillingDate = new Date(subscription.current_period_end * 1000);

            // Update Firestore
            await db.collection('users').doc(userId).update({
                subscription: plan,
                subscriptionId: subscription.id,
                stripeCustomerId: session.customer,
                lastPaymentDate: admin.firestore.Timestamp.now(),
                nextBillingDate: nextBillingDate,
                billingStatus: 'active'
            });

            // Log transaction
            await db.collection('transactions').add({
                userId: userId,
                type: 'subscription_upgrade',
                plan: plan,
                amount: subscription.plan.amount / 100, // Convert cents to dollars
                currency: subscription.plan.currency.toUpperCase(),
                stripeSessionId: sessionId,
                timestamp: admin.firestore.Timestamp.now()
            });

            return {
                success: true,
                plan: plan,
                customerId: session.customer,
                subscriptionId: subscription.id,
                nextBillingDate: nextBillingDate
            };
        }

        throw new functions.https.HttpsError('failed-precondition', 'Payment not completed');
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Cloud Function: Create Billing Portal Session
exports.createPortalSession = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData.stripeCustomerId) {
            throw new functions.https.HttpsError('failed-precondition', 'No Stripe customer found');
        }

        const session = await stripeClient.billingPortal.sessions.create({
            customer: userData.stripeCustomerId,
            return_url: `${process.env.DOMAIN || 'https://studio-4627045237-a2fe9.web.app'}/dashboard.html`
        });

        return { url: session.url };
    } catch (error) {
        console.error('Error creating portal session:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Webhook: Handle Stripe Events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_YOUR_WEBHOOK_SECRET';

    let event;

    try {
        event = stripeClient.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await handleInvoicePaid(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handleInvoiceFailed(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionCancelled(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Webhook processing error');
    }
});

// Helper: Handle Invoice Paid
async function handleInvoicePaid(invoice) {
    const customerId = invoice.customer;
    
    // Find user by Stripe customer ID
    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();

    if (userQuery.empty) return;

    const userId = userQuery.docs[0].id;

    // Log transaction
    await db.collection('transactions').add({
        userId: userId,
        type: 'invoice_paid',
        amount: invoice.amount_paid / 100,
        currency: invoice.currency.toUpperCase(),
        stripeInvoiceId: invoice.id,
        timestamp: admin.firestore.Timestamp.now()
    });

    // Update user revenue
    const userDoc = await db.collection('users').doc(userId).get();
    const currentRevenue = userDoc.data().totalRevenue || 0;

    await db.collection('users').doc(userId).update({
        totalRevenue: currentRevenue + (invoice.amount_paid / 100),
        lastPaymentDate: admin.firestore.Timestamp.now()
    });
}

// Helper: Handle Invoice Failed
async function handleInvoiceFailed(invoice) {
    const customerId = invoice.customer;
    
    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();

    if (userQuery.empty) return;

    const userId = userQuery.docs[0].id;

    // Send notification (could implement email here)
    console.log(`Payment failed for user: ${userId}`);

    await db.collection('users').doc(userId).update({
        billingStatus: 'payment_failed'
    });
}

// Helper: Handle Subscription Cancelled
async function handleSubscriptionCancelled(subscription) {
    const customerId = subscription.customer;
    
    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();

    if (userQuery.empty) return;

    const userId = userQuery.docs[0].id;

    await db.collection('users').doc(userId).update({
        subscription: 'free',
        billingStatus: 'cancelled',
        subscriptionId: null
    });
}

// Helper: Handle Subscription Updated
async function handleSubscriptionUpdated(subscription) {
    const customerId = subscription.customer;
    
    const userQuery = await db.collection('users')
        .where('stripeCustomerId', '==', customerId)
        .limit(1)
        .get();

    if (userQuery.empty) return;

    const userId = userQuery.docs[0].id;
    
    // Update subscription status and next billing date
    await db.collection('users').doc(userId).update({
        billingStatus: subscription.status,
        nextBillingDate: new Date(subscription.current_period_end * 1000)
    });
}
