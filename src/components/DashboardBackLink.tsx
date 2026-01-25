import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardBackLinkProps {
  className?: string;
}

export function DashboardBackLink({ className = "" }: DashboardBackLinkProps) {
  const { subscription } = useAuth();
  const planType = subscription?.plan_type;
  
  // Tier-aware label
  const getLabel = () => {
    switch (planType) {
      case "coaching":
        return "Back to Dashboard";
      case "transformation":
        return "Back to Cell Block";
      case "membership":
      default:
        return "Back to Cell";
    }
  };

  return (
    <Link
      to="/dashboard"
      className={`inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {getLabel()}
    </Link>
  );
}

export default DashboardBackLink;
