import { useState, useEffect, useCallback } from "react";

type PlanType = "coaching" | "transformation" | "membership" | string;
type TipCategory = "discipline" | "workout" | "scripture" | "nutrition" | "faith";

interface WardenTip {
  id: string;
  category: TipCategory;
  text: string;
  // Optional tier restrictions - if empty, applies to all tiers
  tiers?: PlanType[];
}

// Tier-specific tip variants
const WARDEN_TIPS: WardenTip[] = [
  // Discipline - Universal
  { id: "d1", category: "discipline", text: "Your morning routine builds the foundation. No shortcuts, no excuses." },
  { id: "d2", category: "discipline", text: "Discipline is choosing between what you want now and what you want most." },
  { id: "d3", category: "discipline", text: "The man who conquers himself is greater than the one who conquers a thousand battles." },
  { id: "d4", category: "discipline", text: "Stack your wins. Small victories compound into transformation." },
  { id: "d5", category: "discipline", text: "Your routine doesn't care about your feelings. Show up anyway." },
  
  // Workout - Solitary (membership)
  { id: "w1-sol", category: "workout", text: "Iron sharpens iron. Time to hit the yard.", tiers: ["membership"] },
  { id: "w2-sol", category: "workout", text: "Your body can handle more than your mind thinks. Push through.", tiers: ["membership"] },
  { id: "w3-sol", category: "workout", text: "Every rep is a vote for the man you're becoming.", tiers: ["membership"] },
  { id: "w4-sol", category: "workout", text: "Rest is earned, not given. Put in the work first.", tiers: ["membership"] },
  { id: "w5-sol", category: "workout", text: "Sweat today, strength tomorrow. The compound effect is real.", tiers: ["membership"] },
  
  // Workout - Gen Pop (transformation)
  { id: "w1-gp", category: "workout", text: "The Sentence is waiting. Time to attack your program.", tiers: ["transformation"] },
  { id: "w2-gp", category: "workout", text: "Your body can handle more than your mind thinks. Push through.", tiers: ["transformation"] },
  { id: "w3-gp", category: "workout", text: "Every rep is a vote for the man you're becoming.", tiers: ["transformation"] },
  { id: "w4-gp", category: "workout", text: "12 weeks. That's the commitment. Honor it today.", tiers: ["transformation"] },
  { id: "w5-gp", category: "workout", text: "The Sentence builds men. Trust the program.", tiers: ["transformation"] },
  
  // Workout - Free World (coaching)
  { id: "w1-fw", category: "workout", text: "Your training session is designed for results. Time to execute.", tiers: ["coaching"] },
  { id: "w2-fw", category: "workout", text: "Your body can handle more than your mind thinks. Push through.", tiers: ["coaching"] },
  { id: "w3-fw", category: "workout", text: "Every rep is a vote for the man you're becoming.", tiers: ["coaching"] },
  { id: "w4-fw", category: "workout", text: "Your custom program is built for you. Trust it and execute.", tiers: ["coaching"] },
  { id: "w5-fw", category: "workout", text: "Training in the Free World hits different. Make it count.", tiers: ["coaching"] },
  
  // Scripture - Universal
  { id: "s1", category: "scripture", text: "\"I can do all things through Christ who strengthens me.\" — Philippians 4:13" },
  { id: "s2", category: "scripture", text: "\"Be strong and courageous. Do not be afraid.\" — Joshua 1:9" },
  { id: "s3", category: "scripture", text: "\"For God gave us a spirit not of fear but of power.\" — 2 Timothy 1:7" },
  { id: "s4", category: "scripture", text: "\"The Lord is my strength and my shield.\" — Psalm 28:7" },
  { id: "s5", category: "scripture", text: "\"Commit your work to the Lord, and your plans will succeed.\" — Proverbs 16:3" },
  
  // Nutrition - Universal
  { id: "n1", category: "nutrition", text: "Fuel the machine. Protein first, excuses never." },
  { id: "n2", category: "nutrition", text: "You can't out-train a bad diet. What you eat matters." },
  { id: "n3", category: "nutrition", text: "Drink water. Your body is a temple, not a garbage disposal." },
  { id: "n4", category: "nutrition", text: "Meal prep is self-respect. Future you will thank present you." },
  { id: "n5", category: "nutrition", text: "Hunger is temporary. Regret lasts longer. Choose wisely." },
  
  // Faith - Universal
  { id: "f1", category: "faith", text: "Your struggle has purpose. Keep pressing forward in faith." },
  { id: "f2", category: "faith", text: "God's not done with you yet. Every day is a chance to become new." },
  { id: "f3", category: "faith", text: "Prayer isn't a last resort. It's your first move every morning." },
  { id: "f4", category: "faith", text: "Your testimony is being written right now. Make it count." },
  { id: "f5", category: "faith", text: "Grace covers your past. Discipline shapes your future." },
];

const TIP_ROTATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

function filterTipsForTier(planType: PlanType): WardenTip[] {
  return WARDEN_TIPS.filter(tip => {
    // If no tier restriction, show to all
    if (!tip.tiers || tip.tiers.length === 0) {
      return true;
    }
    // Otherwise, only show if user's tier is in the list
    return tip.tiers.includes(planType);
  });
}

export function useWardenTips(planType: PlanType = "membership") {
  const [currentTip, setCurrentTip] = useState<WardenTip | null>(null);
  const [shownTipIds, setShownTipIds] = useState<Set<string>>(new Set());

  const getNextTip = useCallback(() => {
    // Get tips filtered for this tier
    const tierTips = filterTipsForTier(planType);
    
    // Filter out recently shown tips
    const availableTips = tierTips.filter(tip => !shownTipIds.has(tip.id));
    
    // If we've shown all tips, reset the shown list
    if (availableTips.length === 0) {
      setShownTipIds(new Set());
      const randomIndex = Math.floor(Math.random() * tierTips.length);
      const nextTip = tierTips[randomIndex];
      setCurrentTip(nextTip);
      setShownTipIds(new Set([nextTip.id]));
      return;
    }
    
    // Pick a random tip from available ones
    const randomIndex = Math.floor(Math.random() * availableTips.length);
    const nextTip = availableTips[randomIndex];
    
    setCurrentTip(nextTip);
    setShownTipIds(prev => new Set([...prev, nextTip.id]));
  }, [shownTipIds, planType]);

  // Initialize with a random tip
  useEffect(() => {
    if (!currentTip) {
      getNextTip();
    }
  }, [currentTip, getNextTip]);

  // Reset when plan type changes
  useEffect(() => {
    setShownTipIds(new Set());
    getNextTip();
  }, [planType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Rotate tips every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      getNextTip();
    }, TIP_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [getNextTip]);

  return {
    currentTip,
    refreshTip: getNextTip,
  };
}
