import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Subscription {
  id: string;
  plan_type: "membership" | "transformation" | "coaching";
  status: "active" | "cancelled" | "expired";
  started_at: string;
  expires_at: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  goal: string | null;
  height: string | null;
  weight: string | null;
  age: number | null;
  experience: string | null;
  equipment: string | null;
  injuries: string | null;
  faith_commitment: boolean | null;
  intake_completed_at: string | null;
  onboarding_video_watched: boolean | null;
  first_login_video_watched: boolean | null;
  dashboard_video_watched: boolean | null;
  created_at: string;
  display_name: string | null;
  display_name_preference: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  hasAccess: boolean;
  daysRemaining: number | null;
  dataLoaded: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: any }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      ),
    ]);
  };

  // Retry helper with exponential backoff
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 1000,
    label: string
  ): Promise<T> => {
    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`[Auth] ${label} attempt ${attempt}/${maxAttempts} failed:`, error);
        if (attempt < maxAttempts) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1);
          await new Promise(resolve => window.setTimeout(resolve, delay));
        }
      }
    }
    throw lastError;
  };

  const fetchProfile = async (userId: string, isRefresh = false) => {
    console.log("[Auth] fetchProfile start", userId, { isRefresh });

    try {
      const { data, error } = await withRetry(
        () => withTimeout<any>(
          supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
          15000,
          "fetchProfile"
        ),
        3,
        1000,
        "fetchProfile"
      );

      console.log("[Auth] fetchProfile done", { hasData: !!data, error: error ?? null });

      if (error) {
        console.error("[Auth] Profile fetch error:", error);
        // On refresh, keep existing data rather than clearing it on error
        if (!isRefresh) {
          setProfile(null);
        }
        return;
      }

      setProfile(data ? (data as Profile) : null);
    } catch (error) {
      console.error("[Auth] fetchProfile failed after retries:", error);
      // On refresh/token events, keep existing profile data to prevent logout
      if (!isRefresh) {
        setProfile(null);
      }
    }
  };

  const fetchSubscription = async (userId: string, isRefresh = false) => {
    console.log("[Auth] fetchSubscription start", userId, { isRefresh });

    try {
      const { data, error } = await withRetry(
        () => withTimeout<any>(
          supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          15000,
          "fetchSubscription"
        ),
        3,
        1000,
        "fetchSubscription"
      );

      console.log("[Auth] fetchSubscription done", {
        hasData: !!data,
        status: (data as any)?.status,
        plan: (data as any)?.plan_type,
        error: error ?? null,
      });

      if (!error && data) {
        setSubscription(data as Subscription);
      } else if (!isRefresh) {
        // Only clear subscription on initial load, not on refresh errors
        setSubscription(null);
      }
    } catch (error) {
      console.error("[Auth] fetchSubscription failed after retries:", error);
      // On refresh/token events, keep existing subscription to prevent access loss
      if (!isRefresh) {
        setSubscription(null);
      }
    }
  };

  const refreshSubscription = async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Calculate access status
  const calculateAccess = (): boolean => {
    if (!subscription) return false;

    const now = new Date();

    // For transformation plan, check expires_at
    if (subscription.plan_type === "transformation") {
      if (subscription.expires_at) {
        return new Date(subscription.expires_at) > now;
      }
      return false;
    }

    // For membership and coaching, just check status
    return subscription.status === "active";
  };

  // Calculate days remaining for transformation plan
  const calculateDaysRemaining = (): number | null => {
    if (!subscription || subscription.plan_type !== "transformation") {
      return null;
    }

    if (!subscription.expires_at) return null;

    const now = new Date();
    const expiresAt = new Date(subscription.expires_at);
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  useEffect(() => {
    let mounted = true;

    const safeSetLoading = (value: boolean) => {
      if (mounted) setLoading(value);
    };

    safeSetLoading(true);

    // IMPORTANT: set up the auth state change listener BEFORE fetching the session
    // to avoid missing updates during initial load.
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Token refresh events should not clear data on failure
      const isRefreshEvent = event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN';
      console.log("[Auth] onAuthStateChange", { event, hasSession: !!session, isRefreshEvent });

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Pass isRefresh=true for token refresh events to preserve data on errors
          await Promise.all([
            fetchProfile(session.user.id, isRefreshEvent),
            fetchSubscription(session.user.id, isRefreshEvent),
          ]);
          if (mounted) setDataLoaded(true);
        } else {
          setProfile(null);
          setSubscription(null);
          if (mounted) setDataLoaded(true);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
        if (mounted) setDataLoaded(true);
      } finally {
        safeSetLoading(false);
      }
    });

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await Promise.all([
            fetchProfile(data.session.user.id),
            fetchSubscription(data.session.user.id),
          ]);
          if (mounted) setDataLoaded(true);
        } else {
          if (mounted) setDataLoaded(true);
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
        if (mounted) setDataLoaded(true);
      } finally {
        safeSetLoading(false);
      }
    })();

    // Safety net: never spin forever if something upstream hangs unexpectedly.
    // Increased from 12s to 20s to accommodate 3 retry attempts with 15s timeout each
    const timeout = window.setTimeout(() => {
      safeSetLoading(false);
    }, 20000);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      authSubscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear state immediately (optimistic) to prevent UI flash
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setDataLoaded(false);
    // Then complete the actual signout
    await supabase.auth.signOut();
  };

  const hasAccess = calculateAccess();
  const daysRemaining = calculateDaysRemaining();

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        subscription,
        loading,
        hasAccess,
        daysRemaining,
        dataLoaded,
        signUp,
        signIn,
        signOut,
        refreshSubscription,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
