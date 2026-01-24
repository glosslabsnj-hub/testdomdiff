import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireIntake?: boolean;
}

const ProtectedRoute = ({ children, requireIntake = true }: ProtectedRouteProps) => {
  const { user, loading, hasAccess, profile, subscription } = useAuth();
  const location = useLocation();

  // Debug logging - only in development
  if (import.meta.env.DEV) {
    console.log("ProtectedRoute Debug:", { 
      path: location.pathname,
      user: !!user, 
      loading, 
      hasAccess, 
      profile: !!profile, 
      subscription: subscription?.status,
      intakeCompleted: !!profile?.intake_completed_at 
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No valid subscription
  if (!hasAccess) {
    return <Navigate to="/access-expired" replace />;
  }

  // Check if intake is completed (for dashboard routes)
  if (requireIntake && !profile?.intake_completed_at) {
    return <Navigate to="/intake" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
