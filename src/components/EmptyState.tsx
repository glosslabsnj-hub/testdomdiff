import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Utensils, 
  Cross, 
  Camera, 
  ClipboardCheck, 
  MessageSquare,
  BookOpen,
  Trophy,
  Target,
  Calendar,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateType = 
  | "workouts" 
  | "nutrition" 
  | "faith" 
  | "photos" 
  | "checkins" 
  | "messages" 
  | "lessons"
  | "wins"
  | "goals"
  | "schedule"
  | "generic";

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

const EMPTY_STATE_CONFIG: Record<EmptyStateType, {
  icon: LucideIcon;
  defaultTitle: string;
  defaultDescription: string;
  defaultActionLabel: string;
  defaultActionLink: string;
  iconColor: string;
}> = {
  workouts: {
    icon: Dumbbell,
    defaultTitle: "Your iron is being forged",
    defaultDescription: "Workout templates are being prepared. Check back soon or start with the structured program.",
    defaultActionLabel: "Start The Sentence",
    defaultActionLink: "/dashboard/program",
    iconColor: "text-primary",
  },
  nutrition: {
    icon: Utensils,
    defaultTitle: "No meal plan assigned",
    defaultDescription: "Complete your intake form to get a personalized nutrition plan based on your goals.",
    defaultActionLabel: "View Sample Plan",
    defaultActionLink: "/dashboard/nutrition",
    iconColor: "text-green-400",
  },
  faith: {
    icon: Cross,
    defaultTitle: "The Chapel awaits",
    defaultDescription: "Strengthen your spirit alongside your body. Weekly faith lessons coming soon.",
    defaultActionLabel: "View Dashboard",
    defaultActionLink: "/dashboard",
    iconColor: "text-primary",
  },
  photos: {
    icon: Camera,
    defaultTitle: "No progress photos yet",
    defaultDescription: "Document your transformation. Take your first progress photo to track visible changes.",
    defaultActionLabel: "Upload First Photo",
    defaultActionLink: "/dashboard/progress",
    iconColor: "text-blue-400",
  },
  checkins: {
    icon: ClipboardCheck,
    defaultTitle: "Roll call is clear",
    defaultDescription: "Weekly check-ins help you stay accountable. Submit your first report when ready.",
    defaultActionLabel: "Submit Check-In",
    defaultActionLink: "/dashboard/check-in",
    iconColor: "text-success",
  },
  messages: {
    icon: MessageSquare,
    defaultTitle: "No messages yet",
    defaultDescription: "Connect with your coach or community. Start a conversation.",
    defaultActionLabel: "Send Message",
    defaultActionLink: "/dashboard/community",
    iconColor: "text-blue-400",
  },
  lessons: {
    icon: BookOpen,
    defaultTitle: "No lessons available",
    defaultDescription: "New content is added regularly. Check back soon for updates.",
    defaultActionLabel: "Explore Dashboard",
    defaultActionLink: "/dashboard",
    iconColor: "text-purple-400",
  },
  wins: {
    icon: Trophy,
    defaultTitle: "No wins shared yet",
    defaultDescription: "Celebrate your victories with the community. Share your first win!",
    defaultActionLabel: "Share a Win",
    defaultActionLink: "/dashboard/community",
    iconColor: "text-primary",
  },
  goals: {
    icon: Target,
    defaultTitle: "No goals set",
    defaultDescription: "Define your transformation goals to get personalized recommendations.",
    defaultActionLabel: "Set Goals",
    defaultActionLink: "/intake",
    iconColor: "text-primary",
  },
  schedule: {
    icon: Calendar,
    defaultTitle: "Nothing scheduled",
    defaultDescription: "Your upcoming workouts and check-ins will appear here.",
    defaultActionLabel: "View Program",
    defaultActionLink: "/dashboard/program",
    iconColor: "text-blue-400",
  },
  generic: {
    icon: BookOpen,
    defaultTitle: "No data available",
    defaultDescription: "Content will appear here once available.",
    defaultActionLabel: "Go to Dashboard",
    defaultActionLink: "/dashboard",
    iconColor: "text-muted-foreground",
  },
};

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];
  const Icon = config.icon;

  const finalTitle = title || config.defaultTitle;
  const finalDescription = description || config.defaultDescription;
  const finalActionLabel = actionLabel || config.defaultActionLabel;
  const finalActionLink = actionLink || config.defaultActionLink;

  return (
    <Card className="bg-charcoal border-border">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className={`p-4 rounded-full bg-muted/30 mb-4`}>
          <Icon className={`h-10 w-10 ${config.iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {finalTitle}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          {finalDescription}
        </p>
        {onAction ? (
          <Button variant="gold" onClick={onAction}>
            {finalActionLabel}
          </Button>
        ) : (
          <Button variant="gold" asChild>
            <Link to={finalActionLink}>{finalActionLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
