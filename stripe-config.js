// Stripe Configuration
// Get your keys from https://dashboard.stripe.com/apikeys

const STRIPE_CONFIG = {
    // Replace with your actual Stripe Publishable Key
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
    
    // Secret key should NEVER be in frontend - only for reference
    // This will be handled by Cloud Functions instead
    
    // Price IDs from Stripe Dashboard
    priceIds: {
        pro: 'price_pro_monthly',      // Replace with actual Stripe Price ID
        enterprise: 'price_enterprise' // Replace with actual Stripe Price ID
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
        const priceId = STRIPE_CONFIG.priceIds[planType];
        
        if (!priceId || priceId.includes('_pro_') || priceId.includes('_enterprise')) {
            alert('Stripe integration not yet configured. Please add your Stripe keys.');
            return;
        }

        // Call Cloud Function to create checkout session
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await currentUser.getIdToken()}`
            },
            body: JSON.stringify({
                priceId: priceId,
                userId: currentUser.uid,
                plan: planType
            })
        });

        const data = await response.json();
        
        if (data.sessionId) {
            const stripe = await initStripe();
            const { error } = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            });
            
            if (error) {
                console.error('Stripe error:', error);
                alert('Error: ' + error.message);
            }
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        alert('Error creating checkout session');
    }
}

// Handle successful payment (called after redirect from Stripe)
async function handlePaymentSuccess() {
    try {
        // Check query parameter for session ID
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) return;

        // Verify payment with Cloud Function
        const response = await fetch('/.netlify/functions/verify-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await currentUser.getIdToken()}`
            },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();
        
        if (data.success) {
            // Update user subscription in Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
                subscription: data.plan,
                stripeCustomerId: data.customerId,
                subscriptionId: data.subscriptionId,
                lastPaymentDate: new Date(),
                nextBillingDate: data.nextBillingDate
            });
            
            alert('Payment successful! Your subscription has been updated.');
            loadBillingPage();
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
    }
}

// Manage customer's Stripe subscription
async function manageStripeSubscription() {
    try {
        const response = await fetch('/.netlify/functions/create-portal-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await currentUser.getIdToken()}`
            },
            body: JSON.stringify({
                userId: currentUser.uid
            })
        });

        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        }
    } catch (error) {
        console.error('Error opening customer portal:', error);
        alert('Error opening billing portal');
    }
}
