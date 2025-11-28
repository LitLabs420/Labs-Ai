/**
 * GLAMFLOW AI - Advanced Analytics & Conversion Tracking
 * Tracks user behavior, conversions, and revenue metrics
 * Works with Google Analytics 4, Facebook Pixel, Google Ads
 */

// ===== ENHANCED EVENT TRACKING WITH GA4 & FACEBOOK PIXEL =====
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4 tracking
    if (window.gtag) {
        gtag('event', eventName, {
            ...eventData,
            timestamp: new Date().toISOString(),
            page_path: window.location.pathname
        });
    }
    
    // Facebook Pixel tracking
    if (window.fbq) {
        fbq('track', eventName, eventData);
    }
    
    // Google Ads conversion tracking
    if (window.gtag && eventName === 'purchase') {
        gtag('event', 'conversion', {
            'send_to': 'AW-YOUR_GOOGLE_ADS_ID/YOUR_CONVERSION_ID',
            'transaction_id': eventData.transaction_id || '',
            'value': eventData.value || 0,
            'currency': 'USD'
        });
    }
    
    console.log(`📊 Tracked event: ${eventName}`, eventData);
}

// ===== CONVERSION FUNNEL TRACKING =====
const conversionFunnel = {
    // Step 1: Landing page view
    trackLandingView: () => {
        trackEvent('landing_view', {
            event_category: 'engagement',
            event_label: 'landing_page'
        });
    },
    
    // Step 2: Sign-up initiated
    trackSignupStart: () => {
        trackEvent('signup_started', {
            event_category: 'conversion',
            event_label: 'signup_form_opened'
        });
    },
    
    // Step 3: Sign-up completed
    trackSignupComplete: (userTier) => {
        trackEvent('signup_complete', {
            event_category: 'conversion',
            event_label: `signup_${userTier}`,
            user_tier: userTier,
            value: userTier === 'pro' ? 29 : 0
        });
        
        // Also track with Facebook
        if (window.fbq) {
            fbq('track', 'CompleteRegistration', {
                content_name: `GLAMFLOW Signup - ${userTier}`,
                currency: 'USD',
                value: userTier === 'pro' ? 29.00 : 0.00
            });
        }
    },
    
    // Step 4: Trial started
    trackTrialStart: () => {
        trackEvent('trial_started', {
            event_category: 'conversion',
            event_label: 'free_trial_activated'
        });
    },
    
    // Step 5: First feature use
    trackFirstFeatureUse: (featureName) => {
        trackEvent('first_feature_use', {
            event_category: 'engagement',
            event_label: featureName,
            feature_name: featureName
        });
    },
    
    // Step 6: Upgrade initiated
    trackUpgradeStart: (currentTier, targetTier) => {
        trackEvent('upgrade_started', {
            event_category: 'conversion',
            event_label: `${currentTier}_to_${targetTier}`,
            from_tier: currentTier,
            to_tier: targetTier
        });
    },
    
    // Step 7: Upgrade completed (purchase)
    trackUpgradeComplete: (previousTier, newTier, amount) => {
        trackEvent('purchase', {
            event_category: 'conversion',
            event_label: `upgrade_${newTier}`,
            value: amount,
            currency: 'USD',
            transaction_id: `GLAMFLOW-${Date.now()}`,
            previous_tier: previousTier,
            new_tier: newTier
        });
        
        // Track with Facebook
        if (window.fbq) {
            fbq('track', 'Purchase', {
                value: amount,
                currency: 'USD',
                content_name: `GLAMFLOW Upgrade to ${newTier}`,
                content_type: 'subscription'
            });
        }
    },
    
    // Step 8: Churn event
    trackChurn: (tier, reason) => {
        trackEvent('subscription_canceled', {
            event_category: 'retention',
            event_label: `churn_${tier}`,
            tier: tier,
            churn_reason: reason
        });
    }
};

// ===== ENGAGEMENT TRACKING =====
const engagementTracking = {
    // Track AI content generation
    trackContentGeneration: (contentType, tone) => {
        trackEvent('content_generated', {
            event_category: 'feature_usage',
            event_label: `content_${contentType}`,
            content_type: contentType,
            tone: tone
        });
    },
    
    // Track chatbot interaction
    trackChatbotMessage: (messageCount) => {
        trackEvent('chatbot_message', {
            event_category: 'engagement',
            event_label: 'chatbot_interaction',
            message_count: messageCount
        });
    },
    
    // Track automation created
    trackAutomationCreated: (automationType) => {
        trackEvent('automation_created', {
            event_category: 'feature_usage',
            event_label: `automation_${automationType}`,
            automation_type: automationType
        });
    },
    
    // Track analytics viewed
    trackAnalyticsViewed: () => {
        trackEvent('analytics_viewed', {
            event_category: 'engagement',
            event_label: 'analytics_dashboard'
        });
    }
};

// ===== RETENTION TRACKING =====
const retentionTracking = {
    // Track daily active users
    trackDailyActive: (userId, tier) => {
        trackEvent('daily_active_user', {
            event_category: 'retention',
            event_label: `dau_${tier}`,
            user_id: userId,
            user_tier: tier
        });
    },
    
    // Track feature adoption
    trackFeatureAdoption: (featureName) => {
        trackEvent('feature_adopted', {
            event_category: 'engagement',
            event_label: `adopted_${featureName}`,
            feature_name: featureName
        });
    },
    
    // Track session duration (in minutes)
    trackSessionDuration: (durationMinutes) => {
        trackEvent('session_end', {
            event_category: 'engagement',
            event_label: 'session_complete',
            session_duration_minutes: durationMinutes,
            value: Math.round(durationMinutes)
        });
    }
};

// ===== COHORT TRACKING =====
const cohortTracking = {
    // Set user cohort based on signup date
    setCohort: (userId, signupDate) => {
        const month = new Date(signupDate).toISOString().slice(0, 7); // YYYY-MM
        gtag('set', {
            'user_cohort': month,
            'user_id': userId
        });
    },
    
    // Track by acquisition source
    setAcquisitionSource: (source) => {
        gtag('set', {
            'user_acquisition_source': source
        });
    }
};

// ===== SESSION TRACKING =====
function initializeSessionTracking() {
    // Track page load
    trackEvent('page_load', {
        event_category: 'engagement',
        page_title: document.title,
        page_referrer: document.referrer
    });
    
    // Track time on page
    let pageLoadTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - pageLoadTime) / 1000);
        trackEvent('page_exit', {
            event_category: 'engagement',
            time_on_page_seconds: timeOnPage,
            page_title: document.title
        });
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            trackEvent('scroll_depth', {
                event_category: 'engagement',
                scroll_depth_percent: maxScroll
            });
        }
    });
    
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cta-button') || e.target.classList.contains('upgrade-btn')) {
            trackEvent('cta_clicked', {
                event_category: 'engagement',
                button_text: e.target.textContent,
                button_class: e.target.className
            });
        }
    });
}

// ===== REVENUE TRACKING =====
const revenueTracking = {
    trackMRR: (totalMRR, activeSubscriptions) => {
        trackEvent('mrr_tracked', {
            event_category: 'business_metric',
            event_label: 'monthly_recurring_revenue',
            value: totalMRR,
            active_subscriptions: activeSubscriptions
        });
    },
    
    trackAffiliateCommission: (affiliateId, amount) => {
        trackEvent('affiliate_commission', {
            event_category: 'business_metric',
            event_label: 'commission_paid',
            affiliate_id: affiliateId,
            value: amount
        });
    },
    
    trackCustomerLTV: (userId, ltv) => {
        trackEvent('customer_ltv', {
            event_category: 'business_metric',
            event_label: 'lifetime_value',
            user_id: userId,
            value: ltv
        });
    }
};

// ===== EXPORT TRACKING FUNCTIONS =====
if (typeof window !== 'undefined') {
    window.trackEvent = trackEvent;
    window.conversionFunnel = conversionFunnel;
    window.engagementTracking = engagementTracking;
    window.retentionTracking = retentionTracking;
    window.cohortTracking = cohortTracking;
    window.revenueTracking = revenueTracking;
}

// ===== AUTO-INITIALIZE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSessionTracking);
} else {
    initializeSessionTracking();
}

console.log('✅ Advanced Analytics Tracking Initialized');
