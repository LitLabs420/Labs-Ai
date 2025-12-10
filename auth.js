// GLAMFLOW AI - Authentication System
// Handles Google Sign-In, Email/Password Auth, and Stripe Setup

const auth = window.firebaseAuth;
const db = window.firebaseDb;

// DOM Elements
const googleBtn = document.getElementById('google-signin-btn');
const emailForm = document.getElementById('email-form');
const signupForm = document.getElementById('signup-form');
const toggleSignupLink = document.getElementById('toggle-signup');
const toggleSigninLink = document.getElementById('toggle-signin');
const toggleSigninText = document.getElementById('toggle-signin-text');
const authMessage = document.getElementById('auth-message');
const loadingOverlay = document.getElementById('loading-overlay');

// Google Sign-In
googleBtn.addEventListener('click', async () => {
    try {
        showLoading(true);
        trackEvent('google_signin_start', {});
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Track successful sign in
        trackEvent('google_signin_success', {
            user_id: user.uid,
            email: user.email,
            timestamp: new Date().toISOString()
        });
        
        // Create user profile in Firestore
        await createUserProfile(user);
        
        // Redirect to dashboard
        showSuccess('Welcome! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        trackEvent('google_signin_error', {error: error.message});
        showError(error.message || 'Google sign-in failed');
        showLoading(false);
    }
});

// Email/Password Sign-In
emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        showLoading(true);
        trackEvent('email_signin_start', {email});
        await auth.signInWithEmailAndPassword(email, password);
        trackEvent('email_signin_success', {email, timestamp: new Date().toISOString()});
        showSuccess('Sign in successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message || 'Sign in failed');
        showLoading(false);
    }
});

// Email/Password Sign-Up
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    try {
        showLoading(true);
        trackEvent('signup_start', {email, name});
        
        // Create user account
        const result = await auth.createUserWithEmailAndPassword(email, password);
        const user = result.user;
        
        // Track successful signup (conversion event)
        trackEvent('sign_up', {
            method: 'email',
            user_id: user.uid,
            email: email,
            timestamp: new Date().toISOString()
        });
        
        // Update profile with name
        await user.updateProfile({ displayName: name });
        
        // Create user profile in Firestore
        await createUserProfile(user);
        
        trackEvent('onboarding_complete', {user_id: user.uid});
        showSuccess('Account created! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        trackEvent('signup_error', {error: error.message});
        showError(error.message || 'Sign up failed');
        showLoading(false);
    }
});

// Toggle between Sign-In and Sign-Up forms
toggleSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    emailForm.style.display = 'none';
    document.querySelector('.toggle-form').style.display = 'none';
    signupForm.style.display = 'flex';
    toggleSigninText.style.display = 'block';
});

toggleSigninLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    toggleSigninText.style.display = 'none';
    emailForm.style.display = 'flex';
    document.querySelector('.toggle-form').style.display = 'block';
});

// Create User Profile in Firestore
async function createUserProfile(user) {
    try {
        const userRef = db.collection('users').doc(user.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            await userRef.set({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || '',
                createdAt: new Date(),
                tier: 'free', // free, pro, enterprise
                status: 'active',
                stripeCustomerId: null,
                subscription: {
                    plan: 'free',
                    status: 'active',
                    createdAt: new Date(),
                    endsAt: null,
                }
            });
            
            console.log('User profile created:', user.uid);
        }
    } catch (error) {
        console.error('Error creating user profile:', error);
    }
}

// Show/Hide Loading
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Show Error Message
function showError(message) {
    authMessage.textContent = message;
    authMessage.className = 'auth-message error';
    setTimeout(() => {
        authMessage.className = 'auth-message';
    }, 5000);
}

// Show Success Message
function showSuccess(message) {
    authMessage.textContent = message;
    authMessage.className = 'auth-message success';
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in - redirect to dashboard
        window.location.href = 'dashboard.html';
    }
});

console.log('Auth system initialized');
