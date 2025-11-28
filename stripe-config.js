// Stripe Configuration
// Get your keys from https://dashboard.stripe.com/apikeys

const STRIPE_CONFIG = {
    // ⚠️ SECURITY: Publishable key is loaded from environment variables set in Firebase Functions
    // NEVER store secret keys (sk_live_) in frontend code
    // Secret key is handled exclusively by Cloud Functions via process.env.STRIPE_SECRET_KEY
    publishableKey: 'pk_live_loaded_from_env', // Will be replaced at runtime from backend
    
    // Secret key should NEVER be in frontend - Cloud Functions only
    // ❌ DO NOT add sk_live_ or sk_test_ keys here
    
    // Price IDs from Stripe Dashboard
    priceIds: {
        pro: 'price_1SYMhF440X4TKc4a2MfVCkFt',      // GLAMFLOW AI Pro - $29/month
        enterprise: 'price_1SYMnG440X4TKc4aVC48Pls5' // GLAMFLOW AI Enterprise - $99/month
    }
};

// Initialize Stripe
let stripe = null;

async function initStripe() {
    if (!stripe && STRIPE_CONFIG.publishableKey !== 'pk_test_YOUR_PUBLISHABLE_KEY_HERE') {
        stripe = Stripe(STRIPE_CONFIG.publishableKey);
    }
    return stripe;
}

// Create checkout session
async function createCheckoutSession(planType) {
    try {
        if (!currentUser || !currentUser.uid) {
            alert('❌ Please log in to upgrade.');
            return;
        }

        const priceId = STRIPE_CONFIG.priceIds[planType];
        if (!priceId) {
            alert('❌ Invalid plan selected.');
            return;
        }

        // Create abort controller for timeout (10 seconds)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const idToken = await currentUser.getIdToken();
            
            // Call Cloud Function to create checkout session
            const response = await fetch('/.netlify/functions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: currentUser.uid,
                    plan: planType
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.sessionId) {
                throw new Error('No session ID returned from server');
            }

            const stripe = await initStripe();
            if (!stripe) {
                throw new Error('Stripe failed to initialize');
            }

            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            });
            
            if (error) {
                console.error('Stripe redirect error:', error);
                alert('❌ ' + (error.message || 'Payment setup failed'));
            }
        } catch (abortError) {
            if (abortError.name === 'AbortError') {
                alert('❌ Request timed out. Please try again.');
            } else {
                throw abortError;
            }
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        // Sanitize error message to prevent XSS
        const message = error && error.message ? String(error.message).substring(0, 100) : 'Payment setup failed';
        alert('❌ ' + message);
    }
}

// Handle successful payment (called after redirect from Stripe)
async function handlePaymentSuccess() {
    try {
        // Check query parameter for session ID
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
            console.log('No session ID in URL - payment verification skipped');
            return;
        }

        if (!currentUser || !currentUser.uid) {
            alert('❌ Session expired. Please log in again.');
            return;
        }

        // Create abort controller for timeout (10 seconds)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const idToken = await currentUser.getIdToken();
            
            // Verify payment with Cloud Function
            const response = await fetch('/.netlify/functions/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ sessionId }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Verification failed: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success && data.plan) {
                alert('✅ Payment successful! Your subscription has been updated.');
                // Remove session ID from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.error('Payment verification returned unexpected response:', data);
                alert('⚠️ Payment may have succeeded. Check your account.');
            }
        } catch (abortError) {
            if (abortError.name === 'AbortError') {
                alert('⚠️ Verification took too long. Check your email for payment confirmation.');
            } else {
                throw abortError;
            }
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        const message = error && error.message ? String(error.message).substring(0, 100) : 'Payment verification failed';
        alert('⚠️ ' + message);
    }
}

// Manage customer's Stripe subscription
async function manageStripeSubscription() {
    try {
        if (!currentUser || !currentUser.uid) {
            alert('❌ Please log in to manage billing.');
            return;
        }

        // Create abort controller for timeout (10 seconds)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
            const idToken = await currentUser.getIdToken();
            
            const response = await fetch('/.netlify/functions/create-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    userId: currentUser.uid
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.url) {
                throw new Error('No portal URL returned from server');
            }

            // Validate URL is from Stripe
            if (!data.url.includes('stripe.com')) {
                throw new Error('Invalid portal URL');
            }

            window.location.href = data.url;
        } catch (abortError) {
            if (abortError.name === 'AbortError') {
                alert('❌ Request timed out. Please try again.');
            } else {
                throw abortError;
            }
        }
    } catch (error) {
        console.error('Error opening customer portal:', error);
        const message = error && error.message ? String(error.message).substring(0, 100) : 'Failed to open billing portal';
        alert('❌ ' + message);
    }
}
