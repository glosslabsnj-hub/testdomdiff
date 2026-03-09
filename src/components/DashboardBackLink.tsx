import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardBackLinkProps {
  className?: string;
}

export function DashboardBackLink({ className = "" }: DashboardBackLinkProps) {
  const { subscription } = useAuth();
  const planType = subscription?.plan_type;
  
  // All tiers use same clear label
  const getLabel = () => "Back to Dashboard";

  return (
    <Link
      to="/dashboard"
      className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 min-h-[44px] ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {getLabel()}
    </Link>
  );
}

export default DashboardBackLink;
