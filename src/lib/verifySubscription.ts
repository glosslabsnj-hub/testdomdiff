import { supabase } from "@/integrations/supabase/client";

/**
 * Verify that an active subscription exists for a user,
 * retrying with exponential backoff to handle RLS replication delays.
 */
export async function verifySubscription(
  userId: string,
  maxAttempts = 5,
  baseDelayMs = 300
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (data) return true;

    // Exponential backoff with jitter
    const delay = baseDelayMs * Math.pow(2, i) + Math.random() * 100;
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
}
