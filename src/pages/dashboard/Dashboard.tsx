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
  Lock
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
  // Coaching (Free World) = Probation terms
  // Transformation (Gen Pop) = Prison terms
  // Membership (Solitary) = Prison terms (restricted access)
  
  const allTiles = {
    startHere: {
      icon: Play,
      title: isCoaching ? "Orientation" : "Intake Processing",
      subtitle: isCoaching ? "Getting Started" : "Week 0 Orientation",
      description: isCoaching 
        ? "Complete your orientation. Get set up for success on the outside."
        : "Complete your intake processing. Get oriented with the program.",
      href: "/dashboard/start-here",
      color: "bg-primary/10 border-primary/30",
    },
    program: {
      icon: Calendar,
      title: isCoaching ? "Your Program" : "The Sentence",
      subtitle: isCoaching ? "12-Week Journey" : "12-Week Program",
      description: isCoaching
        ? "Your personalized 12-week program. Stay on track with weekly milestones."
        : "Your 12-week sentence. Structured progression with weekly breakdown.",
      href: "/dashboard/program",
      color: "bg-charcoal border-border hover:border-primary/50",
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
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    discipline: {
      icon: Clock,
      title: isCoaching ? "Daily Structure" : "Lights On / Lights Out",
      subtitle: isCoaching ? "Morning & Evening" : "Daily Routines",
      description: isCoaching
        ? "Morning and evening routines. Build habits that stick."
        : "Morning and evening routines. Structure breeds discipline.",
      href: "/dashboard/discipline",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    nutrition: {
      icon: Utensils,
      title: isCoaching ? "Meal Planning" : "Chow Hall",
      subtitle: isCoaching ? "Nutrition Guide" : "Meal Plans",
      description: isCoaching
        ? "Your personalized meal templates. Fuel for the free world."
        : "Simple meal templates. Fuel the machine, feed the soul.",
      href: "/dashboard/nutrition",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    faith: {
      icon: BookOpen,
      title: isCoaching ? "Faith & Mindset" : "Chapel",
      subtitle: isCoaching ? "Weekly Growth" : "Faith & Mindset",
      description: isCoaching
        ? "Weekly lessons on faith, purpose, and staying grounded."
        : "Weekly lessons on faith, discipline, and mental fortitude.",
      href: "/dashboard/faith",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    checkIn: {
      icon: ClipboardCheck,
      title: isCoaching ? "Weekly Report" : "Roll Call",
      subtitle: isCoaching ? "Check-In" : "Weekly Check-In",
      description: isCoaching
        ? "Submit your weekly report. Stay accountable to your goals."
        : "Submit your weekly report. Accountability is freedom.",
      href: "/dashboard/check-in",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    progress: {
      icon: TrendingUp,
      title: isCoaching ? "Progress Report" : "Time Served",
      subtitle: isCoaching ? "Your Journey" : "Progress Tracker",
      description: isCoaching
        ? "Track your transformation. Celebrate every milestone."
        : "Track your transformation. See how far you've come.",
      href: "/dashboard/progress",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    skills: {
      icon: Briefcase,
      title: isCoaching ? "Career Building" : "Work Release",
      subtitle: isCoaching ? "Financial Freedom" : "Skill-Building",
      description: isCoaching
        ? "Advanced business skills. Build real income streams."
        : "Learn money-making skills. Build your hustle for the outside.",
      href: "/dashboard/skills",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    community: {
      icon: Users,
      title: isCoaching ? "The Network" : "The Yard",
      subtitle: isCoaching ? "Your Brotherhood" : "Brotherhood",
      description: isCoaching
        ? "Connect with fellow free men. Build lasting relationships."
        : "Connect with fellow inmates. Iron sharpens iron.",
      href: "/dashboard/community",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    advancedSkills: {
      icon: GraduationCap,
      title: "Entrepreneur Track",
      subtitle: "Advanced Business",
      description: "Advanced business strategies for building real wealth.",
      href: "/dashboard/advanced-skills",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
    messages: {
      icon: MessageCircle,
      title: "Direct Line",
      subtitle: "Message Dom",
      description: "Direct messaging with your coach. Get answers when you need them.",
      href: "/dashboard/messages",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
    coaching: {
      icon: Crown,
      title: "Coaching Portal",
      subtitle: "1:1 Access",
      description: "Your exclusive coaching portal. Premium access to Dom.",
      href: "/dashboard/coaching",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
  };

  // Define locked tiles for Solitary users (shown but trigger modal)
  const lockedTilesForMembership = [
    { ...allTiles.program, locked: true, featureName: "The Sentence (12-Week Program)" },
    { ...allTiles.nutrition, locked: true, featureName: "Chow Hall (Nutrition)" },
    { ...allTiles.skills, locked: true, featureName: "Work Release (Skill-Building)" },
    { ...allTiles.community, locked: true, featureName: "The Yard (Community)" },
  ];

  // Build tiles in exact order specified by user:
  // Start Here → 12-Week (if applicable) → Workout Templates → Daily Discipline → 
  // Nutrition Templates → Mindset + Faith → Weekly Check-In → Progress Tracker → 
  // Skill Building → Community → (Coaching extras at end)
  
  let tiles: Array<typeof allTiles.startHere & { locked?: boolean; featureName?: string }> = [];
  
  // 1. Start Here (always first)
  tiles.push(allTiles.startHere);
  
  // 2. 12-Week Program (Transformation/Coaching only, locked for membership)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.program);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("12-Week"))!);
  }
  
  // 3. Workout Templates
  tiles.push(allTiles.workouts);
  
  // 4. Daily Discipline
  tiles.push(allTiles.discipline);
  
  // 5. Nutrition Templates (Transformation/Coaching only, locked for membership)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.nutrition);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Nutrition"))!);
  }
  
  // 6. Mindset + Faith
  tiles.push(allTiles.faith);
  
  // 7. Weekly Check-In
  tiles.push(allTiles.checkIn);
  
  // 8. Progress Tracker
  tiles.push(allTiles.progress);
  
  // 9. Skill-Building (Transformation/Coaching only, locked for membership)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.skills);
  } else if (isMembership) {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Skill"))!);
  }
  
  // 10. Community - Locked for Solitary (membership) users but shown
  if (!isMembership) {
    tiles.push(allTiles.community);
  } else {
    tiles.push(lockedTilesForMembership.find(t => t.featureName?.includes("Community"))!);
  }
  
  // 11-13. Coaching-only tiles at the end
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

      {/* Dashboard Content */}
      <main className="section-container py-12">
        <div className="mb-12">
          <h1 className="headline-section mb-2">
            Your <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Access your templates, track your progress, and stay disciplined.
          </p>
        </div>

        {/* Tiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map((tile, index) => (
            <Link
              key={index}
              to={tile.locked ? "#" : tile.href}
              onClick={(e) => handleTileClick(tile, e)}
              className={`block p-6 rounded-lg border transition-all hover:scale-105 ${tile.color} ${
                tile.locked ? "relative opacity-75" : ""
              }`}
            >
              {tile.locked && (
                <div className="absolute top-3 right-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <tile.icon className="w-10 h-10 text-primary mb-4" />
              <p className="text-xs text-primary uppercase tracking-wider mb-1">
                {tile.subtitle}
              </p>
              <h3 className="headline-card mb-2">{tile.title}</h3>
              <p className="text-sm text-muted-foreground">{tile.description}</p>
              {tile.locked && (
                <p className="text-xs text-primary mt-2 font-semibold">Upgrade to Unlock</p>
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
        <div className="mt-12 p-8 bg-charcoal rounded-lg border border-border">
          <h3 className="headline-card mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="gold" asChild>
              <Link to="/dashboard/check-in">Submit Weekly Check-In</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/workouts">Start Today's Workout</Link>
            </Button>
            <Button variant="dark" asChild>
              <Link to="/book-call">Book a Coaching Call</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
