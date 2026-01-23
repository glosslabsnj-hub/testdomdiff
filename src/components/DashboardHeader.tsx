import { Link } from "react-router-dom";
import { Cross, LogOut, Clock, Crown, Sparkles, User, ChevronDown, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DashboardHeader = () => {
  const { profile, subscription, daysRemaining, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

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

  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return profile?.email || "Member";
  };

  const getPlanName = () => {
    if (!subscription) return "No active plan";
    switch (subscription.plan_type) {
      case "coaching":
        return "1:1 Redemption Coaching";
      case "transformation":
        return "12-Week Transformation";
      case "membership":
        return "Discipline Membership";
      default:
        return "Active Plan";
    }
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

            {/* Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-charcoal border-border">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">{getFullName()}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                
                {/* Plan Status */}
                <div className="px-2 py-2">
                  <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                  <div className="flex items-center gap-2">
                    {getPlanBadge()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{getPlanName()}</p>
                  {subscription?.plan_type === "transformation" && daysRemaining !== null && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysRemaining} days remaining
                    </p>
                  )}
                </div>
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to="/admin" className="flex items-center gap-2 text-gold">
                        <Shield className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator className="bg-border" />
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
