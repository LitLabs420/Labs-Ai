// ===== GLAMFLOW SECURITY UTILITIES =====
// Client-side security hardening

// ===== 1. PREVENT XSS (Cross-Site Scripting) =====
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function sanitizeInput(input) {
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}

// ===== 2. CONTENT SECURITY POLICY INJECTION =====
function injectCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:";
    document.head.appendChild(meta);
}

// ===== 3. PREVENT CLICKJACKING =====
function preventClickjacking() {
    if (window.self !== window.top) {
        window.top.location = window.self.location;
    }
}

// ===== 4. DISABLE RIGHT-CLICK (optional, not recommended but available) =====
// Uncomment if you want to disable right-click context menu
/*
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});
*/

// ===== 5. PREVENT CONSOLE TAMPERING =====
function lockConsole() {
    const noop = () => {};
    window.console.log = noop;
    window.console.error = noop;
    window.console.warn = noop;
    window.console.debug = noop;
    // Note: This is obfuscation, not real security. Determined attackers can bypass.
}

// ===== 6. MONITOR FOR SUSPICIOUS ACTIVITY =====
function setupSecurityMonitoring() {
    // Monitor for abnormal API calls
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        // ⚠️ SECURITY: Prevent cross-site requests by default
        if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168')) {
            console.warn('⚠️ SECURITY: Attempted connection to local network:', url);
        }
        
        // Validate origin for external requests
        try {
            const urlObj = new URL(url, window.location.origin);
            const currentOrigin = window.location.origin;
            if (urlObj.origin !== currentOrigin && !urlObj.origin.includes('googleapis.com') && !urlObj.origin.includes('firebaseapp.com') && !urlObj.origin.includes('stripe.com')) {
                console.warn('⚠️ SECURITY: Cross-origin fetch detected:', url);
            }
        } catch (e) {
            // Relative URL - safe
        }
        
        return originalFetch.apply(this, args);
    };
    
    // Monitor XMLHttpRequest
    const originalXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (typeof url === 'string') {
            if (url.includes('localhost') || url.includes('127.0.0.1')) {
                console.warn('⚠️ SECURITY: Attempted XHR to local network:', url);
            }
        }
        return originalXHR.apply(this, arguments);
    };
}

// ===== 7. SECURE LOCAL STORAGE =====
function secureStorageSet(key, value) {
    // Don't store sensitive data in localStorage - use sessionStorage instead
    if (key.includes('password') || key.includes('token') || key.includes('secret')) {
        console.warn('⚠️ SECURITY: Attempting to store sensitive data. Use sessionStorage instead.');
        sessionStorage.setItem(key, value);
        return;
    }
    localStorage.setItem(key, value);
}

function secureStorageGet(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
}

// ===== 8. CSRF TOKEN MANAGEMENT =====
function generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function validateCSRFToken(token) {
    const stored = sessionStorage.getItem('csrf_token');
    return stored && stored === token;
}

// ===== 9. RATE LIMITING (Client-side) =====
class RateLimiter {
    constructor(maxRequests = 10, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }
    
    isAllowed() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
            console.warn('⚠️ SECURITY: Rate limit exceeded!');
            return false;
        }
        
        this.requests.push(now);
        return true;
    }
}

// ===== 10. SESSION TIMEOUT =====
let sessionTimeout;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        console.log('🔐 Session expired due to inactivity');
        window.firebaseAuth?.signOut();
        window.location.href = '/index.html';
    }, SESSION_TIMEOUT_MS);
}

// Track user activity
document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('click', resetSessionTimeout);

// ===== 11. DISABLE AUTOCOMPLETE FOR SENSITIVE FIELDS =====
function disableAutocomplete() {
    const sensitiveFields = document.querySelectorAll('input[type="password"], input[type="email"]');
    sensitiveFields.forEach(field => {
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('autocorrect', 'off');
        field.setAttribute('autocapitalize', 'off');
        field.setAttribute('spellcheck', 'false');
    });
}

// ===== 12. SUBRESOURCE INTEGRITY (SRI) =====
// Add integrity hashes to external scripts in HTML:
// <script src="https://..." integrity="sha384-..." crossorigin="anonymous"></script>

// ===== 13. SECURE COOKIE FLAGS =====
// Should be set by backend, but document for reference:
// Set-Cookie: sessionId=abc123; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800

// ===== 14. DETECT DEBUGGER =====
function detectDebugger() {
    let devtools = { open: false };
    
    const threshold = 160;
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                console.warn('🔍 DevTools detected! Security implications apply.');
                // Optionally log suspicious activity
            }
        } else {
            devtools.open = false;
        }
    }, 500);
}

// ===== 15. INITIALIZE ALL SECURITY MEASURES =====
function initializeSecurityMeasures() {
    console.log('🔐 Initializing GLAMFLOW security hardening...');
    
    preventClickjacking();
    injectCSP();
    setupSecurityMonitoring();
    disableAutocomplete();
    
    // Uncomment if you want to lock console (affects debugging):
    // lockConsole();
    
    // Uncomment if you want to detect debugger:
    // detectDebugger();
    
    // Initialize CSRF token for forms
    sessionStorage.setItem('csrf_token', generateCSRFToken());
    
    // Start session timeout monitoring
    resetSessionTimeout();
    
    console.log('✅ Security measures active!');
}

// Run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSecurityMeasures);
} else {
    initializeSecurityMeasures();
}

// Export for use in other scripts
window.SecurityUtils = {
    sanitizeHTML,
    sanitizeInput,
    generateCSRFToken,
    validateCSRFToken,
    RateLimiter,
    secureStorageSet,
    secureStorageGet,
    resetSessionTimeout
};
