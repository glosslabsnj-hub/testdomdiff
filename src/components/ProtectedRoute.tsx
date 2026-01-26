import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireIntake?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireIntake = true, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, hasAccess, profile, subscription, refreshSubscription } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(!requireAdmin);

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
      const isFreshSignup = sessionStorage.getItem("rs_fresh_signup") === "true";
      
      if (isFreshSignup && user && !hasAccess && !isVerifying) {
        setIsVerifying(true);
        
        // Try to verify subscription with retries
        for (let i = 0; i < 5; i++) {
          const { data } = await supabase
            .from("subscriptions")
            .select("id, status")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();
          
          if (data) {
            await refreshSubscription();
            sessionStorage.removeItem("rs_fresh_signup");
            break;
          }
          await new Promise(r => setTimeout(r, 400));
        }
        
        setIsVerifying(false);
        setVerificationComplete(true);
        sessionStorage.removeItem("rs_fresh_signup");
      }
    };
    
    checkFreshSignup();
  }, [user, hasAccess, isVerifying, refreshSubscription]);

  // Debug logging - only in development
  if (import.meta.env.DEV) {
    console.log("ProtectedRoute Debug:", { 
      path: location.pathname,
      user: !!user, 
      loading, 
      hasAccess, 
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

  // Show loading during initial auth load, subscription verification, or admin check
  if (loading || isVerifying || !adminCheckComplete) {
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

  // Admin check - block non-admins from admin routes BEFORE any data loads
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // No valid subscription (only check for non-admin routes)
  if (!requireAdmin && !hasAccess) {
    return <Navigate to="/access-expired" replace />;
  }

  // Check if intake is completed (for dashboard routes, not admin)
  if (requireIntake && !requireAdmin && !profile?.intake_completed_at) {
    return <Navigate to="/intake" replace />;
  }

  // Check if onboarding video is completed (for dashboard routes, not admin)
  if (requireIntake && !requireAdmin && !profile?.first_login_video_watched) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
