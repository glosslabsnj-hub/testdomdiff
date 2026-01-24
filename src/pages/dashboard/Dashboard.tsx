import { useState } from "react";
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
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";

const Dashboard = () => {
  const { subscription } = useAuth();
  const planType = subscription?.plan_type;
  const isCoaching = planType === "coaching";
  const isTransformation = planType === "transformation";
  const isMembership = planType === "membership";
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [lockedFeature, setLockedFeature] = useState("");

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
    },
    advancedSkills: {
      icon: GraduationCap,
      title: "Entrepreneur Track",
      subtitle: "Advanced Business",
      description: "Advanced business strategies for building real wealth.",
      href: "/dashboard/advanced-skills",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
    },
    messages: {
      icon: MessageCircle,
      title: "Direct Line",
      subtitle: "Message Dom",
      description: "Direct messaging with your coach. Get answers when you need them.",
      href: "/dashboard/messages",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
    },
    coaching: {
      icon: Crown,
      title: "Coaching Portal",
      subtitle: "1:1 Access",
      description: "Your exclusive coaching portal. Premium access to Dom.",
      href: "/dashboard/coaching",
      color: "dashboard-tile border-primary/50 bg-gradient-to-br from-primary/10 to-transparent",
    },
  };

  // Define locked tiles for Solitary users - crimson-tinted
  const lockedTilesForMembership = [
    { ...allTiles.program, locked: true, featureName: "The Sentence (12-Week Program)" },
    { ...allTiles.nutrition, locked: true, featureName: "Chow Hall (Nutrition)" },
    { ...allTiles.skills, locked: true, featureName: "Work Release (Skill-Building)" },
    { ...allTiles.community, locked: true, featureName: "The Yard (Community)" },
  ];
  
  let tiles: Array<typeof allTiles.startHere & { locked?: boolean; featureName?: string }> = [];
  
  tiles.push(allTiles.startHere);
  
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.program);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("12-Week"))!);
  }
  
  tiles.push(allTiles.workouts);
  tiles.push(allTiles.discipline);
  
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.nutrition);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Nutrition"))!);
  }
  
  tiles.push(allTiles.faith);
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

  const handleTileClick = (tile: typeof tiles[0], e: React.MouseEvent) => {
    if (tile.locked) {
      e.preventDefault();
      setLockedFeature(tile.featureName || "This feature");
      setUpgradeModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="section-container py-12">
        <div className="mb-12">
          <h1 className="headline-section mb-2">
            Your <span className="text-primary">Cell Block</span>
          </h1>
          <p className="text-muted-foreground">
            Access your templates, track your progress, and stay disciplined.
          </p>
        </div>

        {/* Tiles Grid with Steel Plate Effect */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((tile, index) => (
            <Link
              key={index}
              to={tile.locked ? "#" : tile.href}
              onClick={(e) => handleTileClick(tile, e)}
              className={`block transition-all duration-300 ${
                tile.locked 
                  ? "tile-locked opacity-80 hover:opacity-90" 
                  : tile.color
              }`}
            >
              {tile.locked && (
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <Lock className="w-4 h-4 text-crimson" />
                </div>
              )}
              <tile.icon className={`w-10 h-10 mb-4 ${tile.locked ? "text-crimson/60" : "text-primary"}`} />
              <p className={`text-xs uppercase tracking-wider mb-1 ${tile.locked ? "text-crimson/70" : "text-primary"}`}>
                {tile.subtitle}
              </p>
              <h3 className="headline-card mb-2">{tile.title}</h3>
              <p className="text-sm text-muted-foreground">{tile.description}</p>
              {tile.locked && (
                <div className="mt-3 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-crimson" />
                  <p className="text-xs text-crimson font-semibold">Requires Upgrade</p>
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

        {/* Quick Actions - Steel plate style */}
        <div className="mt-12 steel-plate p-8 border border-steel-light/20">
          <h3 className="headline-card mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="gold" asChild>
              <Link to="/dashboard/check-in">Submit Weekly Check-In</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/workouts">Start Today's Workout</Link>
            </Button>
            <Button variant="steel" asChild>
              <Link to="/book-call">Book a Coaching Call</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;