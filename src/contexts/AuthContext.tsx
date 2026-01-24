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
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: Subscription | null;
  loading: boolean;
  hasAccess: boolean;
  daysRemaining: number | null;
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

  const withTimeout = async <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
      ),
    ]);
  };

  const fetchProfile = async (userId: string) => {
    console.log("[Auth] fetchProfile start", userId);

    const { data, error } = await withTimeout<any>(
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      8000,
      "fetchProfile"
    );

    console.log("[Auth] fetchProfile done", { hasData: !!data, error: error ?? null });

    if (error) {
      setProfile(null);
      return;
    }

    setProfile(data ? (data as Profile) : null);
  };

  const fetchSubscription = async (userId: string) => {
    console.log("[Auth] fetchSubscription start", userId);

    const { data, error } = await withTimeout<any>(
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      8000,
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
    } else {
      setSubscription(null);
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
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      try {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await Promise.all([
            fetchProfile(session.user.id),
            fetchSubscription(session.user.id),
          ]);
        } else {
          setProfile(null);
          setSubscription(null);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
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
        }
      } catch (err) {
        console.error("Error getting initial session:", err);
      } finally {
        safeSetLoading(false);
      }
    })();

    // Safety net: never spin forever if something upstream hangs unexpectedly.
    const timeout = window.setTimeout(() => {
      safeSetLoading(false);
    }, 12000);

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
    await supabase.auth.signOut();
    setProfile(null);
    setSubscription(null);
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
