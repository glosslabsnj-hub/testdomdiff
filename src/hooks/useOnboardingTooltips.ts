import { useState, useEffect, useCallback } from "react";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";

const STORAGE_KEY = "onboarding_tooltips_dismissed";

export interface TooltipConfig {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
}

// Define tier-specific tooltips
const SOLITARY_TOOLTIPS: Record<string, TooltipConfig> = {
  dashboard: {
    id: "dashboard",
    title: "Your Cell Block",
    description: "This is your home base. Complete your Start Here checklist, then head to Yard Time for bodyweight workouts.",
  },
  workouts: {
    id: "workouts",
    title: "Iron Pile",
    description: "4 bodyweight workout templates you can do anywhere. Pick one and get after it.",
  },
  discipline: {
    id: "discipline",
    title: "Lights On / Lights Out",
    description: "Morning and evening routines build discipline. Check them off daily to grow your streak.",
  },
  nutrition: {
    id: "nutrition",
    title: "Basic Nutrition",
    description: "Simple meal guidance matched to your goals. Upgrade to Gen Pop for complete meal plans.",
  },
  progress: {
    id: "progress",
    title: "Time Served",
    description: "Upload progress photos and track your measurements. See how far you've come.",
  },
};

const GEN_POP_TOOLTIPS: Record<string, TooltipConfig> = {
  dashboard: {
    id: "dashboard",
    title: "Your Cell Block",
    description: "Complete your Start Here checklist first, then start The Sentence - your 12-week program.",
  },
  program: {
    id: "program",
    title: "The Sentence",
    description: "Your 12-week transformation program. Each week has structured workouts - mark days complete as you go.",
  },
  workouts: {
    id: "workouts",
    title: "Workout Library",
    description: "Access all workout templates. Your program workouts are in The Sentence.",
  },
  discipline: {
    id: "discipline",
    title: "Lights On / Lights Out",
    description: "Morning and evening routines build discipline. Check them off daily to grow your streak.",
  },
  nutrition: {
    id: "nutrition",
    title: "Chow Hall",
    description: "Your complete meal plan based on your goals. Like, skip, or swap meals to track what works.",
  },
  faith: {
    id: "faith",
    title: "The Chapel",
    description: "Weekly faith lessons, scripture, and reflection. Strength starts from within.",
  },
  progress: {
    id: "progress",
    title: "Time Served",
    description: "Track your transformation - photos, measurements, and compliance over your 12 weeks.",
  },
  community: {
    id: "community",
    title: "The Yard",
    description: "Connect with your brothers. Share wins, ask questions, and hold each other accountable.",
  },
};

const COACHING_TOOLTIPS: Record<string, TooltipConfig> = {
  dashboard: {
    id: "dashboard",
    title: "Welcome Home",
    description: "Your dashboard. Complete orientation, then connect with Dom in the Coaching Portal.",
  },
  program: {
    id: "program",
    title: "Your Program",
    description: "Your personalized training plan. Dom builds this specifically for your goals.",
  },
  workouts: {
    id: "workouts",
    title: "Training Sessions",
    description: "Your complete workout library. Your custom program is in Your Program.",
  },
  discipline: {
    id: "discipline",
    title: "Daily Structure",
    description: "Morning and evening routines build habits. Check them off daily.",
  },
  nutrition: {
    id: "nutrition",
    title: "Meal Planning",
    description: "Your personalized nutrition plan adjusted to your TDEE and goals.",
  },
  faith: {
    id: "faith",
    title: "Faith & Mindset",
    description: "Weekly growth lessons, scripture, and mindset training.",
  },
  progress: {
    id: "progress",
    title: "Progress Report",
    description: "Track your transformation journey with photos and metrics.",
  },
  community: {
    id: "community",
    title: "The Network",
    description: "Connect with fellow Free World members. Build lasting relationships.",
  },
  coaching: {
    id: "coaching",
    title: "Coaching Portal",
    description: "Book 1:1 calls with Dom and access your premium coaching features.",
  },
  messages: {
    id: "messages",
    title: "Direct Line",
    description: "Message Dom directly anytime. He personally reviews and responds.",
  },
};

export function useOnboardingTooltips() {
  const { isCoaching, isTransformation, isMembership } = useEffectiveSubscription();
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null);

  // Get the correct tooltips based on tier
  const ONBOARDING_TOOLTIPS = isCoaching 
    ? COACHING_TOOLTIPS 
    : (isMembership ? SOLITARY_TOOLTIPS : GEN_POP_TOOLTIPS);

  // Load dismissed tooltips from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDismissedTooltips(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error loading onboarding tooltips:", e);
    }
  }, []);

  // Check if a tooltip has been dismissed
  const isTooltipDismissed = useCallback((tooltipId: string) => {
    return dismissedTooltips.includes(tooltipId);
  }, [dismissedTooltips]);

  // Dismiss a tooltip
  const dismissTooltip = useCallback((tooltipId: string) => {
    setDismissedTooltips(prev => {
      const updated = [...prev, tooltipId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Error saving onboarding tooltip:", e);
      }
      return updated;
    });
    setCurrentTooltip(null);
  }, []);

  // Dismiss all tooltips
  const dismissAllTooltips = useCallback(() => {
    const allIds = Object.keys(ONBOARDING_TOOLTIPS);
    setDismissedTooltips(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch (e) {
      console.error("Error saving onboarding tooltips:", e);
    }
    setCurrentTooltip(null);
  }, [ONBOARDING_TOOLTIPS]);

  // Show a tooltip if not already dismissed
  const showTooltipIfNeeded = useCallback((tooltipId: string) => {
    if (!isTooltipDismissed(tooltipId)) {
      setCurrentTooltip(tooltipId);
    }
  }, [isTooltipDismissed]);

  // Get tooltip config by id
  const getTooltip = useCallback((tooltipId: string): TooltipConfig | null => {
    return ONBOARDING_TOOLTIPS[tooltipId] || null;
  }, [ONBOARDING_TOOLTIPS]);

  // Reset all tooltips (for testing)
  const resetTooltips = useCallback(() => {
    setDismissedTooltips([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    dismissedTooltips,
    currentTooltip,
    isTooltipDismissed,
    dismissTooltip,
    dismissAllTooltips,
    showTooltipIfNeeded,
    getTooltip,
    resetTooltips,
  };
}
