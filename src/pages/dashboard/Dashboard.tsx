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
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";
import DashboardLayout from "@/components/DashboardLayout";
import { WardenBrief } from "@/components/warden";
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
};

// Tooltip explanations for coaching/Free World tier
const coachingTooltips: Record<string, string> = {
  "Orientation": "Complete your setup and get started",
  "Your Program": "Your personalized 12-week journey",
  "Training Sessions": "Your complete workout library",
  "Daily Structure": "Morning and evening habit routines",
  "Meal Planning": "Nutrition guidance and meal templates",
  "Faith & Mindset": "Weekly growth lessons",
  "Weekly Report": "Submit your accountability check-in",
  "Progress Report": "Track your transformation journey",
  "Career Building": "Build income-generating skills",
  "The Network": "Connect with your brotherhood",
};

// Benefit messages for locked tiles
const lockedBenefits: Record<string, string> = {
  "The Sentence (12-Week Program)": "Unlock structured 12-week progression",
  "Chapel (Faith & Mindset)": "Unlock weekly scripture & mindset training",
  "Work Release (Skill-Building)": "Unlock money-making hustle skills",
  "The Yard (Community)": "Connect with your brothers on this journey",
};

const Dashboard = () => {
  const { subscription, profile } = useAuth();
  const planType = subscription?.plan_type;
  const isCoaching = planType === "coaching";
  const isTransformation = planType === "transformation";
  const isMembership = planType === "membership";
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

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
      title: isCoaching ? "Orientation" : "Intake Processing",
      subtitle: isCoaching ? "Getting Started" : "Week 0 Orientation",
      description: isCoaching 
        ? "Complete your orientation. Get set up for success on the outside."
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

  // Define locked tiles for Solitary users
  const lockedTilesForMembership = [
    { ...allTiles.program, locked: true, featureName: "The Sentence (12-Week Program)" },
    { ...allTiles.faith, locked: true, featureName: "Chapel (Faith & Mindset)" },
    { ...allTiles.skills, locked: true, featureName: "Work Release (Skill-Building)" },
    { ...allTiles.community, locked: true, featureName: "The Yard (Community)" },
  ];
  
  type TileType = typeof allTiles.startHere & { locked?: boolean; featureName?: string };
  const tiles: TileType[] = [];
  
  tiles.push(allTiles.startHere);
  
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.program);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("12-Week"))!);
  }
  
  tiles.push(allTiles.workouts);
  tiles.push(allTiles.discipline);
  tiles.push(allTiles.nutrition);
  
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.faith);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Chapel"))!);
  }
  tiles.push(allTiles.checkIn);
  tiles.push(allTiles.progress);
  
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.skills);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Skill"))!);
  }
  
  if (!isMembership) {
    tiles.push(allTiles.community);
  } else {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Community"))!);
  }
  
  if (isCoaching) {
    tiles.push(allTiles.advancedSkills);
    tiles.push(allTiles.messages);
    tiles.push(allTiles.coaching);
  }

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
        {/* Welcome Banner for New Users */}
        {showWelcomeBanner && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 relative">
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
                  {isCoaching ? "Welcome aboard." : "Welcome to the block."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start with <Link to="/dashboard/start-here" className="text-primary hover:underline font-medium">
                    {isCoaching ? "Orientation" : "Intake Processing"}
                  </Link> to get {isCoaching ? "set up" : "oriented"}, 
                  then hit <Link to="/dashboard/workouts" className="text-primary hover:underline font-medium">
                    {isCoaching ? "Training Sessions" : "Yard Time"}
                  </Link> for your first workout.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Warden's Weekly Brief */}
        <div className="mb-8">
          <WardenBrief />
        </div>

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

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tiles.map((tile, index) => (
            <Link
              key={index}
              to={tile.locked ? "#" : tile.href}
              onClick={(e) => handleTileClick(tile, e)}
              className={`block transition-all duration-300 relative ${
                tile.locked 
                  ? "tile-locked opacity-80 hover:opacity-90" 
                  : tile.color
              }`}
            >
              {/* New User Badge */}
              {tile.isNew && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full animate-pulse">
                  START HERE
                </div>
              )}
              
              {tile.locked && (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <Lock className="w-4 h-4 text-crimson" />
                </div>
              )}
              
              <div className="flex items-start justify-between">
                <tile.icon className={`w-10 h-10 mb-4 ${tile.locked ? "text-crimson/60" : "text-primary"}`} />
                
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
              
              <p className={`text-xs uppercase tracking-wider mb-1 ${tile.locked ? "text-crimson/70" : "text-primary"}`}>
                {tile.subtitle}
              </p>
              <h3 className="headline-card mb-2">{tile.title}</h3>
              <p className="text-sm text-muted-foreground">{tile.description}</p>
              
              {tile.locked && tile.featureName && (
                <div className="mt-3 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-crimson" />
                  <p className="text-xs text-crimson font-semibold">
                    {lockedBenefits[tile.featureName] || "Requires Upgrade"}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
        
        <SolitaryUpgradeModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          feature={lockedFeature}
        />

        {/* Quick Actions */}
        <div className="mt-12 steel-plate p-8 border border-steel-light/20">
          <h3 className="headline-card mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="gold" asChild>
              <Link to="/dashboard/check-in">Submit Weekly Check-In</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to={isMembership ? "/dashboard/workouts" : "/dashboard/program"}>
                {isMembership ? "Start Your Workout" : "Start Today's Workout"}
              </Link>
            </Button>
            <Button variant="steel" asChild>
              <Link to="/book-call">Book a Coaching Call</Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
