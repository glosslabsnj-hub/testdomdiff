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
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { subscription } = useAuth();
  const planType = subscription?.plan_type;
  const isCoaching = planType === "coaching";
  const isTransformation = planType === "transformation";
  const isMembership = planType === "membership";

  // Define all tiles with jail-themed names
  const allTiles = {
    startHere: {
      icon: Play,
      title: "Intake Processing",
      subtitle: "Week 0 Orientation",
      description: "Complete your intake processing. Get oriented with the program.",
      href: "/dashboard/start-here",
      color: "bg-primary/10 border-primary/30",
    },
    program: {
      icon: Calendar,
      title: "The Sentence",
      subtitle: "12-Week Program",
      description: "Your 12-week sentence. Structured progression with weekly breakdown.",
      href: "/dashboard/program",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    workouts: {
      icon: Dumbbell,
      title: "Yard Time",
      subtitle: isMembership ? "Bodyweight Only" : "Full Iron Access",
      description: isMembership 
        ? "Bodyweight workouts. No equipment, no excuses."
        : "Full workout library. Build your sessions like we built ours inside.",
      href: "/dashboard/workouts",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    discipline: {
      icon: Clock,
      title: "Lights On / Lights Out",
      subtitle: "Daily Routines",
      description: "Morning and evening routines. Structure breeds discipline.",
      href: "/dashboard/discipline",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    nutrition: {
      icon: Utensils,
      title: "Chow Hall",
      subtitle: "Meal Plans",
      description: "Simple meal templates. Fuel the machine, feed the soul.",
      href: "/dashboard/nutrition",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    faith: {
      icon: BookOpen,
      title: "Chapel",
      subtitle: "Faith & Mindset",
      description: "Weekly lessons on faith, discipline, and mental fortitude.",
      href: "/dashboard/faith",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    checkIn: {
      icon: ClipboardCheck,
      title: "Roll Call",
      subtitle: "Weekly Check-In",
      description: "Submit your weekly report. Accountability is freedom.",
      href: "/dashboard/check-in",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    progress: {
      icon: TrendingUp,
      title: "Time Served",
      subtitle: "Progress Tracker",
      description: "Track your transformation. See how far you've come.",
      href: "/dashboard/progress",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    skills: {
      icon: Briefcase,
      title: "Work Release",
      subtitle: "Skill-Building",
      description: "Learn money-making skills. Build your hustle for the outside.",
      href: "/dashboard/skills",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    community: {
      icon: Users,
      title: "The Yard",
      subtitle: "Brotherhood",
      description: "Connect with fellow inmates. Iron sharpens iron.",
      href: "/dashboard/community",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    advancedSkills: {
      icon: GraduationCap,
      title: "Trustee Program",
      subtitle: "Advanced Hustle",
      description: "Advanced business strategies for serious entrepreneurs.",
      href: "/dashboard/advanced-skills",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
    messages: {
      icon: MessageCircle,
      title: "Visitation",
      subtitle: "Direct Messages",
      description: "Direct line to Dom. Get answers when you need them.",
      href: "/dashboard/messages",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
    coaching: {
      icon: Crown,
      title: "Warden's Office",
      subtitle: "1:1 Coaching",
      description: "Your exclusive coaching portal. Direct access to the top.",
      href: "/dashboard/coaching",
      color: "bg-gradient-to-br from-primary/20 to-amber-500/10 border-primary/50 hover:border-primary",
    },
  };

  // Build tiles in exact order specified by user:
  // Start Here → 12-Week (if applicable) → Workout Templates → Daily Discipline → 
  // Nutrition Templates → Mindset + Faith → Weekly Check-In → Progress Tracker → 
  // Skill Building → Community → (Coaching extras at end)
  
  let tiles = [];
  
  // 1. Start Here (always first)
  tiles.push(allTiles.startHere);
  
  // 2. 12-Week Program (Transformation/Coaching only)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.program);
  }
  
  // 3. Workout Templates
  tiles.push(allTiles.workouts);
  
  // 4. Daily Discipline
  tiles.push(allTiles.discipline);
  
  // 5. Nutrition Templates (Transformation/Coaching only)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.nutrition);
  }
  
  // 6. Mindset + Faith
  tiles.push(allTiles.faith);
  
  // 7. Weekly Check-In
  tiles.push(allTiles.checkIn);
  
  // 8. Progress Tracker
  tiles.push(allTiles.progress);
  
  // 9. Skill-Building (Transformation/Coaching only)
  if (isTransformation || isCoaching) {
    tiles.push(allTiles.skills);
  }
  
  // 10. Community (always last of base tiles)
  tiles.push(allTiles.community);
  
  // 11-13. Coaching-only tiles at the end
  if (isCoaching) {
    tiles.push(allTiles.advancedSkills);
    tiles.push(allTiles.messages);
    tiles.push(allTiles.coaching);
  }

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
              to={tile.href}
              className={`block p-6 rounded-lg border transition-all hover:scale-105 ${tile.color}`}
            >
              <tile.icon className="w-10 h-10 text-primary mb-4" />
              <p className="text-xs text-primary uppercase tracking-wider mb-1">
                {tile.subtitle}
              </p>
              <h3 className="headline-card mb-2">{tile.title}</h3>
              <p className="text-sm text-muted-foreground">{tile.description}</p>
            </Link>
          ))}
        </div>

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
