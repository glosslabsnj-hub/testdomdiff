import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";

const BookPOCheckin = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="section-container py-12">
        <Link
          to="/dashboard/coaching"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to P.O. Portal
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="headline-section mb-2">
              Schedule Your <span className="text-primary">P.O. Check-In</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your weekly accountability call with Dom. Report in, get guidance, stay on track.
            </p>
          </div>

          {/* What to Expect */}
          <div className="bg-charcoal rounded-lg border border-border p-6 mb-8">
            <h2 className="font-display text-xl mb-4">What to Expect</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">15-30 Minutes</p>
                  <p className="text-xs text-muted-foreground">Focused, efficient check-in</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Progress Review</p>
                  <p className="text-xs text-muted-foreground">Workouts, discipline, nutrition</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Weekly Cadence</p>
                  <p className="text-xs text-muted-foreground">Consistent accountability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendly Embed Placeholder */}
          <div className="bg-card rounded-lg border border-primary/30 overflow-hidden">
            <div className="p-4 bg-primary/10 border-b border-primary/30">
              <h2 className="font-display text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Select Your Check-In Time
              </h2>
            </div>
            
            {/* Placeholder for Calendly */}
            <div className="p-8 text-center bg-charcoal/50 min-h-[400px] flex flex-col items-center justify-center">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Calendly booking widget will appear here
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Configure your coaching calendar link to enable scheduling
              </p>
              <Button variant="gold" asChild>
                <a 
                  href="https://calendly.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Open Calendly
                </a>
              </Button>
            </div>
          </div>

          {/* Preparation Tips */}
          <div className="mt-8 bg-gradient-to-br from-primary/20 to-amber-500/10 rounded-lg border border-primary/30 p-6">
            <h3 className="font-display text-lg mb-4">Before Your Check-In</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Complete your weekly check-in form in the dashboard</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Review your workout completions and discipline streaks</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Note any challenges or wins you want to discuss</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Be in a quiet place with stable internet connection</span>
              </li>
            </ul>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/coaching">Return to P.O. Portal</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookPOCheckin;
