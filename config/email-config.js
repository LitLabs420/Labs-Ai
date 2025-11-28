// FLIPFORGE™ Email Configuration
// Professional work email setup for your business

const EMAIL_CONFIG = {
    // Main business emails (Update these to your actual domain)
    support: 'support@glamflow.ai',
    legal: 'legal@glamflow.ai',
    privacy: 'privacy@glamflow.ai',
    billing: 'billing@glamflow.ai',
    sales: 'sales@glamflow.ai',
    partnerships: 'partnerships@glamflow.ai',
    
    // Admin/Internal emails
    admin: 'admin@glamflow.ai',
    noreply: 'noreply@glamflow.ai',
    
    // Founder/CEO email (your primary contact)
    founder: 'dyingbreed243@gmail.com',
    
    // Default sender (Set up email forwarding in Firebase)
    defaultSender: 'GLAMFLOW AI <noreply@glamflow.ai>',
    
    // Email templates for common communications
    templates: {
        welcome: {
            subject: 'Welcome to FLIPFORGE™ - Build Your Empire',
            from: 'support@flipforge.ai'
        },
        upgrade: {
            subject: 'Ready to scale? Upgrade your FLIPFORGE™ account',
            from: 'sales@flipforge.ai'
        },
        receipt: {
            subject: 'Your FLIPFORGE™ Purchase Receipt',
            from: 'billing@flipforge.ai'
        },
        support: {
            subject: 'FLIPFORGE™ Support Response',
            from: 'support@flipforge.ai'
        },
        legal: {
            subject: 'FLIPFORGE™ Legal Notice',
            from: 'legal@flipforge.ai'
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EMAIL_CONFIG;
}
