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
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Camera,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";
import DashboardLayout from "@/components/DashboardLayout";
import OrientationModal from "@/components/OrientationModal";
import { WardenBrief } from "@/components/warden";
import { TransformationWidget } from "@/components/TransformationWidget";
import WeeklyProgressCard from "@/components/WeeklyProgressCard";
import StreakWarningBanner from "@/components/StreakWarningBanner";
import OnboardingTooltip from "@/components/OnboardingTooltip";
import { DashboardOnboardingVideo } from "@/components/DashboardOnboardingVideo";
import { RollCallToday } from "@/components/dashboard/RollCallToday";
import { WeekSentenceCard } from "@/components/dashboard/WeekSentenceCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Tooltip explanations for prison terminology (used for non-coaching tiers)
const prisonTooltips: Record<string, string> = {
  "Intake Processing": "Complete your orientation and get set up",
  "The Sentence": "Your structured 12-week transformation program",
  "Yard Time": "Your workout library — train like you mean it",
  "Lights On / Lights Out": "Morning and evening discipline routines",
  "Chow Hall": "Nutrition guidance and meal planning",
  "Chapel": "Weekly faith lessons and mindset training",
  "Roll Call": "Submit your weekly check-in for accountability",
  "Time Served": "Track your transformation progress",
  "Work Release": "Build income-generating skills for life outside",
  "The Yard": "Connect with your brothers in the community",
  "Mugshots": "View and compare your progress photos",
};

// Tooltip explanations for coaching/Free World tier
const coachingTooltips: Record<string, string> = {
  "Welcome Home": "Your probation orientation - complete your checklist",
  "Your Program": "Your personalized 12-week journey",
  "Training Sessions": "Your complete workout library",
  "Daily Structure": "Morning and evening habit routines",
  "Meal Planning": "Nutrition guidance and meal templates",
  "Faith & Mindset": "Weekly growth lessons",
  "Weekly Report": "Report to your P.O. for accountability",
  "Progress Report": "Track your transformation journey",
  "Career Building": "Build legitimate income streams",
  "The Network": "Connect with your brotherhood",
  "Photo Gallery": "View and compare your progress photos",
};

// Benefit messages for locked tiles
const lockedBenefits: Record<string, string> = {
  "The Sentence (12-Week Program)": "Unlock structured 12-week progression",
  "Chapel (Faith & Mindset)": "Unlock weekly scripture & mindset training",
  "Work Release (Skill-Building)": "Unlock money-making hustle skills",
  "The Yard (Community)": "Connect with your brothers on this journey",
};

// Week-specific greeting messages for inmates
function getWeekSpecificGreeting(week: number): string {
  if (week === 1) return "Welcome to the block.";
  if (week === 12) return "Final week. Finish strong.";
  return `Week ${week} of your sentence.`;
}

// Week-specific body message
function getWeekSpecificMessage(week: number, isCoaching: boolean, isMembership: boolean): React.ReactNode {
  if (isCoaching) {
    return (
      <>
        Start with <Link to="/dashboard/start-here" className="text-primary hover:underline font-medium">Orientation</Link> to get set up, 
        then head to <Link to="/dashboard/program" className="text-primary hover:underline font-medium">your custom workout plan</Link> to see your personalized programming.
      </>
    );
  }
  
  if (isMembership) {
    return (
      <>
        Start with <Link to="/dashboard/start-here" className="text-primary hover:underline font-medium">Intake Processing</Link> to get oriented, 
        then head to <Link to="/dashboard/workouts" className="text-primary hover:underline font-medium">Yard Time</Link> to start your first workout.
      </>
    );
  }
  
  // Gen Pop / Transformation
  if (week === 1) {
    return (
      <>
        Complete your <Link to="/dashboard/start-here" className="text-primary hover:underline font-medium">Intake Processing</Link>, 
        then start <Link to="/dashboard/program" className="text-primary hover:underline font-medium">The Sentence</Link> to begin your 12-week transformation.
      </>
    );
  }
  if (week === 12) {
    return (
      <>
        This is it. <Link to="/dashboard/program" className="text-primary hover:underline font-medium">Finish The Sentence</Link> and complete your transformation.
      </>
    );
  }
  return (
    <>
      Week {week} is waiting. Continue <Link to="/dashboard/program" className="text-primary hover:underline font-medium">The Sentence</Link> and keep building momentum.
    </>
  );
}

const Dashboard = () => {
  const { profile } = useAuth();
  const { subscription, isCoaching, isTransformation, isMembership } = useEffectiveSubscription();
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [showAllTiles, setShowAllTiles] = useState(false);

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
      title: isCoaching ? "Training Sessions" : "Yard Time",
      subtitle: isCoaching ? "Your Workouts" : (isMembership ? "Bodyweight Only" : "Full Iron Access"),
      description: isCoaching 
        ? "Access your full workout library. Train like you mean it."
        : (isMembership 
          ? "Bodyweight workouts. No equipment, no excuses."
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
  };

  // Define locked tiles for Solitary users (Gen Pop features)
  const lockedTilesForMembership = [
    { ...allTiles.program, locked: true, featureName: "The Sentence (12-Week Program)" },
    { ...allTiles.faith, locked: true, featureName: "Chapel (Faith & Mindset)" },
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
      // Solitary: Daily actions first, progress second, locked features last
      return [
        allTiles.startHere,
        allTiles.workouts,
        allTiles.discipline,
        allTiles.nutrition,
        allTiles.checkIn,
        allTiles.progress,
        allTiles.photoGallery,
        // Locked features grouped at bottom as upgrade path
        lockedTilesForMembership.find(t => t.featureName?.includes("12-Week"))!,
        lockedTilesForMembership.find(t => t.featureName?.includes("Chapel"))!,
        lockedTilesForMembership.find(t => t.featureName?.includes("Skill"))!,
        lockedTilesForMembership.find(t => t.featureName?.includes("Community"))!,
        lockedTilesForTransformation.find(t => t.featureName?.includes("Entrepreneur"))!,
        lockedTilesForTransformation.find(t => t.featureName?.includes("Direct Line"))!,
        lockedTilesForTransformation.find(t => t.featureName?.includes("Coaching Portal"))!,
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
        lockedTilesForTransformation.find(t => t.featureName?.includes("Entrepreneur"))!,
        lockedTilesForTransformation.find(t => t.featureName?.includes("Direct Line"))!,
        lockedTilesForTransformation.find(t => t.featureName?.includes("Coaching Portal"))!,
      ];
    }
    
    // Coaching (Free World): VIP features right after orientation
    return [
      allTiles.startHere,       // Welcome Home
      allTiles.coaching,        // Coaching Portal - VIP first
      allTiles.messages,        // Direct Line - high-touch messaging
      allTiles.program,         // Your Program
      allTiles.workouts,        // Training Sessions
      allTiles.discipline,      // Daily Structure
      allTiles.nutrition,       // Meal Planning
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
      <div className="section-container py-8">
        {/* Streak Warning Banner - shows after 6pm if tasks incomplete */}
        <StreakWarningBanner />

        {/* Onboarding Video - First thing for new users */}
        {isNewUser && (
          <DashboardOnboardingVideo 
            tierKey={subscription?.plan_type || "membership"}
            tierName={isCoaching ? "Free World" : isTransformation ? "General Population" : "Solitary Confinement"}
          />
        )}

        {/* Welcome Banner for New Users */}
        {showWelcomeBanner && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 relative animate-fade-in">
            <button 
              onClick={dismissWelcomeBanner}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-start gap-4 pr-8">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {isCoaching ? "Welcome aboard." : getWeekSpecificGreeting(currentWeek)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {getWeekSpecificMessage(currentWeek, isCoaching, isMembership)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Roll Call Today - Single CTA Widget */}
        <RollCallToday />

        {/* The Warden's Weekly Brief */}
        <div className="mb-8">
          <WardenBrief />
        </div>
        {/* Week Schedule Card */}
        <WeekSentenceCard />

        {/* Weekly Progress Summary */}
        <WeeklyProgressCard />

        {/* Transformation Progress Widget */}
        <TransformationWidget />

        <OnboardingTooltip tooltipId="dashboard" position="bottom">
          <div className="mb-8">
            <h1 className="headline-section mb-2">
              Your <span className="text-primary">{isCoaching ? "Dashboard" : "Cell Block"}</span>
            </h1>
            <p className="text-muted-foreground">
              {isCoaching 
                ? "Access your programs, track your progress, and stay focused."
                : "Access your templates, track your progress, and stay disciplined."}
            </p>
          </div>
        </OnboardingTooltip>

        {/* Progressive Disclosure - Week 1 users see fewer tiles initially */}
        {(() => {
          // During week 1, show only core tiles with option to expand
          const isWeekOne = currentWeek === 1;
          const coreTileCount = 5; // First 5 tiles are core
          const displayedTiles = (isWeekOne && !showAllTiles) 
            ? tiles.slice(0, coreTileCount) 
            : tiles;
          const hiddenTiles = (isWeekOne && !showAllTiles) 
            ? tiles.slice(coreTileCount) 
            : [];
          
          return (
            <>
              {/* Tiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayedTiles.map((tile, index) => (
            <Link
              key={index}
              to={tile.locked ? "#" : tile.href}
              onClick={(e) => handleTileClick(tile, e)}
              className={`block transition-all duration-300 relative group ${
                tile.locked 
                  ? tile.isCoachingOnly 
                    ? "tile-locked opacity-80 hover:opacity-90 frosted-lock border-crimson/40 bg-gradient-to-br from-crimson/10 to-transparent" 
                    : "tile-locked opacity-80 hover:opacity-90 frosted-lock" 
                  : `${tile.color} hover-lift`
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* New User Badge */}
              {tile.isNew && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-pulse z-10">
                  START HERE
                </div>
              )}
              
              {tile.locked && (
                <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                  <Lock className={`w-4 h-4 lock-shake ${tile.isCoachingOnly ? "text-crimson" : "text-crimson"}`} />
                  {tile.isCoachingOnly && (
                    <span className="text-[10px] text-crimson font-medium uppercase tracking-wide">Free World</span>
                  )}
                </div>
              )}
              
              <div className="flex items-start justify-between relative z-10">
                <tile.icon className={`w-10 h-10 mb-4 transition-transform duration-300 ${
                  tile.locked 
                    ? "text-crimson/60" 
                    : "text-primary group-hover:scale-110"
                }`} />
                
                {/* Tooltip for terminology - use appropriate tooltip map based on tier */}
                {(() => {
                  const tooltipMap = isCoaching ? coachingTooltips : prisonTooltips;
                  const tooltipText = tooltipMap[tile.title];
                  return tooltipText && !tile.locked && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={(e) => e.preventDefault()}
                          className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] text-center">
                        <p className="text-sm">{tooltipText}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })()}
              </div>
              
              <p className={`text-xs uppercase tracking-wider mb-1 relative z-10 ${tile.locked ? "text-crimson/70" : "text-primary"}`}>
                {tile.subtitle}
              </p>
              <h3 className="headline-card mb-2 relative z-10">{tile.title}</h3>
              <p className="text-sm text-muted-foreground relative z-10">{tile.description}</p>
              
              {tile.locked && tile.featureName && (
                <div className="mt-3 flex items-center gap-2 relative z-10">
                  <AlertTriangle className="w-3 h-3 text-crimson" />
                  <p className="text-xs text-crimson font-semibold">
                    {lockedBenefits[tile.featureName] || "Requires Upgrade"}
                  </p>
                </div>
              )}
            </Link>
                ))}
              </div>
              
              {/* "See All Features" Button for Week 1 users */}
              {isWeekOne && !showAllTiles && hiddenTiles.length > 0 && (
                <button
                  onClick={() => setShowAllTiles(true)}
                  className="w-full mt-6 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-charcoal/30 hover:bg-charcoal/50 transition-all text-center group"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      See all {hiddenTiles.length} additional features
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Including: {hiddenTiles.slice(0, 3).map(t => t.title).join(", ")}...
                  </p>
                </button>
              )}
            </>
          );
        })()}
        
        <SolitaryUpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature={lockedFeature}
        />

        {/* Quick Actions - Tier-aware routing */}
        <div className="mt-12 steel-plate p-8 border border-steel-light/20">
          <h3 className="headline-card mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            {/* Primary workout action - tier-aware */}
            <Button variant="gold" size="lg" asChild>
              <Link to={isMembership ? "/dashboard/workouts" : "/dashboard/program"}>
                <Dumbbell className="w-5 h-5 mr-2" />
                {isCoaching 
                  ? "Start Today's Training" 
                  : isTransformation 
                    ? "Continue The Sentence" 
                    : "Hit Yard Time"}
              </Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/check-in">
                <ClipboardCheck className="w-4 h-4 mr-2" />
                {isCoaching ? "Submit Weekly Report" : "Submit Roll Call"}
              </Link>
            </Button>
            <Button variant="steel" asChild>
              <Link to="/book-call">Book a Coaching Call</Link>
            </Button>
          </div>
        </div>
      </div>
      <OrientationModal />
    </DashboardLayout>
  );
};

export default Dashboard;
