import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const REFERRAL_KEY = "referral_code";

/**
 * On mount, checks URL for `ref` query param and stores it in localStorage.
 */
export function useReferralTracking() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem(REFERRAL_KEY, ref);
    }
  }, [searchParams]);
}

/** Read the stored referral code (or null if none). */
export function getReferralCode(): string | null {
  return localStorage.getItem(REFERRAL_KEY);
}

/** Remove the stored referral code after it has been consumed. */
export function clearReferralCode() {
  localStorage.removeItem(REFERRAL_KEY);
}
