"use client";

import { useState, useCallback } from "react";
import { captureError } from "@/lib/sentry";

/**
 * Generic API response handler hook
 */
interface UseAPIOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showError?: boolean;
}

/**
 * Whitelist of allowed API endpoints to prevent SSRF attacks
 * Only internal API routes (/api/*) and same-origin requests are allowed
 */
const ALLOWED_ENDPOINT_PATTERNS = [
  /^\/api\//,  // Internal API routes only
  /^https?:\/\/localhost/,  // Local development
  /^https?:\/\/127\.0\.0\.1/,  // Local development
];

/**
 * Validates endpoint URL against whitelist to prevent SSRF attacks
 */
function validateEndpoint(endpoint: string): boolean {
  try {
    // Relative paths starting with / are allowed
    if (endpoint.startsWith("/")) {
      return ALLOWED_ENDPOINT_PATTERNS[0].test(endpoint);
    }

    // Only allow absolute URLs to whitelisted domains
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _url = new URL(endpoint, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    return ALLOWED_ENDPOINT_PATTERNS.some((pattern) => pattern.test(endpoint));
  } catch {
    return false;
  }
}

/**
 * Hook for making API calls with loading and error states
 */
export function useAPI<T = unknown>(options?: UseAPIOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const call = useCallback(
    async (
      endpoint: string,
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
      body?: unknown,
      headers?: Record<string, string>
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Validate endpoint to prevent SSRF attacks
        if (!validateEndpoint(endpoint)) {
          const errorMessage = "Invalid endpoint: only internal API routes are allowed";
          setError(errorMessage);
          captureError("SSRF Prevention: Invalid endpoint attempt", { endpoint });
          options?.onError?.(errorMessage);
          return null;
        }

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.message || errorData.error || "API call failed";
          setError(errorMessage);

          if (options?.showError !== false) {
            captureError(`API Error: ${endpoint}`, { status: response.status, error: errorMessage });
          }

          options?.onError?.(errorMessage);
          return null;
        }

        const result = await response.json();
        setData(result.data || result);
        options?.onSuccess?.();
        return result;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        
        if (options?.showError !== false) {
          captureError(`API Request Error: ${endpoint}`, { error: message });
        }

        options?.onError?.(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { call, loading, error, data };
}

/**
 * Hook for AI content generation
 */
export function useAIGeneration(options?: UseAPIOptions) {
  const { call, loading, error, data } = useAPI(options);

  const generate = useCallback(
    async (type: string, topic: string, platform?: string) => {
      return call("/api/ai/generate", "POST", {
        type,
        topic,
        platform,
      });
    },
    [call]
  );

  const batchGenerate = useCallback(
    async (topics: string[], type: string) => {
      return call("/api/ai/generate", "PUT", {
        topics,
        type,
      });
    },
    [call]
  );

  const optimize = useCallback(
    async (content: string) => {
      return call("/api/ai/generate", "PATCH", {
        content,
      });
    },
    [call]
  );

  return { generate, batchGenerate, optimize, loading, error, data };
}

/**
 * Hook for tracking analytics events
 */
export function useAnalytics() {
  const { call } = useAPI({ showError: false }); // Don't show errors for analytics

  const trackEvent = useCallback(
    async (eventName: string, properties?: Record<string, unknown>) => {
      return call("/api/analytics/events", "POST", {
        eventName,
        properties,
      });
    },
    [call]
  );

  const trackBatch = useCallback(
    async (events: Array<{ eventName: string; properties?: Record<string, unknown> }>) => {
      return call("/api/analytics/events", "PUT", {
        events,
      });
    },
    [call]
  );

  return { trackEvent, trackBatch };
}

/**
 * Hook for crypto payments
 */
export function useCryptoPayment(options?: UseAPIOptions) {
  const { call, loading, error } = useAPI(options);

  const processPayment = useCallback(
    async (amount: number, tier: string, blockchain: "solana" | "ethereum" | "stripe", walletAddress?: string) => {
      return call("/api/payments/crypto", "POST", {
        amount,
        tier,
        blockchain,
        walletAddress,
        description: `Upgrade to ${tier} tier`,
      });
    },
    [call]
  );

  const checkStatus = useCallback(
    async (txHash: string, blockchain: string) => {
      return call(`/api/payments/crypto/status?hash=${txHash}&blockchain=${blockchain}`, "GET");
    },
    [call]
  );

  return { processPayment, checkStatus, loading, error };
}

/**
 * Hook for user authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("authToken", data.token);
      return data.user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
      }
      setUser(null);
      localStorage.removeItem("authToken");
    } catch (err: unknown) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, login, logout };
}

export default {
  useAPI,
  useAIGeneration,
  useAnalytics,
  useCryptoPayment,
  useAuth,
};
