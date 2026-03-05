import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { verifySubscription } from "@/lib/verifySubscription";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireIntake?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireIntake = true, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, hasAccess, profile, subscription, refreshSubscription, dataLoaded } = useAuth();
  const { isAdmin, isLoading: isAdminCheckLoading } = useAdminCheck();
  const { isTestingFlow } = useAdminPreview();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const navigate = useNavigate();
  const [lastKnownUserId, setLastKnownUserId] = useState<string | null>(null);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  // Check if this is an onboarding route (intake, onboarding, etc.)
  const isOnboardingRoute = ['/intake', '/intake-complete', '/onboarding', '/freeworld-intake'].includes(location.pathname);
  const isFreshSignup = sessionStorage.getItem("rs_fresh_signup") === "true";

  // Safety timeout — never show a loading spinner for more than 10 seconds
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoadingTimedOut(true);
    }, 10000);
    return () => clearTimeout(timeout);
  }, []);

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

  // Check if this is a fresh signup that needs subscription verification
  useEffect(() => {
    const checkFreshSignup = async () => {
      if (isFreshSignup && user && !hasAccess && !isVerifying && !verificationComplete) {
        setIsVerifying(true);

        const verified = await verifySubscription(user.id, 6, 500);
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
      isAdminCheckLoading,
      isTestingFlow,
      loadingTimedOut,
    });
  }

  // Show loading during initial auth load, subscription verification, admin check, or if user exists but data hasn't loaded
  const isStillLoading = loading || isVerifying || isAdminCheckLoading || (user && !dataLoaded);

  if (isStillLoading && !loadingTimedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">
          {isVerifying ? "Verifying your subscription..." : "Loading..."}
        </p>
      </div>
    );
  }

  // If loading timed out and we still don't have a user, redirect to login
  if (loadingTimedOut && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin check - block non-admins from admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // IMPORTANT: Admins ALWAYS have access — they use preview mode to view user dashboards
  // Fresh signups on onboarding routes get through immediately (subscription was just created)
  if (!requireAdmin && dataLoaded && !hasAccess && !isAdmin) {
    // Let fresh signups through to onboarding routes — subscription exists but may not be visible yet
    if (isOnboardingRoute && isFreshSignup) {
      // Fire-and-forget: try to load the subscription in the background
      if (!isVerifying && !verificationComplete) {
        // The useEffect will handle this
      }
      // Let them through regardless
    } else {
      return <Navigate to="/access-expired" replace />;
    }
  }

  // Admin testing full flow — skip intake/onboarding redirects so they can walk through them
  if (isAdmin && isTestingFlow) {
    return <>{children}</>;
  }

  // Check if intake is completed (for dashboard routes, not admin users)
  if (requireIntake && !requireAdmin && !isAdmin && !profile?.intake_completed_at) {
    return <Navigate to="/intake" replace />;
  }

  // Check if onboarding video is completed (for dashboard routes, not admin users)
  // The onboarding video teaches users how to navigate the dashboard
  if (requireIntake && !requireAdmin && !isAdmin && profile && !profile.first_login_video_watched) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
