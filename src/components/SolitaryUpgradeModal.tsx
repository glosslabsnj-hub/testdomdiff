import { Link } from "react-router-dom";
import { ArrowRight, ArrowUp, Users, Dumbbell, Utensils, BookOpen, Briefcase, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SolitaryUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const SolitaryUpgradeModal = ({ open, onOpenChange, feature = "This feature" }: SolitaryUpgradeModalProps) => {
  const { subscription } = useAuth();

  // Calculate days served in Solitary
  const daysServed = subscription?.started_at
    ? Math.max(1, Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const benefits = [
    {
      icon: Dumbbell,
      title: "Full Workout Library",
      description: "Progressive 12-week program with equipment training",
    },
    {
      icon: Utensils,
      title: "Nutrition Templates",
      description: "Meal plans with swaps and macro tracking",
    },
    {
      icon: Briefcase,
      title: "Skill-Building Lessons",
      description: "Weekly lessons on money-making hustle skills",
    },
    {
      icon: Users,
      title: "The Yard Access",
      description: "Connect with your people in the community",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-primary/30">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
            <ArrowUp className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-display">
            Ready for <span className="text-primary">Gen Pop</span>?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You've been putting in work in Solitary. {feature} awaits you in General Population.
          </DialogDescription>
        </DialogHeader>

        {/* Days served badge */}
        <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <Flame className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-primary font-medium">
            {daysServed} day{daysServed !== 1 ? "s" : ""} served in Solitary
          </p>
        </div>

        <div className="py-4">
          <p className="text-xs text-primary uppercase tracking-wider text-center mb-3">
            Level up your transformation
          </p>
          <h3 className="text-xl font-display text-center mb-1">General Population</h3>
          <p className="text-2xl font-display text-primary text-center mb-6">$249 <span className="text-sm text-muted-foreground font-normal">one-time</span></p>

          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg steel-plate-border bg-steel-dark/30"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{benefit.title}</p>
                  <p className="text-xs text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button variant="gold" size="lg" className="w-full" asChild>
            <Link to="/checkout?plan=transformation" onClick={() => onOpenChange(false)}>
              Join Gen Pop <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Keep grinding in Solitary
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Questions?{" "}
          <Link
            to="/book-call"
            className="text-primary hover:underline"
            onClick={() => onOpenChange(false)}
          >
            Book a free call with Dom
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SolitaryUpgradeModal;