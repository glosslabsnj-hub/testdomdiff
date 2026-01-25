import { Link } from "react-router-dom";
import { Cross, LogOut, Clock, Crown, Sparkles, User, ChevronDown, Shield, Settings, Command, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardHeader = () => {
  const { profile, daysRemaining, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { effectiveSubscription, previewTier, setPreviewTier, isPreviewMode } = useAdminPreview();
  
  // Use effective subscription for display
  const subscription = effectiveSubscription;

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
            Free World
          </Badge>
        );
      case "transformation":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 gap-1">
            <Sparkles className="w-3 h-3" />
            Gen Pop
          </Badge>
        );
      case "membership":
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="w-3 h-3" />
            Solitary
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
        return "Free World 1:1 Coaching";
      case "transformation":
        return "General Population";
      case "membership":
        return "Solitary Confinement";
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
            {/* Admin Tier Preview Toggle */}
            {isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Eye className={`w-4 h-4 mr-2 ${isPreviewMode ? 'text-primary' : 'text-muted-foreground'}`} />
                      <Select
                        value={previewTier || "coaching"}
                        onValueChange={(value) => setPreviewTier(value as "membership" | "transformation" | "coaching")}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-muted/30 border-border">
                          <SelectValue placeholder="Preview as..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coaching">
                            <span className="flex items-center gap-2">
                              <Crown className="w-3 h-3 text-primary" />
                              Free World
                            </span>
                          </SelectItem>
                          <SelectItem value="transformation">
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-primary" />
                              Gen Pop
                            </span>
                          </SelectItem>
                          <SelectItem value="membership">
                            <span className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              Solitary
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Preview dashboard as different tier</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Command Palette Hint */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 hover:bg-muted/50 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors text-xs"
                >
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Quick navigation (⌘K)</p>
              </TooltipContent>
            </Tooltip>

            {/* Days Remaining Badge - Only for 12-week users */}
            {subscription?.plan_type === "transformation" && daysRemaining !== null && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {daysRemaining} days on sentence
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
                      {daysRemaining} days on sentence
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
                {daysRemaining} days on sentence
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
