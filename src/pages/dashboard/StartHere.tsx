import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Circle, Loader2, Trophy, Play, X, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserChecklist } from "@/hooks/useUserChecklist";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Tier-specific checklist configurations
const SOLITARY_CHECKLIST = [
  {
    category: "Cell Assignment",
    items: [
      { id: "solitary-1", label: "Review your discipline templates", href: "/dashboard/discipline" },
      { id: "solitary-2", label: "Set your wake-up time", href: "/dashboard/discipline" },
      { id: "solitary-3", label: "Check out the bodyweight workout library", href: "/dashboard/workouts" },
    ],
  },
  {
    category: "Daily Protocol",
    items: [
      { id: "solitary-4", label: "Complete your first discipline routine", href: "/dashboard/discipline" },
      { id: "solitary-5", label: "Read your first faith lesson", href: "/dashboard/faith" },
      { id: "solitary-6", label: "Submit your first weekly check-in", href: "/dashboard/check-in" },
    ],
  },
];

const GEN_POP_CHECKLIST = [
  {
    category: "Inmate Registration",
    items: [
      { id: "genpop-1", label: "Review your 12-week program overview", href: "/dashboard/program" },
      { id: "genpop-2", label: "Set your training days", href: "/dashboard/program" },
      { id: "genpop-3", label: "Explore your nutrition templates", href: "/dashboard/nutrition" },
    ],
  },
  {
    category: "Yard Prep",
    items: [
      { id: "genpop-4", label: "Complete Week 1, Day 1 workout", href: "/dashboard/program" },
      { id: "genpop-5", label: "Log your first meal", href: "/dashboard/nutrition" },
      { id: "genpop-6", label: "Set up your discipline routine", href: "/dashboard/discipline" },
    ],
  },
  {
    category: "Block Integration",
    items: [
      { id: "genpop-7", label: "Introduce yourself in the community", href: "/dashboard/community" },
      { id: "genpop-8", label: "Take your starting photos", href: "/dashboard/progress" },
      { id: "genpop-9", label: "Read Week 1 faith lesson", href: "/dashboard/faith" },
    ],
  },
];

const FREE_WORLD_CHECKLIST = [
  {
    category: "Orientation",
    items: [
      { id: "freeworld-1", label: "Review your personalized training plan", href: "/dashboard/program" },
      { id: "freeworld-2", label: "Schedule your first coaching call", href: "/dashboard/coaching" },
      { id: "freeworld-3", label: "Connect with Dom via direct message", href: "/dashboard/messages" },
    ],
  },
  {
    category: "Foundation Setup",
    items: [
      { id: "freeworld-4", label: "Complete your Week 1 workouts", href: "/dashboard/program" },
      { id: "freeworld-5", label: "Review your custom nutrition plan", href: "/dashboard/nutrition" },
      { id: "freeworld-6", label: "Set your discipline routine", href: "/dashboard/discipline" },
    ],
  },
  {
    category: "Elite Integration",
    items: [
      { id: "freeworld-7", label: "Explore the advanced skills section", href: "/dashboard/advanced-skills" },
      { id: "freeworld-8", label: "Take progress photos", href: "/dashboard/progress" },
      { id: "freeworld-9", label: "Submit your first weekly report", href: "/dashboard/check-in" },
    ],
  },
];

interface WelcomeVideo {
  video_url: string | null;
  video_title: string;
  video_description: string | null;
}

const StartHere = () => {
  const { loading, toggleItem, isItemCompleted, getCompletionPercent } = useUserChecklist();
  const { toast } = useToast();
  const { subscription, profile } = useAuth();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [welcomeVideo, setWelcomeVideo] = useState<WelcomeVideo | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);

  const planType = subscription?.plan_type || "membership";

  // Get tier-specific content
  const getTierConfig = () => {
    switch (planType) {
      case "coaching":
        return {
          name: "Free World",
          subtitle: "Elite Coaching Orientation",
          description: "Welcome to the highest level of accountability. You have direct access to Dom and a personalized transformation plan.",
          checklist: FREE_WORLD_CHECKLIST,
          accentClass: "text-green-400",
          bgClass: "from-green-500/20",
          borderClass: "border-green-500/30",
          backLabel: "Back to Base",
          ctaLabel: "Start Training Sessions",
          ctaHref: "/dashboard/program",
        };
      case "transformation":
        return {
          name: "General Population",
          subtitle: "12-Week Intake Processing",
          description: "You've committed to the full sentence. Follow these steps to integrate into the program and maximize your transformation.",
          checklist: GEN_POP_CHECKLIST,
          accentClass: "text-primary",
          bgClass: "from-primary/20",
          borderClass: "border-primary/30",
          backLabel: "Back to Cell Block",
          ctaLabel: "Report to Yard Time",
          ctaHref: "/dashboard/program",
        };
      default:
        return {
          name: "Solitary Confinement",
          subtitle: "Essential Orientation",
          description: "Master the basics. Build discipline with bodyweight training and daily routines.",
          checklist: SOLITARY_CHECKLIST,
          accentClass: "text-muted-foreground",
          bgClass: "from-muted/20",
          borderClass: "border-border",
          backLabel: "Back to Cell",
          ctaLabel: "Start Yard Time",
          ctaHref: "/dashboard/workouts",
        };
    }
  };

  const tierConfig = getTierConfig();
  const totalItems = tierConfig.checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const completionPercent = getCompletionPercent(totalItems);

  // Fetch welcome video for this tier
  useEffect(() => {
    const fetchWelcomeVideo = async () => {
      setVideoLoading(true);
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("video_url, video_title, video_description")
        .eq("plan_type", planType)
        .single();

      if (!error && data) {
        setWelcomeVideo(data);
      }
      setVideoLoading(false);
    };

    fetchWelcomeVideo();
  }, [planType]);

  // Check if video was already watched
  useEffect(() => {
    if (profile?.onboarding_video_watched) {
      setVideoWatched(true);
    }
  }, [profile]);

  const handleToggle = async (itemId: string) => {
    try {
      setTogglingId(itemId);
      await toggleItem(itemId);
      
      const wasCompleted = isItemCompleted(itemId);
      if (!wasCompleted) {
        toast({
          title: "Nice work!",
          description: "Keep building momentum.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update checklist",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const markVideoWatched = async () => {
    if (!profile) return;
    
    await supabase
      .from("profiles")
      .update({ onboarding_video_watched: true })
      .eq("user_id", profile.user_id);
    
    setVideoWatched(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className={cn("relative bg-gradient-to-b to-background pt-8 pb-12", tierConfig.bgClass)}>
        <div className="section-container">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> {tierConfig.backLabel}
          </Link>

          <div className="max-w-3xl">
            <div className={cn("inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 border", tierConfig.accentClass, tierConfig.borderClass, "bg-background/50")}>
              {tierConfig.name}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {tierConfig.subtitle}
            </h1>
            <p className="text-muted-foreground text-lg">
              {tierConfig.description}
            </p>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="max-w-3xl">
          {/* Welcome Video Card */}
          {welcomeVideo?.video_url && (
            <div className={cn(
              "mb-8 p-6 rounded-xl border bg-card",
              tierConfig.borderClass
            )}>
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setShowVideoModal(true)}
                  className={cn(
                    "relative flex-shrink-0 w-32 h-20 rounded-lg bg-charcoal overflow-hidden group",
                    "hover:ring-2 hover:ring-primary transition-all"
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
                    <Play className={cn("w-8 h-8", tierConfig.accentClass)} />
                  </div>
                  {videoWatched && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{welcomeVideo.video_title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {welcomeVideo.video_description || "Watch Dom's personal welcome message for your program."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVideoModal(true)}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {videoWatched ? "Watch Again" : "Watch Now"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Card */}
          <div className={cn("p-6 rounded-xl border bg-card mb-8", tierConfig.borderClass)}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tierConfig.bgClass)}>
                  <Trophy className={cn("w-5 h-5", tierConfig.accentClass)} />
                </div>
                <div>
                  <h3 className="font-semibold">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {completionPercent === 100 
                      ? "All tasks complete!"
                      : `${totalItems - Math.round(completionPercent / 100 * totalItems)} tasks remaining`}
                  </p>
                </div>
              </div>
              <span className={cn("text-3xl font-bold", tierConfig.accentClass)}>{completionPercent}%</span>
            </div>
            <Progress value={completionPercent} className="h-3" />
          </div>

          {/* Checklist Sections */}
          <div className="space-y-8">
            {tierConfig.checklist.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h2 className={cn("text-lg font-semibold mb-4", tierConfig.accentClass)}>
                  {section.category}
                </h2>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const completed = isItemCompleted(item.id);
                    const isToggling = togglingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-all",
                          completed 
                            ? "bg-muted/50 border-border" 
                            : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        <button
                          onClick={() => handleToggle(item.id)}
                          disabled={isToggling}
                          className="flex-shrink-0"
                        >
                          {isToggling ? (
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          ) : completed ? (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <span className={cn("flex-1", completed && "line-through text-muted-foreground")}>
                          {item.label}
                        </span>
                        {!completed && item.href && (
                          <Link 
                            to={item.href}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <Button variant="gold" size="lg" asChild className="flex-1">
              <Link to={tierConfig.ctaHref}>{tierConfig.ctaLabel}</Link>
            </Button>
            <Button variant="goldOutline" size="lg" asChild>
              <Link to="/dashboard">{tierConfig.backLabel}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <button
            onClick={() => {
              setShowVideoModal(false);
              markVideoWatched();
            }}
            className="absolute right-4 top-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          {welcomeVideo?.video_url && (
            <div className="aspect-video">
              <video
                src={welcomeVideo.video_url}
                controls
                autoPlay
                className="w-full h-full"
                onEnded={markVideoWatched}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartHere;