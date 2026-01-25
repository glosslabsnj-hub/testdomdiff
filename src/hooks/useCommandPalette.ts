import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
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
  Settings,
  Camera,
  Home,
  Flame,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  category: "navigation" | "quick-action" | "settings";
  keywords?: string[];
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isCoaching, isMembership } = useEffectiveSubscription();

  // Define all command items based on tier
  const allItems: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [
      // Navigation items
      {
        id: "dashboard",
        label: isCoaching ? "Dashboard" : "Cell Block",
        description: "Return to main dashboard",
        icon: Home,
        href: "/dashboard",
        category: "navigation",
        keywords: ["home", "main", "start"],
      },
      {
        id: "start-here",
        label: isCoaching ? "Welcome Home" : "Intake Processing",
        description: "Orientation and setup",
        icon: Play,
        href: "/dashboard/start-here",
        category: "navigation",
        keywords: ["orientation", "setup", "begin", "intake"],
      },
      {
        id: "workouts",
        label: isCoaching ? "Training Sessions" : isMembership ? "Yard Time" : "Workout Library",
        description: isMembership ? "Bodyweight workout templates" : "Full workout library",
        icon: Dumbbell,
        href: "/dashboard/workouts",
        category: "navigation",
        keywords: ["workout", "exercise", "training", "gym", "lift"],
      },
      {
        id: "discipline",
        label: isCoaching ? "Daily Structure" : "Lights On / Lights Out",
        description: "Morning and evening routines",
        icon: Clock,
        href: "/dashboard/discipline",
        category: "navigation",
        keywords: ["routine", "morning", "evening", "habits", "daily"],
      },
      {
        id: "nutrition",
        label: isCoaching ? "Meal Planning" : "Chow Hall",
        description: "Nutrition guidance and meal plans",
        icon: Utensils,
        href: "/dashboard/nutrition",
        category: "navigation",
        keywords: ["food", "meal", "diet", "nutrition", "eat"],
      },
      {
        id: "check-in",
        label: isCoaching ? "Weekly Report" : "Roll Call",
        description: "Submit your weekly check-in",
        icon: ClipboardCheck,
        href: "/dashboard/check-in",
        category: "navigation",
        keywords: ["checkin", "report", "weekly", "accountability"],
      },
      {
        id: "progress",
        label: isCoaching ? "Progress Report" : "Time Served",
        description: "Track your transformation",
        icon: TrendingUp,
        href: "/dashboard/progress",
        category: "navigation",
        keywords: ["stats", "track", "progress", "results"],
      },
      {
        id: "photos",
        label: isCoaching ? "Photo Gallery" : "Mugshots",
        description: "View your progress photos",
        icon: Camera,
        href: "/dashboard/photos",
        category: "navigation",
        keywords: ["photos", "pictures", "before", "after", "mugshot"],
      },
      {
        id: "settings",
        label: "Settings",
        description: "Account and preferences",
        icon: Settings,
        href: "/dashboard/settings",
        category: "settings",
        keywords: ["account", "profile", "preferences", "password"],
      },
    ];

    // Add tier-specific items
    if (!isMembership) {
      items.push(
        {
          id: "program",
          label: isCoaching ? "Your Program" : "The Sentence",
          description: "12-week structured program",
          icon: Calendar,
          href: "/dashboard/program",
          category: "navigation",
          keywords: ["12 week", "sentence", "program", "journey"],
        },
        {
          id: "faith",
          label: isCoaching ? "Faith & Mindset" : "Chapel",
          description: "Weekly faith lessons",
          icon: BookOpen,
          href: "/dashboard/faith",
          category: "navigation",
          keywords: ["faith", "chapel", "sermon", "scripture", "bible"],
        },
        {
          id: "skills",
          label: isCoaching ? "Career Building" : "Work Release",
          description: "Skill-building and hustle guides",
          icon: Briefcase,
          href: "/dashboard/skills",
          category: "navigation",
          keywords: ["skills", "hustle", "money", "career", "business"],
        },
        {
          id: "community",
          label: isCoaching ? "The Network" : "The Yard",
          description: "Connect with your brothers",
          icon: Users,
          href: "/dashboard/community",
          category: "navigation",
          keywords: ["community", "brothers", "yard", "network", "chat"],
        }
      );
    }

    // Coaching-only items
    if (isCoaching) {
      items.push(
        {
          id: "advanced-skills",
          label: "Entrepreneur Track",
          description: "Advanced business strategies",
          icon: GraduationCap,
          href: "/dashboard/advanced-skills",
          category: "navigation",
          keywords: ["advanced", "business", "entrepreneur"],
        },
        {
          id: "messages",
          label: "Direct Line",
          description: "Message Dom directly",
          icon: MessageCircle,
          href: "/dashboard/messages",
          category: "navigation",
          keywords: ["message", "dm", "direct", "chat", "dom"],
        },
        {
          id: "coaching",
          label: "Coaching Portal",
          description: "1:1 coaching access",
          icon: Crown,
          href: "/dashboard/coaching",
          category: "navigation",
          keywords: ["coaching", "1on1", "premium", "vip"],
        }
      );
    }

    // Quick actions
    items.push(
      {
        id: "start-workout",
        label: "Start Today's Workout",
        description: "Jump right into training",
        icon: Flame,
        href: isMembership ? "/dashboard/workouts" : "/dashboard/program",
        category: "quick-action",
        keywords: ["start", "begin", "train", "workout"],
      },
      {
        id: "submit-checkin",
        label: "Submit Check-In",
        description: "Complete your weekly report",
        icon: ClipboardCheck,
        href: "/dashboard/check-in",
        category: "quick-action",
        keywords: ["submit", "report", "checkin"],
      }
    );

    return items;
  }, [isCoaching, isMembership]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems;

    const query = search.toLowerCase();
    return allItems.filter((item) => {
      const matchLabel = item.label.toLowerCase().includes(query);
      const matchDesc = item.description?.toLowerCase().includes(query);
      const matchKeywords = item.keywords?.some((k) => k.includes(query));
      return matchLabel || matchDesc || matchKeywords;
    });
  }, [allItems, search]);

  // Handle selection
  const handleSelect = useCallback(
    (item: CommandItem) => {
      if (item.action) {
        item.action();
      } else if (item.href) {
        navigate(item.href);
      }
      setOpen(false);
      setSearch("");
    },
    [navigate]
  );

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Clear search when closing
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return {
    open,
    setOpen,
    search,
    setSearch,
    items: filteredItems,
    allItems,
    handleSelect,
  };
}
