import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  Dumbbell,
  Calendar,
  Clock,
  Utensils,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  Users,
  Crown,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Lock,
  Sparkles,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";
import DashboardLayout from "@/components/DashboardLayout";
import StreakWarningBanner from "@/components/StreakWarningBanner";
import { DashboardPullToRefresh } from "@/components/DashboardPullToRefresh";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";

import { RollCallToday } from "@/components/dashboard/RollCallToday";
import { DashboardWelcomeCard } from "@/components/dashboard/DashboardWelcomeCard";
import { GamificationCard, StreakCounter } from "@/components/dashboard/GamificationCard";
import { UpgradeNudge } from "@/components/dashboard/UpgradeNudge";
import { NotificationPrompt } from "@/components/dashboard/NotificationPrompt";
import { ReleaseCeremony } from "@/components/dashboard/ReleaseCeremony";
import { PhaseMilestone } from "@/components/dashboard/PhaseMilestone";


const Dashboard = () => {
  const { profile } = useAuth();
  const { subscription, isCoaching, isTransformation, isMembership } = useEffectiveSubscription();

  // Schedule local reminder notifications (fire-and-forget)
  useNotificationScheduler();
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Calculate current week based on subscription start date
  const currentWeek = (() => {
    if (subscription?.started_at) {
      const startDate = new Date(subscription.started_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.min(12, Math.max(1, Math.floor(diffDays / 7) + 1));
    }
    return 1;
  })();


  // Clear fresh signup flag once user successfully reaches dashboard
  useEffect(() => {
    sessionStorage.removeItem("rs_fresh_signup");
  }, []);

  // Show welcome banner for new users (within 7 days of intake)
  useEffect(() => {
    if (profile?.intake_completed_at) {
      const intakeDate = new Date(profile.intake_completed_at);
      const daysSinceIntake = (Date.now() - intakeDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceIntake <= 7) {
        const dismissed = localStorage.getItem("welcomeBannerDismissed");
        if (!dismissed) {
          setShowWelcomeBanner(true);
        }
      }
    }
  }, [profile]);

  const dismissWelcomeBanner = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem("welcomeBannerDismissed", "true");
  };

  // Check if user is new (within 7 days)
  const isNewUser = profile?.intake_completed_at 
    ? (Date.now() - new Date(profile.intake_completed_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
    : false;

  // Define all tiles - themed based on subscription tier
  const allTiles = {
    startHere: {
      icon: Play,
      title: isCoaching ? "Welcome Home" : "Intake Processing",
      subtitle: isCoaching ? "You're on Probation" : "Week 0 Orientation",
      description: isCoaching 
        ? "Dom is your P.O. He's got your back and will help you succeed on the outside."
        : "Complete your intake processing. Get oriented with the program.",
      href: "/dashboard/start-here",
      color: "dashboard-tile border-primary/30",
      isNew: isNewUser,
    },
    program: {
      icon: Calendar,
      title: isCoaching ? "Your Program" : "The Sentence",
      subtitle: isCoaching ? "12-Week Journey" : "12-Week Program",
      description: isCoaching
        ? "Your personalized 12-week program. Stay on track with weekly milestones."
        : "Your 12-week sentence. Structured progression with weekly breakdown.",
      href: "/dashboard/program",
      color: "dashboard-tile",
      isNew: false,
    },
    workouts: {
      icon: Dumbbell,
      title: isCoaching ? "Training Sessions" : "Iron Pile",
      subtitle: isCoaching ? "Your Workouts" : (isMembership ? "Your Workouts" : "Full Iron Access"),
      description: isCoaching
        ? "Access your full workout library. Train like you mean it."
        : (isMembership
          ? "Your workout templates. No excuses."
          : "Full workout library. Build your sessions like we built ours inside."),
      href: "/dashboard/workouts",
      color: "dashboard-tile",
      isNew: false,
    },
    discipline: {
      icon: Clock,
      title: isCoaching ? "Daily Structure" : "Lights On / Lights Out",
      subtitle: isCoaching ? "Morning & Evening" : "Daily Routines",
      description: isCoaching
        ? "Morning and evening routines. Build habits that stick."
        : "Morning and evening routines. Structure breeds discipline.",
      href: "/dashboard/discipline",
      color: "dashboard-tile",
      isNew: false,
    },
    nutrition: {
      icon: Utensils,
      title: isCoaching ? "Meal Planning" : "Chow Hall",
      subtitle: isCoaching ? "Nutrition Guide" : "Meal Plans",
      description: isCoaching
        ? "Your personalized meal templates. Fuel for the free world."
        : "Simple meal templates. Fuel the machine, feed the soul.",
      href: "/dashboard/nutrition",
      color: "dashboard-tile",
      isNew: false,
    },
    faith: {
      icon: BookOpen,
      title: isCoaching ? "Faith & Mindset" : "Chapel",
      subtitle: isCoaching ? "Weekly Growth" : "Faith & Mindset",
      description: isCoaching
        ? "Weekly lessons on faith, purpose, and staying grounded."
        : "Weekly lessons on faith, discipline, and mental fortitude.",
      href: "/dashboard/faith",
      color: "dashboard-tile",
      isNew: false,
    },
    checkIn: {
      icon: ClipboardCheck,
      title: isCoaching ? "Weekly Report" : "Roll Call",
      subtitle: isCoaching ? "Check-In" : "Weekly Check-In",
      description: isCoaching
        ? "Submit your weekly report. Stay accountable to your goals."
        : "Submit your weekly report. Accountability is freedom.",
      href: "/dashboard/check-in",
      color: "dashboard-tile",
      isNew: false,
    },
    progress: {
      icon: TrendingUp,
      title: isCoaching ? "Progress Report" : "Time Served",
      subtitle: isCoaching ? "Your Journey" : "Progress Tracker",
      description: isCoaching
        ? "Track your transformation. Celebrate every milestone."
        : "Track your transformation. See how far you've come.",
      href: "/dashboard/progress",
      color: "dashboard-tile",
      isNew: false,
    },
    skills: {
      icon: Briefcase,
      title: isCoaching ? "Career Building" : "Work Release",
      subtitle: isCoaching ? "Financial Freedom" : "Skill-Building",
      description: isCoaching
        ? "Advanced business skills. Build real income streams."
        : "Learn money-making skills. Build your hustle for the outside.",
      href: "/dashboard/skills",
      color: "dashboard-tile",
      isNew: false,
    },
    community: {
      icon: Users,
      title: isCoaching ? "The Network" : "The Yard",
      subtitle: isCoaching ? "Your Brotherhood" : "Brotherhood",
      description: isCoaching
        ? "Connect with fellow free men. Build lasting relationships."
        : "Connect with fellow inmates. Iron sharpens iron.",
      href: "/dashboard/community",
      color: "dashboard-tile",
      isNew: false,
    },
    photoGallery: {
      icon: Camera,
      title: isCoaching ? "Photo Gallery" : "Mugshots",
      subtitle: isCoaching ? "Your Journey" : "Progress Photos",
      description: isCoaching
        ? "View your transformation timeline. Compare and track your progress."
        : "View your transformation. See how far you've come since booking.",
      href: "/dashboard/photos",
      color: "dashboard-tile",
      isNew: false,
    },
    advancedSkills: {
      icon: GraduationCap,
      title: "Entrepreneur Track",
      subtitle: "Advanced Business",
      description: "Advanced business strategies for building real wealth.",
      href: "/dashboard/advanced-skills",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
      isNew: false,
    },
    messages: {
      icon: MessageCircle,
      title: "Direct Line",
      subtitle: "Message Dom",
      description: "Direct messaging with your coach. Get answers when you need them.",
      href: "/dashboard/messages",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
      isNew: false,
    },
    coaching: {
      icon: Crown,
      title: "Coaching Portal",
      subtitle: "1:1 Access",
      description: "Your exclusive coaching portal. Premium access to Dom.",
      href: "/dashboard/coaching",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
      isNew: false,
    },
    customProgram: {
      icon: Sparkles,
      title: "Custom Program",
      subtitle: "Your Personal Plan",
      description: "Your personalized training program designed specifically for you by Dom.",
      href: "/dashboard/custom-program",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
      isNew: true,
    },
  };

  // Define locked tiles for Solitary users (Gen Pop features)
  // Faith is now unlocked (Week 1 preview available for Solitary)
  const lockedTilesForMembership = [
    { ...allTiles.program, locked: true, featureName: "The Sentence (12-Week Program)" },
    { ...allTiles.skills, locked: true, featureName: "Work Release (Skill-Building)" },
    { ...allTiles.community, locked: true, featureName: "The Yard (Community)" },
  ];
  
  // Define locked tiles for Gen Pop users (Free World features)
  const lockedTilesForTransformation = [
    { ...allTiles.advancedSkills, locked: true, featureName: "Entrepreneur Track (Advanced Business)", isCoachingOnly: true },
    { ...allTiles.messages, locked: true, featureName: "Direct Line (Message Dom)", isCoachingOnly: true },
    { ...allTiles.coaching, locked: true, featureName: "Coaching Portal (1:1 Access)", isCoachingOnly: true },
  ];
  
  type TileType = typeof allTiles.startHere & { locked?: boolean; featureName?: string; isCoachingOnly?: boolean };
  
  // Build tier-specific tile order for better user journey
  const getTilesForTier = (): TileType[] => {
    if (isMembership) {
      // Solitary: Daily actions first, faith preview, progress, locked features last
      return [
        allTiles.startHere,
        allTiles.workouts,
        allTiles.discipline,
        allTiles.nutrition,
        { ...allTiles.faith, subtitle: "Week 1 Preview" },  // Unlocked preview
        allTiles.checkIn,
        allTiles.progress,
        allTiles.photoGallery,
        // Locked features grouped at bottom as upgrade path
        ...([
          lockedTilesForMembership.find(t => t.featureName?.includes("12-Week")),
          lockedTilesForMembership.find(t => t.featureName?.includes("Skill")),
          lockedTilesForMembership.find(t => t.featureName?.includes("Community")),
          lockedTilesForTransformation.find(t => t.featureName?.includes("Entrepreneur")),
          lockedTilesForTransformation.find(t => t.featureName?.includes("Direct Line")),
          lockedTilesForTransformation.find(t => t.featureName?.includes("Coaching Portal")),
        ].filter(Boolean)),
      ];
    }
    
    if (isTransformation) {
      // Gen Pop: The Sentence is primary focus, Yard Time moved near bottom (secondary workout library)
      return [
        allTiles.startHere,          // Intake Processing
        allTiles.program,            // The Sentence - primary 12-week focus
        allTiles.discipline,         // Lights On / Lights Out
        allTiles.nutrition,          // Chow Hall
        allTiles.faith,              // Chapel
        allTiles.checkIn,            // Roll Call
        allTiles.progress,           // Time Served
        allTiles.photoGallery,       // Mugshots - visual tracking
        allTiles.skills,             // Work Release
        allTiles.community,          // The Yard (community)
        allTiles.workouts,           // Yard Time - moved down (base feature)
        // Locked premium features
        ...([
          lockedTilesForTransformation.find(t => t.featureName?.includes("Entrepreneur")),
          lockedTilesForTransformation.find(t => t.featureName?.includes("Direct Line")),
          lockedTilesForTransformation.find(t => t.featureName?.includes("Coaching Portal")),
        ].filter(Boolean)),
      ];
    }
    
    // Coaching (Free World): VIP features first, then daily essentials, then growth
    return [
      allTiles.startHere,       // Welcome Home
      allTiles.customProgram,   // Custom Program - primary focus for coaching
      allTiles.coaching,        // Coaching Portal - VIP access
      allTiles.messages,        // Direct Line - high-touch messaging
      allTiles.discipline,      // Daily Structure - daily habits
      allTiles.nutrition,       // Meal Planning - daily fuel
      allTiles.program,         // 12-Week Program (fallback while custom is being built)
      allTiles.workouts,        // Training Sessions
      allTiles.faith,           // Faith & Mindset
      allTiles.checkIn,         // Weekly Report
      allTiles.progress,        // Progress Report
      allTiles.photoGallery,    // Photo Gallery
      allTiles.skills,          // Career Building
      allTiles.community,       // The Network
      allTiles.advancedSkills,  // Entrepreneur Track
    ];
  };
  
  const tiles = getTilesForTier();

  const handleTileClick = (tile: TileType, e: React.MouseEvent) => {
    if (tile.locked) {
      e.preventDefault();
      setLockedFeature(tile.featureName || "This feature");
      setUpgradeModalOpen(true);
    }
  };

  return (
    <DashboardLayout showBreadcrumb={false}>
      <DashboardPullToRefresh queryKeys={["profile", "subscription", "checkIns", "workoutCompletions", "dayCompletions"]}>
        <div className="section-container py-6 sm:py-8 lg:py-12">
          {/* Streak Warning Banner - shows after 6pm if tasks incomplete */}
          <StreakWarningBanner />

          {/* Release Ceremony - shows when 12 weeks complete */}
          <ReleaseCeremony />

          {/* Phase Milestone - shows when Foundation (Week 4) or Build (Week 8) completes */}
          <PhaseMilestone />

        {/* Compact Welcome Card - replaces verbose welcome banner */}
        <div className="flex items-center justify-between mb-2 min-w-0">
          <DashboardWelcomeCard userName={profile?.first_name || undefined} />
          <StreakCounter />
        </div>

        {/* Daily Mission Card - prioritized next-step guidance */}
        <RollCallToday />

        {/* Coaching Plan Status Banner - important, keep visible */}
        {isCoaching && profile?.coaching_plan_status && profile.coaching_plan_status !== "approved" && profile.coaching_plan_status !== "none" && (
          <div className="mb-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                {profile.coaching_plan_status === "generating" ? (
                  <Clock className="w-5 h-5 text-purple-400 animate-spin" />
                ) : (
                  <Crown className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-purple-400">
                  {profile.coaching_plan_status === "generating"
                    ? "Building Your Plan..."
                    : "Dom is Reviewing Your Plan"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile.coaching_plan_status === "generating"
                    ? "Creating personalized plans based on your intake."
                    : "Dom is picking the perfect plan for you. You'll be notified when ready."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Solitary Progress - compact inline */}
        {isMembership && subscription?.started_at && (
          <div className="mb-4 p-4 rounded-lg bg-charcoal border border-primary/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-display text-base text-primary">
                  Day {Math.max(1, Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24)))} — Week {currentWeek}
                </p>
                <p className="text-xs text-muted-foreground">Building your foundation</p>
              </div>
            </div>
            <Link to="/checkout?plan=transformation" className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-sm font-medium text-primary flex-shrink-0 hover:bg-primary/20 transition-colors">
              Level Up
            </Link>
          </div>
        )}

        {/* Push Notification Prompt */}
        <NotificationPrompt />

        {/* Gamification Card - Streaks, Badges, Accountability Score */}
        <GamificationCard />

        {/* Section Header */}
        <div className="mb-4">
          <h2 className="headline-section mb-1">
            {isCoaching ? "Your Dashboard" : "Your Cell Block"}
          </h2>
        </div>

        {/* Tiles Grid - 2 columns on mobile, 2 on sm, 4 on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {tiles.map((tile, index) => (
            <Link
              key={index}
              to={tile.locked ? "#" : tile.href}
              onClick={(e) => handleTileClick(tile, e)}
              className={`block transition-all duration-200 relative group active:scale-[0.97] rounded-xl p-4 ${
                tile.locked
                  ? tile.isCoachingOnly
                    ? "tile-locked opacity-70 hover:opacity-80 frosted-lock border-crimson/40 bg-gradient-to-br from-crimson/10 to-transparent"
                    : "tile-locked opacity-70 hover:opacity-80 frosted-lock"
                  : `${tile.color} hover-lift`
              }`}
            >
              {/* New User Badge */}
              {tile.isNew && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
                    <div className="relative px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full shadow-lg">
                      NEW
                    </div>
                  </div>
                </div>
              )}

              {tile.locked && (
                <div className="absolute top-2 right-2 z-10">
                  <Lock className={`w-3.5 h-3.5 ${tile.isCoachingOnly ? "text-amber-500" : "text-crimson"}`} />
                </div>
              )}

              <tile.icon className={`w-8 h-8 mb-3 ${
                tile.locked
                  ? "text-crimson/60"
                  : "text-primary"
              }`} />

              <h3 className="font-bold text-sm mb-0.5 relative z-10 leading-tight">{tile.title}</h3>
              <p className={`text-xs relative z-10 ${tile.locked ? "text-crimson/70" : "text-muted-foreground"}`}>
                {tile.subtitle}
              </p>
            </Link>
          ))}
        </div>
        
        <SolitaryUpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature={lockedFeature}
        />

        {/* Upgrade Nudge for Solitary users in week 2+ */}
        {isMembership && currentWeek >= 2 && <UpgradeNudge trigger="week_2" className="mt-6" />}
        </div>
      </DashboardPullToRefresh>
    </DashboardLayout>
  );
};

export default Dashboard;
