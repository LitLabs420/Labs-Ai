import PostHog from "posthog-js";

/**
 * Initialize PostHog for analytics and feature flags
 * Best for: Understanding user behavior, A/B testing, feature rollouts
 */
export function initializePostHog() {
  if (typeof window !== "undefined") {
    PostHog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });
  }
}

// Track user event
export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window !== "undefined") {
    PostHog.capture(eventName, properties);
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    PostHog.people.set(properties);
  }
}

/**
 * Identify user
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    PostHog.identify(userId, properties);
  }
}

/**
 * Track content generation
 */
export function trackContentGeneration(
  type: string,
  platform: string,
  quality?: number
) {
  trackEvent("content_generated", {
    type,
    platform,
    quality,
    timestamp: new Date(),
  });
}

/**
 * Track publishing event
 */
export function trackPublishing(platform: string, contentType: string) {
  trackEvent("content_published", {
    platform,
    content_type: contentType,
  });
}

/**
 * Track purchase
 */
export function trackPurchase(amount: number, currency: string, itemType: string) {
  trackEvent("purchase", {
    amount,
    currency,
    item_type: itemType,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string) {
  trackEvent("feature_used", {
    feature: featureName,
  });
}

export default PostHog;
