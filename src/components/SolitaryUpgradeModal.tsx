import { Link } from "react-router-dom";
import { Lock, ArrowRight, Users, Dumbbell, Utensils, BookOpen, AlertTriangle, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const benefits = [
    {
      icon: Dumbbell,
      title: "Full Workout Library",
      description: "Progressive 12-week program with equipment training",
    },
    {
      icon: Utensils,
      title: "Nutrition Templates",
      description: "Meal plans and macro guidelines for your goals",
    },
    {
      icon: Briefcase,
      title: "Skill-Building Lessons",
      description: "Weekly lessons on money-making hustle skills",
    },
    {
      icon: Users,
      title: "The Yard Access",
      description: "Connect with your brothers in the community",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-crimson/30">
        <DialogHeader className="text-center">
          {/* Crimson-tinted lock icon for restricted access */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-crimson/10 border border-crimson/40 flex items-center justify-center">
            <Lock className="w-8 h-8 text-crimson" />
          </div>
          <DialogTitle className="text-2xl font-display">
            <span className="text-crimson">{feature}</span> Restricted
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You're in Solitary—time to earn your way to General Population.
          </DialogDescription>
        </DialogHeader>

        {/* Warning banner */}
        <div className="flex items-center gap-2 p-3 bg-crimson/10 border border-crimson/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-crimson flex-shrink-0" />
          <p className="text-sm text-crimson/90">
            This content is locked for Solitary Confinement members.
          </p>
        </div>

        <div className="py-4">
          <p className="text-xs text-primary uppercase tracking-wider text-center mb-3">
            Upgrade to unlock
          </p>
          <h3 className="text-xl font-display text-center mb-1">General Population</h3>
          <p className="text-2xl font-display text-primary text-center mb-6">$379.99</p>

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
            <Link to="/programs/transformation" onClick={() => onOpenChange(false)}>
              Join Gen Pop <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-crimson"
            onClick={() => onOpenChange(false)}
          >
            Stay in Solitary
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