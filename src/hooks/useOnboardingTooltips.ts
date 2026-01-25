import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "onboarding_tooltips_dismissed";

export interface TooltipConfig {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
}

// Define tooltips for each dashboard section
export const ONBOARDING_TOOLTIPS: Record<string, TooltipConfig> = {
  dashboard: {
    id: "dashboard",
    title: "Your Command Center",
    description: "This is your home base. Complete your Start Here checklist first, then explore your training, discipline, and faith content.",
  },
  program: {
    id: "program",
    title: "Your 12-Week Journey",
    description: "Each week has structured workouts. Click any day to see exercises, and mark them complete as you go.",
  },
  workouts: {
    id: "workouts",
    title: "Workout Templates",
    description: "Bodyweight workouts you can do anywhere. Pick a template and get after it.",
  },
  discipline: {
    id: "discipline",
    title: "Lights On / Lights Out",
    description: "Morning and evening routines build discipline. Check them off daily to grow your streak.",
  },
  nutrition: {
    id: "nutrition",
    title: "Fuel Your Transformation",
    description: "Your personalized meal plan based on your goals. Like, skip, or swap meals to track what works.",
  },
  faith: {
    id: "faith",
    title: "The Chapel",
    description: "Weekly lessons, prayer journaling, and faith-building content. Strength starts from within.",
  },
  progress: {
    id: "progress",
    title: "Track Your Transformation",
    description: "Log your metrics weekly, upload progress photos, and see your discipline compliance over time.",
  },
  community: {
    id: "community",
    title: "The Yard",
    description: "Connect with your brothers. Share wins, ask questions, and hold each other accountable.",
  },
};

export function useOnboardingTooltips() {
  const [dismissedTooltips, setDismissedTooltips] = useState<string[]>([]);
  const [currentTooltip, setCurrentTooltip] = useState<string | null>(null);

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
  }, []);

  // Show a tooltip if not already dismissed
  const showTooltipIfNeeded = useCallback((tooltipId: string) => {
    if (!isTooltipDismissed(tooltipId)) {
      setCurrentTooltip(tooltipId);
    }
  }, [isTooltipDismissed]);

  // Get tooltip config by id
  const getTooltip = useCallback((tooltipId: string): TooltipConfig | null => {
    return ONBOARDING_TOOLTIPS[tooltipId] || null;
  }, []);

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
