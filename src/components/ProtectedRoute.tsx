import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { verifySubscription } from "@/lib/verifySubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireIntake?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireIntake = true, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, hasAccess, profile, subscription, refreshSubscription, dataLoaded } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(!requireAdmin);
  const navigate = useNavigate();
  const [lastKnownUserId, setLastKnownUserId] = useState<string | null>(null);

  // Check if this is an onboarding route (intake, onboarding, etc.)
  const isOnboardingRoute = ['/intake', '/intake-complete', '/onboarding', '/freeworld-intake'].includes(location.pathname);
  const isFreshSignup = sessionStorage.getItem("rs_fresh_signup") === "true";

  // Detect if user changed (e.g., different account logged in from another tab)
  useEffect(() => {
    if (user && lastKnownUserId && user.id !== lastKnownUserId) {
      navigate("/login", { replace: true });
      return;
    }
    if (user) {
      setLastKnownUserId(user.id);
    }
  }, [user, lastKnownUserId, navigate]);

  // Check admin role if required
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!requireAdmin || !user) {
        setAdminCheckComplete(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (e) {
        console.error('Admin check error:', e);
        setIsAdmin(false);
      } finally {
        setAdminCheckComplete(true);
      }
    };

    if (user && requireAdmin) {
      checkAdminRole();
    }
  }, [user, requireAdmin]);

  // Check if this is a fresh signup that needs subscription verification
  useEffect(() => {
    const checkFreshSignup = async () => {
      // Only run verification if:
      // 1. It's a fresh signup
      // 2. User exists
      // 3. We don't have access yet
      // 4. We're not already verifying
      // 5. We haven't already completed verification
      if (isFreshSignup && user && !hasAccess && !isVerifying && !verificationComplete) {
        setIsVerifying(true);

        const verified = await verifySubscription(user.id, 8, 500);
        if (verified) {
          await refreshSubscription();
        }

        setIsVerifying(false);
        setVerificationComplete(true);
      }
    };
    
    checkFreshSignup();
  }, [user, hasAccess, isVerifying, verificationComplete, refreshSubscription, isFreshSignup]);

  // Debug logging - only in development
  if (import.meta.env.DEV) {
    console.log("ProtectedRoute Debug:", { 
      path: location.pathname,
      user: !!user, 
      loading, 
      hasAccess, 
      dataLoaded,
      profile: !!profile, 
      subscription: subscription?.status,
      intakeCompleted: !!profile?.intake_completed_at,
      videoWatched: !!profile?.first_login_video_watched,
      isVerifying,
      verificationComplete,
      requireAdmin,
      isAdmin,
      adminCheckComplete
    });
  }

  // Show loading during initial auth load, subscription verification, admin check, or if user exists but data hasn't loaded
  if (loading || isVerifying || !adminCheckComplete || (user && !dataLoaded)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {isVerifying ? "Verifying your subscription..." : "Loading..."}
        </p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin check - block non-admins from admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // IMPORTANT: Admin routes skip subscription check entirely - admins always have access
  // Only check subscription for non-admin routes
  if (!requireAdmin && dataLoaded && !hasAccess) {
    // For onboarding routes during fresh signup, give extra time before redirecting
    if (isOnboardingRoute && isFreshSignup && !verificationComplete) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verifying your subscription...</p>
        </div>
      );
    }
    return <Navigate to="/access-expired" replace />;
  }

  // Check if intake is completed (for dashboard routes, not admin)
  if (requireIntake && !requireAdmin && !profile?.intake_completed_at) {
    return <Navigate to="/intake" replace />;
  }

  // Check if onboarding video is completed (for dashboard routes, not admin)
  // Only redirect if profile has loaded (profile !== null) to avoid race condition
  if (requireIntake && !requireAdmin && profile && !profile.first_login_video_watched) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
