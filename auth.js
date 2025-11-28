// ===== GLAMFLOW AI - AUTHENTICATION SYSTEM =====
// Completely rewritten for maximum safety and clarity

(function() {
    'use strict';
    
    // Wait for DOM to be completely ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuth);
    } else {
        initAuth();
    }
    
    function initAuth() {
        console.log('🔐 Initializing GLAMFLOW Authentication...');
        
        // ===== 1. CHECK FIREBASE AVAILABILITY =====
        if (!window.firebaseAuth || !window.firebaseDb) {
            console.error('❌ Firebase not initialized. Waiting...');
            setTimeout(initAuth, 500);
            return;
        }
        
        const auth = window.firebaseAuth;
        const db = window.firebaseDb;
        
        console.log('✅ Firebase available. Setting up listeners...');
        
        // ===== 2. SAFE DOM ELEMENT RETRIEVAL =====
        function getElement(id) {
            const el = document.getElementById(id);
            if (!el) {
                console.warn(`⚠️ Element not found: #${id}`);
            }
            return el;
        }
        
        // ===== 3. CACHE ELEMENTS =====
        const googleBtn = getElement('google-signin-btn');
        const emailForm = getElement('email-form');
        const signupForm = getElement('signup-form');
        const toggleSignupLink = getElement('toggle-signup');
        const toggleSigninLink = getElement('toggle-signin');
        const toggleSigninText = getElement('toggle-signin-text');
        const authMessage = getElement('auth-message');
        const loadingOverlay = getElement('loading-overlay');
        const emailInput = getElement('email');
        const passwordInput = getElement('password');
        const signupNameInput = getElement('signup-name');
        const signupEmailInput = getElement('signup-email');
        const signupPasswordInput = getElement('signup-password');
        
        // ===== 4. UTILITY FUNCTIONS =====
        function showLoading(show) {
            if (loadingOverlay) {
                loadingOverlay.style.display = show ? 'flex' : 'none';
                console.log(show ? '⏳ Loading...' : '✅ Loading complete');
            }
        }
        
        function showError(message) {
            if (authMessage) {
                authMessage.textContent = message;
                authMessage.className = 'auth-message error';
                console.error('❌ Error:', message);
                
                setTimeout(() => {
                    if (authMessage) {
                        authMessage.className = 'auth-message';
                    }
                }, 5000);
            }
        }
        
        function showSuccess(message) {
            if (authMessage) {
                authMessage.textContent = message;
                authMessage.className = 'auth-message success';
                console.log('✅ Success:', message);
            }
        }
        
        function trackEvent(eventName, data = {}) {
            try {
                if (window.gtag) {
                    window.gtag('event', eventName, data);
                    console.log('📊 Event tracked:', eventName, data);
                }
            } catch (e) {
                console.warn('Analytics unavailable:', e.message);
            }
        }
        
        // ===== 5. FIRESTORE USER CREATION =====
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
                        tier: 'free',
                        status: 'active',
                        stripeCustomerId: null,
                        subscription: {
                            plan: 'free',
                            status: 'active',
                            createdAt: new Date(),
                            endsAt: null,
                        }
                    });
                    
                    console.log('👤 User profile created:', user.uid);
                }
            } catch (error) {
                console.error('❌ Error creating user profile:', error);
            }
        }
        
        // ===== 6. GOOGLE SIGN-IN =====
        if (googleBtn) {
            googleBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    showLoading(true);
                    trackEvent('google_signin_start', {});
                    
                    const provider = new firebase.auth.GoogleAuthProvider();
                    provider.addScope('profile');
                    provider.addScope('email');
                    
                    const result = await auth.signInWithPopup(provider);
                    const user = result.user;
                    
                    trackEvent('google_signin_success', {
                        user_id: user.uid,
                        email: user.email,
                        timestamp: new Date().toISOString()
                    });
                    
                    await createUserProfile(user);
                    showSuccess('🎉 Welcome! Redirecting to dashboard...');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard-loader.html';
                    }, 1500);
                } catch (error) {
                    trackEvent('google_signin_error', { error: error.message });
                    showError('❌ Google sign-in failed: ' + error.message);
                    showLoading(false);
                    console.error('Google sign-in error:', error);
                }
            });
            console.log('✅ Google Sign-In button listener attached');
        }
        
        // ===== 7. EMAIL/PASSWORD SIGN-IN =====
        if (emailForm) {
            emailForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const email = emailInput?.value?.trim();
                    const password = passwordInput?.value;
                    
                    if (!email || !password) {
                        showError('❌ Please enter email and password');
                        return;
                    }
                    
                    showLoading(true);
                    trackEvent('email_signin_start', { email });
                    
                    await auth.signInWithEmailAndPassword(email, password);
                    
                    trackEvent('email_signin_success', {
                        email: email,
                        timestamp: new Date().toISOString()
                    });
                    
                    showSuccess('✅ Sign in successful! Redirecting...');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard-loader.html';
                    }, 1500);
                } catch (error) {
                    trackEvent('email_signin_error', { error: error.message });
                    showError('❌ Sign in failed: ' + error.message);
                    showLoading(false);
                    console.error('Email sign-in error:', error);
                }
            });
            console.log('✅ Email Sign-In form listener attached');
        }
        
        // ===== 8. EMAIL/PASSWORD SIGN-UP =====
        if (signupForm) {
            signupForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    const name = signupNameInput?.value?.trim();
                    const email = signupEmailInput?.value?.trim();
                    const password = signupPasswordInput?.value;
                    
                    if (!name || !email || !password) {
                        showError('❌ Please fill in all fields');
                        return;
                    }
                    
                    if (password.length < 6) {
                        showError('❌ Password must be at least 6 characters');
                        return;
                    }
                    
                    showLoading(true);
                    trackEvent('signup_start', { email, name });
                    
                    const result = await auth.createUserWithEmailAndPassword(email, password);
                    const user = result.user;
                    
                    await user.updateProfile({ displayName: name });
                    await createUserProfile(user);
                    
                    trackEvent('sign_up', {
                        method: 'email',
                        user_id: user.uid,
                        email: email,
                        timestamp: new Date().toISOString()
                    });
                    
                    trackEvent('onboarding_complete', { user_id: user.uid });
                    showSuccess('✅ Account created! Redirecting to dashboard...');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard-loader.html';
                    }, 1500);
                } catch (error) {
                    trackEvent('signup_error', { error: error.message });
                    showError('❌ Sign up failed: ' + error.message);
                    showLoading(false);
                    console.error('Sign-up error:', error);
                }
            });
            console.log('✅ Sign-Up form listener attached');
        }
        
        // ===== 9. FORM TOGGLE =====
        if (toggleSignupLink) {
            toggleSignupLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (emailForm) emailForm.style.display = 'none';
                if (signupForm) signupForm.style.display = 'flex';
                if (toggleSigninText) toggleSigninText.style.display = 'block';
                
                const toggleForm = document.querySelector('.toggle-form');
                if (toggleForm) toggleForm.style.display = 'none';
                
                console.log('📝 Switched to sign-up form');
            });
            console.log('✅ Sign-up toggle listener attached');
        }
        
        if (toggleSigninLink) {
            toggleSigninLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (signupForm) signupForm.style.display = 'none';
                if (toggleSigninText) toggleSigninText.style.display = 'none';
                if (emailForm) emailForm.style.display = 'flex';
                
                const toggleForm = document.querySelector('.toggle-form');
                if (toggleForm) toggleForm.style.display = 'block';
                
                console.log('📝 Switched to sign-in form');
            });
            console.log('✅ Sign-in toggle listener attached');
        }
        
        // ===== 10. AUTH STATE MONITORING =====
        auth.onAuthStateChanged(function(user) {
            const adminToken = sessionStorage.getItem('glamflow_admin_token');
            
            if (adminToken) {
                console.log('🔑 Admin token active, skipping auth redirect');
                return;
            }
            
            if (user) {
                console.log('👤 User logged in:', user.email);
                console.log('→ Redirecting to dashboard...');
                setTimeout(() => {
                    window.location.href = 'dashboard-loader.html';
                }, 500);
            } else {
                console.log('👤 User logged out');
            }
        });
        
        console.log('🎉 GLAMFLOW Authentication initialized successfully!');
    }
})();
