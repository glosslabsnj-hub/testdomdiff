import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

const IntakeComplete = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="section-container py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="headline-section mb-4">
            Intake <span className="text-primary">Complete</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            You're officially in. Your dashboard is ready. Time to build different.
          </p>
          <div className="bg-charcoal p-8 rounded-lg border border-border mb-8">
            <h3 className="headline-card mb-4">What's Next:</h3>
            <ul className="text-left space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <p className="text-muted-foreground">Access your dashboard and explore the templates</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <p className="text-muted-foreground">Complete the "Start Here" onboarding checklist</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <p className="text-muted-foreground">Set up your first week's training schedule</p>
              </li>
            </ul>
          </div>
          <Button variant="hero" size="hero" asChild>
            <Link to="/dashboard" className="gap-2">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntakeComplete;
