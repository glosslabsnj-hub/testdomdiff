import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Play, CheckSquare, Dumbbell } from "lucide-react";

const IntakeComplete = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="section-container py-20">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-8">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="headline-section mb-4">
            Processing <span className="text-primary">Complete</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            You're officially on the inside. Your cell block is ready. Time to build different.
          </p>
          <div className="bg-charcoal p-8 rounded-lg border border-border mb-8">
            <h3 className="headline-card mb-4">What's Next:</h3>
            <ul className="text-left space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Watch Dom's Welcome Video</p>
                  <p className="text-sm text-muted-foreground">Get a personal message from your coach</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Complete Your Setup Checklist</p>
                  <p className="text-sm text-muted-foreground">Get oriented with all program features</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Start Your First Workout</p>
                  <p className="text-sm text-muted-foreground">Jump in when you're ready — no pressure</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="hero" asChild>
              <Link to="/dashboard/start-here" className="gap-2">
                Go to Start Here <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="goldOutline" size="lg" asChild>
              <Link to="/dashboard">
                Skip to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeComplete;
