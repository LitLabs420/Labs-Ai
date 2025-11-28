/**
 * GLAMFLOW AI - Corrected Stripe Configuration
 * Firebase Cloud Functions Integration (NOT Netlify)
 * This version uses Firebase Cloud Functions endpoints
 */

const STRIPE_CONFIG = {
    // Publishable key - safe for frontend
    // Get from: https://dashboard.stripe.com/apikeys
    // Copy: Publishable key (starts with pk_live_)
    publishableKey: 'pk_live_YOUR_PUBLISHABLE_KEY_HERE', // ← REPLACE WITH YOUR KEY
    
    // Price IDs from Stripe Dashboard
    // Get from: https://dashboard.stripe.com/products
    priceIds: {
        pro: 'price_1SYMhF440X4TKc4a2MfVCkFt',      // $29/month
        enterprise: 'price_1SYMnG440X4TKc4aVC48Pls5' // $99/month
    },
    
    // Firebase Cloud Functions region
    // Usually 'us-central1' - verify in Firebase Console → Functions
    region: 'us-central1'
};

// Initialize Stripe
let stripe = null;

async function initStripe() {
    if (!stripe && STRIPE_CONFIG.publishableKey && STRIPE_CONFIG.publishableKey !== 'pk_live_YOUR_PUBLISHABLE_KEY_HERE') {
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
    }
    return stripe;
}

/**
 * Create Checkout Session via Firebase Cloud Function
 * This is the CORRECT endpoint for Firebase Hosting
 */
async function createCheckoutSession(planType) {
    try {
        if (!currentUser || !currentUser.uid) {
            alert('❌ Please log in to upgrade.');
            trackEvent('upgrade_failed_no_auth');
            return;
        }

        const priceId = STRIPE_CONFIG.priceIds[planType];
        if (!priceId) {
            alert('❌ Invalid plan selected.');
            return;
        }

        // Show loading state
        showLoading(true);
        trackEvent('checkout_session_starting', { plan: planType });

        // Get auth token
        const idToken = await currentUser.getIdToken();
        
        // Firebase Cloud Function endpoint (CORRECT for Firebase Hosting)
        const functionUrl = `https://${STRIPE_CONFIG.region}-studio-4627045237-a2fe9.cloudfunctions.net/createCheckoutSession`;
        
        console.log('Creating checkout session with endpoint:', functionUrl);

        // Call Cloud Function with 10-second timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                    'X-Request-ID': Date.now().toString()  // Idempotency key
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: currentUser.uid,
                    userEmail: currentUser.email,
                    plan: planType,
                    displayName: currentUser.displayName || 'User'
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.sessionId) {
                throw new Error('No session ID returned from server');
            }

            console.log('✅ Checkout session created:', data.sessionId);
            trackEvent('checkout_session_created', { 
                sessionId: data.sessionId, 
                plan: planType 
            });

            // Redirect to Stripe Checkout
            const stripeInstance = await initStripe();
            if (!stripeInstance) {
                throw new Error('Stripe failed to initialize');
            }

            const result = await stripeInstance.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

        } catch (abortError) {
            if (abortError.name === 'AbortError') {
                alert('❌ Request timed out. Please try again.');
                trackEvent('checkout_timeout');
            } else {
                throw abortError;
            }
        }

    } catch (error) {
        console.error('❌ Checkout error:', error);
        showError(`Payment error: ${error.message}`);
        trackEvent('checkout_error', { error: error.message });
    } finally {
        showLoading(false);
    }
}

/**
 * Get Payment Status
 * Check if user has active subscription
 */
async function getPaymentStatus(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return { status: 'no_account', tier: 'free' };
        }

        const data = userDoc.data();
        return {
            status: data.subscription?.status || 'inactive',
            tier: data.subscription?.plan || 'free',
            expiresAt: data.subscription?.endsAt,
            stripeCustomerId: data.stripeCustomerId
        };
    } catch (error) {
        console.error('Error getting payment status:', error);
        return { status: 'error', tier: 'free' };
    }
}

/**
 * Get Customer Portal URL
 * Allows users to manage their subscription
 */
async function getCustomerPortalUrl(userId) {
    try {
        const idToken = await currentUser.getIdToken();
        const functionUrl = `https://${STRIPE_CONFIG.region}-studio-4627045237-a2fe9.cloudfunctions.net/createCustomerPortalSession`;
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ userId: userId })
        });

        if (!response.ok) throw new Error('Failed to get portal URL');
        
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Error getting customer portal:', error);
        return null;
    }
}

/**
 * Webhook Verification
 * Called by Cloud Function to verify payment
 */
function isPaymentVerified(stripeSessionId) {
    // This is verified server-side in Cloud Function
    // Never trust client-side verification
    return false; // Always false here - verification happens on server
}

/**
 * Export functions for use in other files
 */
if (typeof window !== 'undefined') {
    window.createCheckoutSession = createCheckoutSession;
    window.getPaymentStatus = getPaymentStatus;
    window.getCustomerPortalUrl = getCustomerPortalUrl;
    window.STRIPE_CONFIG = STRIPE_CONFIG;
}

console.log('✅ Stripe Configuration Loaded (Firebase Cloud Functions)');
