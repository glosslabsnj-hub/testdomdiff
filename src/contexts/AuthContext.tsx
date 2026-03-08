import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
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
  signUp: (email: string, password: string) => Promise<{ error: Error | null; data: { user: User | null; session: Session | null } }>;
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

  // Track which user's data we already have to avoid redundant fetches
  const loadedUserIdRef = useRef<string | null>(null);

  const fetchProfile = async (userId: string) => {
    if (import.meta.env.DEV) console.log("[Auth] fetchProfile start", userId);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (import.meta.env.DEV) console.log("[Auth] fetchProfile done", { hasData: !!data, error: error ?? null });

      if (error) {
        console.error("[Auth] Profile fetch error:", error);
        return;
      }

      setProfile(data ? (data as Profile) : null);
    } catch (error) {
      console.error("[Auth] fetchProfile failed:", error);
    }
  };

  const fetchSubscription = async (userId: string) => {
    if (import.meta.env.DEV) console.log("[Auth] fetchSubscription start", userId);

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (import.meta.env.DEV) {
        console.log("[Auth] fetchSubscription done", {
          hasData: !!data,
          status: data?.status,
          plan: data?.plan_type,
          error: error ?? null,
        });
      }

      if (!error && data) {
        setSubscription(data as Subscription);
      }
    } catch (error) {
      console.error("[Auth] fetchSubscription failed:", error);
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

  // Calculate access status — check both status and expiry
  const calculateAccess = (): boolean => {
    if (!subscription) return false;
    if (subscription.status !== "active") return false;
    // If there's an expiry date, check it
    if (subscription.expires_at) {
      const now = new Date();
      const expiresAt = new Date(subscription.expires_at);
      if (expiresAt < now) return false;
    }
    // Recurring plans (membership/coaching) MUST have an expiry date
    // If expires_at is null for a recurring plan, deny access (data integrity issue)
    if (!subscription.expires_at && subscription.plan_type !== "transformation") {
      return false;
    }
    return true;
  };

  const calculateDaysRemaining = (): number | null => {
    if (!subscription || !subscription.expires_at) return null;

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

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (import.meta.env.DEV) console.log("[Auth] onAuthStateChange", { event, hasSession: !!session });

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userId = session.user.id;

        // Skip refetch if we already loaded this user's data (e.g. TOKEN_REFRESHED, duplicate SIGNED_IN)
        if (loadedUserIdRef.current === userId) {
          if (import.meta.env.DEV) console.log("[Auth] Skipping refetch — data already loaded for", userId);
          safeSetLoading(false);
          return;
        }

        // New user or first load — fetch data
        setDataLoaded(false);
        try {
          await Promise.all([
            fetchProfile(userId),
            fetchSubscription(userId),
          ]);
        } catch (err) {
          console.error("Auth data fetch error:", err);
        }
        if (mounted) {
          loadedUserIdRef.current = userId;
          setDataLoaded(true);
        }
      } else {
        loadedUserIdRef.current = null;
        setProfile(null);
        setSubscription(null);
        if (mounted) setDataLoaded(true);
      }

      safeSetLoading(false);
    });

    // Kick-start auth flow — onAuthStateChange handles the rest
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error getting initial session:", error);
        // If the refresh token is invalid/expired, clear stale auth data
        // so the user isn't stuck on a loading screen
        if (error.message?.includes("Refresh Token") || error.status === 400) {
          console.warn("[Auth] Stale refresh token detected — signing out locally");
          supabase.auth.signOut({ scope: "local" });
        }
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setSubscription(null);
          loadedUserIdRef.current = null;
          setDataLoaded(true);
          safeSetLoading(false);
        }
      } else if (!data.session && mounted) {
        // No session and no error — user is simply not logged in
        setDataLoaded(true);
        safeSetLoading(false);
      }
    });

    // Safety net timeout — reduced since we removed retries
    const timeout = window.setTimeout(() => {
      safeSetLoading(false);
      if (mounted && !dataLoaded) setDataLoaded(true);
    }, 5000);

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
    // Clear cached user so data is fetched fresh on sign-in
    loadedUserIdRef.current = null;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Clear state immediately (optimistic) to prevent UI flash
    loadedUserIdRef.current = null;
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(null);
    setDataLoaded(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // If server-side signout fails (e.g. invalid token), clear locally
      await supabase.auth.signOut({ scope: "local" });
    }
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
