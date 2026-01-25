import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, User, Mail, Phone, Check, Lock, Eye, EyeOff, Trophy, Award, Download, MessageSquare, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AvatarUpload from "@/components/AvatarUpload";
import MilestoneBadge from "@/components/MilestoneBadge";
import { useMilestones, PAROLE_MILESTONES } from "@/hooks/useMilestones";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { z } from "zod";

const profileSchema = z.object({
  first_name: z.string().trim().max(50, "First name must be less than 50 characters").optional(),
  last_name: z.string().trim().max(50, "Last name must be less than 50 characters").optional(),
  phone: z.string().trim().max(20, "Phone must be less than 20 characters").optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, refreshProfile } = useAuth();
  const { subscription, isCoaching, isTransformation } = useEffectiveSubscription();
  const { milestones, loading: milestonesLoading, hasMilestone, getFeaturedBadge } = useMilestones();
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, isLoading: pushLoading, permission: pushPermission, subscribe: subscribePush, unsubscribe: unsubscribePush } = usePushNotifications();
  
  const getSettingsLabels = () => {
    if (isCoaching) {
      return {
        pageTitle: "Account Settings",
        pageDescription: "Manage your Free World profile and security",
        profileTitle: "Your Profile",
        profileDescription: "Update your personal details below",
      };
    }
    if (isTransformation) {
      return {
        pageTitle: "Member Settings",
        pageDescription: "Manage your profile and security",
        profileTitle: "Member Profile",
        profileDescription: "Update your personal details below",
      };
    }
    return {
      pageTitle: "Inmate Settings",
      pageDescription: "Manage your profile and security",
      profileTitle: "Inmate Profile",
      profileDescription: "Update your personal details below",
    };
  };
  
  const labels = getSettingsLabels();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Display name state
  const [displayNamePreference, setDisplayNamePreference] = useState<string>("full_name");
  const [displayName, setDisplayName] = useState("");
  const [isSavingDisplay, setIsSavingDisplay] = useState(false);
  const [displaySaved, setDisplaySaved] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
      setDisplayNamePreference(profile.display_name_preference || "full_name");
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setIsSaved(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = profileSchema.safeParse({
      first_name: formData.first_name || undefined,
      last_name: formData.last_name || undefined,
      phone: formData.phone || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name.trim() || null,
          last_name: formData.last_name.trim() || null,
          phone: formData.phone.trim() || null,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      await refreshProfile();
      setIsSaved(true);
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });

      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisplayNameSave = async () => {
    if (displayNamePreference === "nickname" && !displayName.trim()) {
      toast({
        title: "Nickname required",
        description: "Please enter a nickname or choose a different display option.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingDisplay(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          display_name_preference: displayNamePreference,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      await refreshProfile();
      setDisplaySaved(true);
      
      toast({
        title: "Display settings updated",
        description: "Your community display name has been saved.",
      });

      setTimeout(() => setDisplaySaved(false), 3000);
    } catch (error) {
      console.error("Error updating display settings:", error);
      toast({
        title: "Error",
        description: "Failed to update display settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDisplay(false);
    }
  };

  // Get preview name based on current settings
  const getPreviewName = () => {
    if (displayNamePreference === "nickname" && displayName.trim()) {
      return displayName.trim();
    }
    if (displayNamePreference === "first_name" && formData.first_name) {
      return formData.first_name;
    }
    if (formData.first_name && formData.last_name) {
      return `${formData.first_name} ${formData.last_name}`;
    }
    if (formData.first_name) {
      return formData.first_name;
    }
    return formData.email?.split("@")[0] || "You";
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const validation = passwordSchema.safeParse(passwordData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setPasswordErrors(fieldErrors);
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify current password by attempting a sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile?.email || "",
        password: passwordData.currentPassword,
      });

      if (signInError) {
        setPasswordErrors({ currentPassword: "Current password is incorrect" });
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 section-container py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="headline-card">{labels.pageTitle}</h1>
            <p className="text-muted-foreground text-sm">{labels.pageDescription}</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Profile Picture */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Profile Picture</CardTitle>
              <CardDescription>
                Upload a profile picture to personalize your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload 
                currentAvatarUrl={profile?.avatar_url}
              />
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                {labels.profileTitle}
              </CardTitle>
              <CardDescription>
                {labels.profileDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="bg-charcoal-dark border-border"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive">{errors.first_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="bg-charcoal-dark border-border"
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-charcoal-dark border-border opacity-60 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="bg-charcoal-dark border-border"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    type="submit" 
                    variant="gold"
                    disabled={isLoading}
                    className="min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Community Display Name */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                Community Display
              </CardTitle>
              <CardDescription>
                Choose how your name appears in the community chat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Preview</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {getPreviewName().slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-semibold text-foreground">{getPreviewName()}</span>
                  <span className="text-xs text-muted-foreground">says: "Iron sharpens iron!"</span>
                </div>
              </div>

              {/* Display Preference */}
              <div className="space-y-3">
                <Label>Display as</Label>
                <RadioGroup 
                  value={displayNamePreference} 
                  onValueChange={setDisplayNamePreference}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <RadioGroupItem value="full_name" id="full_name" />
                    <Label htmlFor="full_name" className="flex-1 cursor-pointer">
                      <span className="font-medium">Full Name</span>
                      <p className="text-xs text-muted-foreground">
                        {formData.first_name && formData.last_name 
                          ? `${formData.first_name} ${formData.last_name}`
                          : formData.first_name || "Set your name above"}
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <RadioGroupItem value="first_name" id="first_name_opt" />
                    <Label htmlFor="first_name_opt" className="flex-1 cursor-pointer">
                      <span className="font-medium">First Name Only</span>
                      <p className="text-xs text-muted-foreground">
                        {formData.first_name || "Set your first name above"}
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <RadioGroupItem value="nickname" id="nickname" />
                    <Label htmlFor="nickname" className="flex-1 cursor-pointer">
                      <span className="font-medium">Nickname</span>
                      <p className="text-xs text-muted-foreground">
                        Use a custom name in the community
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Nickname Input (conditional) */}
              {displayNamePreference === "nickname" && (
                <div className="space-y-2">
                  <Label htmlFor="display_name">Your Nickname</Label>
                  <Input
                    id="display_name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your nickname"
                    maxLength={30}
                    className="bg-charcoal-dark border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Max 30 characters. Keep it clean, soldier.
                  </p>
                </div>
              )}

              {/* Save Button */}
              <Button
                variant="gold"
                onClick={handleDisplayNameSave}
                disabled={isSavingDisplay}
                className="min-w-[140px]"
              >
                {isSavingDisplay ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : displaySaved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Display Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Security - Password Change */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>
                Change your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      className="bg-charcoal-dark border-border pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min 8 characters)"
                      className="bg-charcoal-dark border-border pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="bg-charcoal-dark border-border"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  variant="goldOutline"
                  disabled={isChangingPassword}
                  className="mt-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Achievements / Parole Board */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-primary" />
                Parole Board Achievements
              </CardTitle>
              <CardDescription>
                Your earned badges and milestones on the journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Featured Badge */}
              {getFeaturedBadge() && (
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <MilestoneBadge
                    icon={getFeaturedBadge()?.badge_icon || "Trophy"}
                    name={getFeaturedBadge()?.milestone_name || ""}
                    description={getFeaturedBadge()?.description || ""}
                    earned={true}
                    earnedAt={getFeaturedBadge()?.earned_at}
                    size="lg"
                    featured={getFeaturedBadge()?.milestone_key === "week_12_complete"}
                    showTooltip={false}
                  />
                  <div>
                    <p className="font-display text-primary text-lg">
                      {getFeaturedBadge()?.milestone_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getFeaturedBadge()?.description}
                    </p>
                    {getFeaturedBadge()?.milestone_key === "week_12_complete" && (
                      <Button variant="goldOutline" size="sm" className="mt-2 gap-2">
                        <Download className="w-4 h-4" />
                        Download Certificate
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* All Badges Grid */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">All Achievements</h4>
                <div className="flex flex-wrap gap-3">
                  {PAROLE_MILESTONES.map((milestone) => {
                    const earned = hasMilestone(milestone.key);
                    const earnedData = milestones.find(m => m.milestone_key === milestone.key);
                    
                    return (
                      <MilestoneBadge
                        key={milestone.key}
                        icon={milestone.icon}
                        name={milestone.name}
                        description={milestone.description}
                        earned={earned}
                        earnedAt={earnedData?.earned_at}
                        size="md"
                      />
                    );
                  })}
                </div>
              </div>

              {/* Progress to Next */}
              {milestones.length < PAROLE_MILESTONES.length && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-semibold">{milestones.length}</span> of{" "}
                    <span className="font-semibold">{PAROLE_MILESTONES.length}</span> achievements earned
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Push Notifications Card */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-base flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Get notified about check-in reminders, milestones, and more
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!pushSupported ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  <p>Push notifications are not supported in your browser.</p>
                  <p className="mt-1 text-xs">Try using Chrome, Firefox, or Safari on a supported device.</p>
                </div>
              ) : pushPermission === "denied" ? (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <p>Notifications are blocked in your browser settings.</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    To enable, click the lock icon in your browser's address bar and allow notifications.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {pushSubscribed ? "Notifications enabled" : "Enable notifications"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {pushSubscribed 
                        ? "You'll receive alerts for important updates" 
                        : "Get reminded about check-ins, workouts, and more"}
                    </p>
                  </div>
                  <Button
                    variant={pushSubscribed ? "outline" : "gold"}
                    size="sm"
                    onClick={pushSubscribed ? unsubscribePush : subscribePush}
                    disabled={pushLoading}
                  >
                    {pushLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : pushSubscribed ? (
                      <>
                        <BellOff className="h-4 w-4 mr-2" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        Enable
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card className="bg-charcoal border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Member since</span>
                <span className="text-foreground">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })
                    : '-'}
                </span>
              </div>
              {subscription && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Plan</span>
                  <span className="text-primary font-semibold capitalize">
                    {subscription.plan_type === "membership" ? "Solitary" : 
                     subscription.plan_type === "transformation" ? "Gen Pop" : 
                     subscription.plan_type === "coaching" ? "Free World" : 
                     subscription.plan_type}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User ID</span>
                <span className="text-foreground font-mono text-xs">
                  {profile?.user_id?.slice(0, 8)}...
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
