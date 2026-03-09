import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Circle, Loader2, Trophy, Play, X, ChevronRight, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserChecklist } from "@/hooks/useUserChecklist";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DashboardBackLink from "@/components/DashboardBackLink";
import { OnboardingVideoPlayer } from "@/components/OnboardingVideoPlayer";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useOnboardingVideo } from "@/hooks/useOnboardingVideo";

// Tier-specific checklist configurations with improved descriptions
const SOLITARY_CHECKLIST = [
  {
    category: "Step 1: Set Up Your Routines",
    timeEstimate: "5 min",
    items: [
      { id: "solitary-1", label: "Check out your morning and evening routines", href: "/dashboard/discipline", description: "Go to Lights On/Off and see what's on your daily checklist" },
      { id: "solitary-2", label: "Set your wake-up and bedtime", href: "/dashboard/discipline", description: "Tell us when you wake up and go to bed so we can set your schedule" },
      { id: "solitary-3", label: "Browse the workout library", href: "/dashboard/workouts", description: "Look through the available workouts and pick one for today" },
    ],
  },
  {
    category: "Step 2: Do Your First Day",
    timeEstimate: "15 min",
    items: [
      { id: "solitary-4", label: "Complete your morning routine", href: "/dashboard/discipline", description: "Open Lights On/Off and check off each item as you do it" },
      { id: "solitary-5", label: "Finish your first workout", href: "/dashboard/workouts", description: "Pick any workout, follow the exercises, and mark it complete" },
      { id: "solitary-6", label: "Submit your first weekly check-in", href: "/dashboard/check-in", description: "Go to Roll Call, enter your weight and how the week went" },
    ],
  },
  {
    category: "Step 3: Document Your Start",
    timeEstimate: "5 min",
    items: [
      { id: "solitary-7", label: "Upload your Day 1 photos", href: "/dashboard/progress", description: "Take front, side, and back photos so you can see your progress later" },
    ],
  },
];

const GEN_POP_CHECKLIST = [
  {
    category: "Step 1: Explore Your Program",
    timeEstimate: "10 min",
    items: [
      { id: "genpop-1", label: "Open your 12-week workout program", href: "/dashboard/program", description: "Go to The Sentence and see all 12 weeks laid out for you" },
      { id: "genpop-2", label: "Preview this week's workouts", href: "/dashboard/program", description: "Tap Week 1 to see each day's exercises, sets, and reps" },
      { id: "genpop-3", label: "Check out your meal plan", href: "/dashboard/nutrition", description: "Go to Chow Hall and see breakfast, lunch, dinner, and snacks" },
    ],
  },
  {
    category: "Step 2: Complete Your First Day",
    timeEstimate: "20 min",
    items: [
      { id: "genpop-4", label: "Do your first workout", href: "/dashboard/program", description: "Open Week 1 Day 1, follow the exercises, then tap 'Mark Day Complete'" },
      { id: "genpop-5", label: "Follow today's meal plan", href: "/dashboard/nutrition", description: "See exactly what to eat for each meal today" },
      { id: "genpop-6", label: "Set up your daily routines", href: "/dashboard/discipline", description: "Go to Lights On/Off and set your morning and evening checklists" },
    ],
  },
  {
    category: "Step 3: Join the Community",
    timeEstimate: "15 min",
    items: [
      { id: "genpop-7", label: "Introduce yourself", href: "/dashboard/community", description: "Go to The Yard and share your goals with others on the same journey" },
      { id: "genpop-8", label: "Upload your Day 1 photos", href: "/dashboard/progress", description: "Take front, side, and back photos to track your transformation" },
      { id: "genpop-9", label: "Read your first mindset lesson", href: "/dashboard/faith", description: "Go to Chapel for a short lesson on faith and mental toughness" },
    ],
  },
];

const FREE_WORLD_CHECKLIST = [
  {
    category: "Step 1: Meet Your Coach",
    timeEstimate: "10 min",
    items: [
      { id: "freeworld-1", label: "Open your custom training plan", href: "/dashboard/program", description: "See the personalized 12-week program Dom built just for you" },
      { id: "freeworld-2", label: "Book your first coaching call", href: "/dashboard/coaching", description: "Schedule a 1-on-1 video call with Dom to kick things off" },
      { id: "freeworld-3", label: "Send Dom a message", href: "/dashboard/messages", description: "Introduce yourself, share your goals, and ask any questions" },
    ],
  },
  {
    category: "Step 2: Start Training",
    timeEstimate: "25 min",
    items: [
      { id: "freeworld-4", label: "Do your first workout", href: "/dashboard/program", description: "Open your program, follow Day 1, and mark it complete when done" },
      { id: "freeworld-5", label: "Check out your meal plan", href: "/dashboard/nutrition", description: "See exactly what to eat for each meal, tailored to your goals" },
      { id: "freeworld-6", label: "Set up your daily routines", href: "/dashboard/discipline", description: "Choose your morning and evening checklists to build daily discipline" },
    ],
  },
  {
    category: "Step 3: Go Deeper",
    timeEstimate: "20 min",
    items: [
      { id: "freeworld-7", label: "Explore the Entrepreneur Track", href: "/dashboard/advanced-skills", description: "Business and income-building courses for your life outside" },
      { id: "freeworld-8", label: "Upload your Day 1 photos", href: "/dashboard/progress", description: "Take front, side, and back photos to track your transformation" },
      { id: "freeworld-9", label: "Submit your first weekly report", href: "/dashboard/check-in", description: "Share your wins, struggles, and what you learned this week" },
    ],
  },
];

interface WelcomeVideo {
  video_url: string | null;
  video_title: string;
  video_description: string | null;
}

const StartHere = () => {
  const { loading, toggleItem, isItemCompleted, getFilteredCompletionPercent } = useUserChecklist();
  const { toast } = useToast();
  const { profile } = useAuth();
  const { subscription, planType } = useEffectiveSubscription();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [welcomeVideo, setWelcomeVideo] = useState<WelcomeVideo | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [walkthroughExpanded, setWalkthroughExpanded] = useState(true);

  // planType comes from useEffectiveSubscription which respects admin preview mode
  const effectivePlanType = planType || "membership";
  
  // Get onboarding video status
  const { video: onboardingVideo, isReady: onboardingVideoReady } = useOnboardingVideo(effectivePlanType);

  // Get tier-specific content
  const getTierConfig = () => {
    switch (effectivePlanType) {
      case "coaching":
        return {
          name: "Free World",
          subtitle: "Welcome Home, You're on Probation",
          description: "Dom is your parole officer, and he's got your back. He's going to help you have success in your reintroduction to society.",
          checklist: FREE_WORLD_CHECKLIST,
          accentClass: "text-green-400",
          bgClass: "from-green-500/20",
          borderClass: "border-green-500/30",
          backLabel: "Back to Dashboard",
          ctaLabel: "Start Your New Life",
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
          backLabel: "Back to Dashboard",
          ctaLabel: "Start Your Program",
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
          ctaLabel: "Start Iron Pile",
          ctaHref: "/dashboard/workouts",
        };
    }
  };

  const tierConfig = getTierConfig();
  // Extract all valid item IDs from the current tier's checklist
  const validItemIds = tierConfig.checklist.flatMap(cat => 
    cat.items.map(item => item.id)
  );
  // Use filtered calculation to only count completions belonging to this tier
  const completionPercent = getFilteredCompletionPercent(validItemIds);

  // Fetch welcome video for this tier
  useEffect(() => {
    const fetchWelcomeVideo = async () => {
      setVideoLoading(true);
      const { data, error } = await supabase
        .from("program_welcome_videos")
        .select("video_url, video_title, video_description")
        .eq("plan_type", effectivePlanType)
        .single();

      if (!error && data) {
        setWelcomeVideo(data);
      }
      setVideoLoading(false);
    };

    fetchWelcomeVideo();
  }, [effectivePlanType]);

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
          <DashboardBackLink className="mb-6" />

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
          {/* Collapsible AI-Generated Tier Walkthrough */}
          {onboardingVideoReady && onboardingVideo?.audio_url && (
            <Collapsible 
              open={walkthroughExpanded} 
              onOpenChange={setWalkthroughExpanded}
              className="mb-8"
            >
              <div className={cn("rounded-xl border bg-card", tierConfig.borderClass)}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tierConfig.bgClass)}>
                        <Play className={cn("w-5 h-5", tierConfig.accentClass)} />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{tierConfig.name} Walkthrough</p>
                        <p className="text-sm text-muted-foreground">
                          {videoWatched ? "Watched • Tap to rewatch" : "Your personalized program guide"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform",
                      walkthroughExpanded && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <OnboardingVideoPlayer
                      tierKey={effectivePlanType}
                      tierName={tierConfig.name}
                      accentClass={tierConfig.accentClass}
                      borderClass={tierConfig.borderClass}
                      onVideoWatched={markVideoWatched}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Non-collapsible version when video isn't ready yet */}
          {!onboardingVideoReady && (
            <OnboardingVideoPlayer
              tierKey={effectivePlanType}
              tierName={tierConfig.name}
              accentClass={tierConfig.accentClass}
              borderClass={tierConfig.borderClass}
              onVideoWatched={markVideoWatched}
            />
          )}

          {/* Welcome Video Card (legacy - from admin uploads) */}
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
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
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
                      : `${validItemIds.length - Math.round(completionPercent / 100 * validItemIds.length)} tasks remaining`}
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className={cn("text-lg font-semibold", tierConfig.accentClass)}>
                    {section.category}
                  </h2>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-5 h-5" />
                    <span>{section.timeEstimate}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {section.items.map((item) => {
                    const completed = isItemCompleted(item.id);
                    const isToggling = togglingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-lg border transition-all",
                          completed 
                            ? "bg-muted/50 border-border" 
                            : "bg-card border-border hover:border-primary/50"
                        )}
                      >
                        {/* Checkbox - ONLY toggles completion */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggle(item.id);
                          }}
                          disabled={isToggling}
                          className="flex-shrink-0 mt-0.5"
                          aria-label={completed ? "Mark incomplete" : "Mark complete"}
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
                        
                        {/* Content - navigates to step if not completed */}
                        {!completed && item.href ? (
                          <Link 
                            to={item.href}
                            className="flex-1 min-w-0 group/link"
                          >
                            <p className="font-medium group-hover/link:text-primary transition-colors">
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </Link>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className={cn("font-medium", completed && "line-through text-muted-foreground")}>
                              {item.label}
                            </p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Arrow indicator - visible when not completed */}
                        {!completed && item.href && (
                          <Link 
                            to={item.href}
                            className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
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
          <div className="mt-12 flex flex-col sm:flex-row gap-2 sm:gap-4">
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
