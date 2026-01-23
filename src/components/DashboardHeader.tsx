import { Link } from "react-router-dom";
import { Cross, Settings, LogOut, Clock, Crown, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const DashboardHeader = () => {
  const { profile, subscription, daysRemaining, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getPlanBadge = () => {
    if (!subscription) return null;

    switch (subscription.plan_type) {
      case "coaching":
        return (
          <Badge className="bg-gradient-to-r from-primary to-amber-500 text-primary-foreground border-0 gap-1">
            <Crown className="w-3 h-3" />
            1:1 Coaching
          </Badge>
        );
      case "transformation":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
            <Sparkles className="w-3 h-3" />
            12-Week Program
          </Badge>
        );
      case "membership":
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="w-3 h-3" />
            Membership
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDisplayName = () => {
    if (profile?.first_name) {
      return profile.first_name;
    }
    return "Brother";
  };

  return (
    <header className="bg-charcoal border-b border-border">
      <div className="section-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Cross className="w-6 h-6 text-primary" />
            <span className="font-display text-xl tracking-wider">
              DOM <span className="text-primary">DIFFERENT</span>
            </span>
          </Link>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Days Remaining Badge - Only for 12-week users */}
            {subscription?.plan_type === "transformation" && daysRemaining !== null && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {daysRemaining} days left
                </span>
              </div>
            )}

            {/* Plan Badge */}
            <div className="hidden md:block">
              {getPlanBadge()}
            </div>

            {/* Welcome Message */}
            <span className="text-sm text-muted-foreground hidden lg:block">
              Welcome, <span className="text-foreground font-medium">{getDisplayName()}</span>
            </span>

            {/* Settings */}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/settings">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>

            {/* Logout */}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile: Days Remaining + Plan Badge */}
        {(subscription?.plan_type === "transformation" && daysRemaining !== null) && (
          <div className="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {daysRemaining} days left
              </span>
            </div>
            {getPlanBadge()}
          </div>
        )}

        {/* Mobile: Plan Badge only (for non-transformation users) */}
        {subscription?.plan_type !== "transformation" && subscription && (
          <div className="flex md:hidden items-center gap-2 mt-3 pt-3 border-t border-border">
            {getPlanBadge()}
            <span className="text-sm text-muted-foreground">
              Welcome, {getDisplayName()}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
