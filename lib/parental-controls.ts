/**
 * Parental Controls Service
 * Manages age-appropriate content filtering and family supervision
 */

import { supabase } from "@/lib/database";
import { captureError } from "@/lib/sentry";

export interface ParentalControlSettings {
  userId: string;
  parentEmail: string;
  ageLimit: number; // 0-18, 0 = unrestricted
  contentFilters: {
    explicit: boolean;
    violence: boolean;
    adult: boolean;
    gambling: boolean;
  };
  screenTimeLimit: number; // minutes per day
  screenTimeEnabled: boolean;
  bedtimeStart: string; // HH:mm format
  bedtimeEnd: string; // HH:mm format
  bedtimeEnabled: boolean;
  whitelistMode: boolean; // If true, only allow whitelisted apps/features
  whitelistedFeatures: string[];
  notifyParent: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreenTimeLog {
  userId: string;
  date: string;
  minutesUsed: number;
  sessionsCount: number;
  lastSessionEnd: string;
}

/**
 * Enable parental controls for a user
 */
export async function enableParentalControls(
  userId: string,
  settings: Partial<ParentalControlSettings>
): Promise<ParentalControlSettings | null> {
  try {
    const { data, error } = await supabase
      .from("parental_controls")
      .insert({
        user_id: userId,
        ...settings,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as ParentalControlSettings;
  } catch (error) {
    captureError("Failed to enable parental controls", { error });
    return null;
  }
}

/**
 * Get parental control settings for a user
 */
export async function getParentalControls(userId: string): Promise<ParentalControlSettings | null> {
  try {
    const { data, error } = await supabase
      .from("parental_controls")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data as ParentalControlSettings | null;
  } catch (error) {
    captureError("Failed to fetch parental controls", { error });
    return null;
  }
}

/**
 * Update parental control settings
 */
export async function updateParentalControls(
  userId: string,
  settings: Partial<ParentalControlSettings>
): Promise<ParentalControlSettings | null> {
  try {
    const { data, error } = await supabase
      .from("parental_controls")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as ParentalControlSettings;
  } catch (error) {
    captureError("Failed to update parental controls", { error });
    return null;
  }
}

/**
 * Log screen time usage
 */
export async function logScreenTime(
  userId: string,
  minutes: number,
  sessionEnd: string
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get or create today's log
    const { data: existing } = await supabase
      .from("screen_time_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (existing) {
      await supabase
        .from("screen_time_logs")
        .update({
          minutes_used: existing.minutes_used + minutes,
          sessions_count: existing.sessions_count + 1,
          last_session_end: sessionEnd,
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("screen_time_logs").insert({
        user_id: userId,
        date: today,
        minutes_used: minutes,
        sessions_count: 1,
        last_session_end: sessionEnd,
      });
    }

    return true;
  } catch (error) {
    captureError("Failed to log screen time", { error });
    return false;
  }
}

/**
 * Check if screen time limit exceeded
 */
export async function checkScreenTimeLimit(userId: string): Promise<{
  exceeded: boolean;
  remaining: number;
  totalLimit: number;
  used: number;
}> {
  try {
    const controls = await getParentalControls(userId);
    if (!controls || !controls.screenTimeEnabled) {
      return { exceeded: false, remaining: -1, totalLimit: -1, used: 0 };
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: log } = await supabase
      .from("screen_time_logs")
      .select("minutes_used")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    const used = log?.minutes_used || 0;
    const limit = controls.screenTimeLimit;
    const exceeded = used >= limit;
    const remaining = Math.max(0, limit - used);

    return { exceeded, remaining, totalLimit: limit, used };
  } catch (error) {
    captureError("Failed to check screen time limit", { error });
    return { exceeded: false, remaining: -1, totalLimit: -1, used: 0 };
  }
}

/**
 * Check if current time is within bedtime
 */
export function isCurrentlyBedtime(bedtimeStart: string, bedtimeEnd: string): boolean {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (bedtimeStart < bedtimeEnd) {
    // Same day (e.g., 22:00 to 06:00 doesn't wrap)
    return currentTime >= bedtimeStart && currentTime < bedtimeEnd;
  } else {
    // Wraps midnight (e.g., 22:00 to 06:00)
    return currentTime >= bedtimeStart || currentTime < bedtimeEnd;
  }
}

/**
 * Check if content is age appropriate
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isContentAgeAppropriate(
  contentRating: "G" | "PG" | "PG-13" | "R" | "NC-17",
  ageLimit: number,
  _contentFilters: ParentalControlSettings["contentFilters"]
): boolean {
  const ratingAgeMap = {
    G: 0,
    PG: 6,
    "PG-13": 13,
    R: 17,
    "NC-17": 18,
  };

  const requiredAge = ratingAgeMap[contentRating];
  return requiredAge <= ageLimit;
}

/**
 * Notify parent of activity
 */
export async function notifyParent(
  userId: string,
  eventType: string,
  eventData: Record<string, any>
): Promise<boolean> {
  try {
    const controls = await getParentalControls(userId);
    if (!controls || !controls.notifyParent) return false;

    // Insert notification
    await supabase.from("parent_notifications").insert({
      user_id: userId,
      parent_email: controls.parentEmail,
      event_type: eventType,
      event_data: eventData,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    captureError("Failed to notify parent", { error });
    return false;
  }
}

export default {
  enableParentalControls,
  getParentalControls,
  updateParentalControls,
  logScreenTime,
  checkScreenTimeLimit,
  isCurrentlyBedtime,
  isContentAgeAppropriate,
  notifyParent,
};
