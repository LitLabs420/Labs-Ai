/**
 * GLAMFLOW AI - CORRECTED STRIPE PAYMENT FUNCTIONS
 * Firebase Cloud Functions Edition
 * Replace the existing functions in your functions/index.js with these
 */

// ===== CREATE CHECKOUT SESSION =====
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
    try {
        // Verify user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
        }

        const userId = context.auth.uid;
        const { priceId, userEmail, plan } = data;

        // Validate input
        if (!priceId || !userEmail || !plan) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            customer_email: userEmail,
            
            // Success URL - redirect after payment
            success_url: `${process.env.SITE_URL}/dashboard.html?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${process.env.SITE_URL}/dashboard.html?canceled=true`,
            
            // Pass metadata for later verification
            metadata: {
                userId: userId,
                plan: plan,
                timestamp: new Date().toISOString()
            }
        });

        console.log('✅ Checkout session created:', session.id);

        // Track event
        trackEvent('stripe_checkout_created', {
            sessionId: session.id,
            userId: userId,
            plan: plan
        });

        return {
            sessionId: session.id,
            url: session.url
        };

    } catch (error) {
        console.error('❌ Checkout session error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// ===== HANDLE STRIPE WEBHOOK (Updates when payment succeeds) =====
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).json({ error: 'Signature verification failed' });
    }

    try {
        switch (event.type) {
            // Payment successful - MOST IMPORTANT
            case 'checkout.session.completed':
                console.log('🎉 Payment successful!');
                await handlePaymentSuccess(event.data.object);
                break;

            // Subscription updated
            case 'customer.subscription.updated':
                console.log('📝 Subscription updated');
                await handleSubscriptionUpdated(event.data.object);
                break;

            // Subscription canceled
            case 'customer.subscription.deleted':
                console.log('❌ Subscription canceled');
                await handleSubscriptionCanceled(event.data.object);
                break;

            // Payment failed
            case 'invoice.payment_failed':
                console.log('⚠️ Payment failed');
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Event type ${event.type} not handled`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        res.status(500).json({ error: 'Processing failed' });
    }
});

// ===== HANDLE SUCCESSFUL PAYMENT =====
async function handlePaymentSuccess(session) {
    try {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const amount = session.amount_total / 100;
        const customerEmail = session.customer_email;

        if (!userId) throw new Error('No userId in metadata');

        console.log(`✅ Processing payment: ${userId} → ${plan} ($${amount})`);

        // Get user doc
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error('User not found:', userId);
            throw new Error('User not found');
        }

        // Calculate subscription end date
        const now = new Date();
        const endsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Update user subscription
        await userRef.update({
            'subscription.plan': plan,
            'subscription.status': 'active',
            'subscription.createdAt': admin.firestore.FieldValue.serverTimestamp(),
            'subscription.endsAt': endsAt,
            'stripeCustomerId': session.customer,
            'stripeSessionId': session.id,
            tier: plan, // Also set tier for easy filtering
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create transaction record (FOR YOUR BANK RECONCILIATION)
        await db.collection('transactions').add({
            type: 'payment',
            userId: userId,
            userEmail: customerEmail,
            amount: amount,
            currency: 'USD',
            plan: plan,
            status: 'completed',
            stripeSessionId: session.id,
            stripeCustomerId: session.customer,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                product_id: session.line_items?.[0]?.price?.product,
                description: `${plan.toUpperCase()} Plan - Monthly Subscription`
            }
        });

        console.log(`✅ User ${userId} upgraded to ${plan}`);

        // Send confirmation email
        await sendEmail({
            to: customerEmail,
            subject: '🎉 Welcome to GLAMFLOW AI Pro!',
            html: `
                <h2>Thank you for upgrading!</h2>
                <p>Your subscription to <strong>${plan} Plan</strong> is now active.</p>
                <p><strong>Amount Charged:</strong> $${amount}</p>
                <p><strong>Renewal Date:</strong> ${endsAt.toLocaleDateString()}</p>
                <p>You now have access to all premium features!</p>
                <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Go to Dashboard</a></p>
            `
        });

        // Track event
        trackEvent('payment_successful', {
            userId: userId,
            plan: plan,
            amount: amount
        });

    } catch (error) {
        console.error('❌ Payment processing error:', error);
        throw error;
    }
}

// ===== HANDLE FAILED PAYMENT =====
async function handlePaymentFailed(invoice) {
    try {
        const customerId = invoice.customer;
        const userEmail = invoice.customer_email;

        console.log(`⚠️ Payment failed for: ${userEmail}`);

        // Find user by Stripe customer ID
        const userSnap = await db.collection('users')
            .where('stripeCustomerId', '==', customerId)
            .limit(1)
            .get();

        if (userSnap.empty) {
            console.warn('User not found for Stripe customer:', customerId);
            return;
        }

        const userId = userSnap.docs[0].id;

        // Create failed transaction record
        await db.collection('transactions').add({
            type: 'payment_failed',
            userId: userId,
            userEmail: userEmail,
            amount: invoice.amount_due / 100,
            status: 'failed',
            stripeCustomerId: customerId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            error_code: invoice.last_payment_error?.code
        });

        // Send failure notification email
        await sendEmail({
            to: userEmail,
            subject: '⚠️ Payment Failed - GLAMFLOW AI',
            html: `
                <h2>Payment Failed</h2>
                <p>We couldn't process your payment for GLAMFLOW AI.</p>
                <p>Please update your payment method and try again.</p>
                <p><a href="https://studio-4627045237-a2fe9.web.app/dashboard.html">Update Payment Method</a></p>
            `
        });

    } catch (error) {
        console.error('❌ Payment failure handling error:', error);
    }
}

// ===== HANDLE SUBSCRIPTION CANCELED =====
async function handleSubscriptionCanceled(subscription) {
    try {
        const customerId = subscription.customer;

        // Find user and downgrade to free
        const userSnap = await db.collection('users')
            .where('stripeCustomerId', '==', customerId)
            .limit(1)
            .get();

        if (!userSnap.empty) {
            const userId = userSnap.docs[0].id;
            
            await db.collection('users').doc(userId).update({
                'subscription.status': 'canceled',
                'subscription.endsAt': new Date(),
                tier: 'free'
            });

            console.log(`❌ User ${userId} subscription canceled`);
        }

    } catch (error) {
        console.error('❌ Subscription cancellation error:', error);
    }
}

// ===== SEND EMAIL =====
async function sendEmail({ to, subject, html }) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html
        });
        console.log(`📧 Email sent to ${to}`);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
}

// ===== TRACK EVENT (Analytics) =====
function trackEvent(eventName, data) {
    console.log(`📊 Event: ${eventName}`, data);
    // Could also send to BigQuery or other analytics service
}
