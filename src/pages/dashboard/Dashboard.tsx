import { Link } from "react-router-dom";
import { 
  Play, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Utensils, 
  ClipboardCheck, 
  BookOpen, 
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";

const Dashboard = () => {
  const tiles = [
    {
      icon: Play,
      title: "Start Here",
      subtitle: "Onboarding Checklist",
      description: "Complete your Week 0 setup and get oriented with the program.",
      href: "/dashboard/start-here",
      color: "bg-primary/10 border-primary/30",
    },
    {
      icon: Dumbbell,
      title: "Workout Templates",
      subtitle: "Prison-Style Frameworks",
      description: "Access all workout templates. Build your sessions.",
      href: "/dashboard/workouts",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: Calendar,
      title: "12-Week Program",
      subtitle: "Template Framework",
      description: "View the complete 12-week structure and weekly breakdown.",
      href: "/dashboard/program",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: Clock,
      title: "Daily Discipline",
      subtitle: "Routine Templates",
      description: "Morning and evening routines. Build your daily structure.",
      href: "/dashboard/discipline",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: Utensils,
      title: "Nutrition Templates",
      subtitle: "Meal Structure",
      description: "Simple meal templates and grocery list builders.",
      href: "/dashboard/nutrition",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: ClipboardCheck,
      title: "Weekly Check-In",
      subtitle: "Accountability Form",
      description: "Submit your weekly check-in and track progress.",
      href: "/dashboard/check-in",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: BookOpen,
      title: "Mindset + Faith",
      subtitle: "Lesson Templates",
      description: "Weekly lessons on faith, discipline, and mindset.",
      href: "/dashboard/faith",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
    {
      icon: TrendingUp,
      title: "Progress Trackers",
      subtitle: "Templates",
      description: "Track habits, measurements, and weekly progress.",
      href: "/dashboard/progress",
      color: "bg-charcoal border-border hover:border-primary/50",
    },
  ];

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
