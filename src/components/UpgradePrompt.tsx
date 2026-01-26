import { Link } from "react-router-dom";
import { Lock, ArrowRight, ArrowLeft, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoachingSpots } from "@/hooks/useCoachingSpots";

interface UpgradePromptProps {
  feature: string;
  upgradeTo?: "transformation" | "coaching";
}

const UpgradePrompt = ({ feature, upgradeTo = "transformation" }: UpgradePromptProps) => {
  const coachingSpots = useCoachingSpots();

  const upgradeDetails = {
    transformation: {
      name: "General Population",
      price: "$379.99",
      href: "/checkout?plan=transformation",
      benefits: [
        "Full progressive workout library",
        "Assigned 12-week program schedule",
        "Weekly video coaching from Dom",
        "Nutrition templates & meal swaps",
        "Faith + mindset lessons",
        "Skill-building lessons",
        "Community access (The Yard)",
      ],
    },
    coaching: {
      name: "Free World Coaching",
      price: "$999.99/mo",
      href: "/checkout?plan=coaching",
      benefits: [
        "Everything in Gen Pop",
        "Direct messaging with Dom",
        "Weekly 1:1 video calls",
        "In-person training (NJ area)",
        "Advanced skill-building",
      ],
    },
  };

  const upgrade = upgradeDetails[upgradeTo];

  // Scarcity messaging
  const getScarcityMessage = () => {
    if (upgradeTo === "coaching" && !coachingSpots.loading) {
      if (coachingSpots.availableSpots <= 0) {
        return { type: "sold-out", message: "Currently full - join waitlist" };
      }
      if (coachingSpots.availableSpots <= 3) {
        return { type: "urgent", message: `Only ${coachingSpots.availableSpots} spot${coachingSpots.availableSpots > 1 ? 's' : ''} left!` };
      }
      return { type: "limited", message: `${coachingSpots.availableSpots} of ${coachingSpots.totalSpots} spots available` };
    }
    return null;
  };

  const scarcity = getScarcityMessage();

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Lock className="w-10 h-10 text-primary" />
          </div>

          <h1 className="headline-section mb-4">
            <span className="text-primary">{feature}</span> Not Available
          </h1>

          <p className="text-muted-foreground mb-8">
            This feature is only available for {upgrade.name} members. Upgrade to unlock access and take your transformation to the next level.
          </p>

          <div className="bg-card p-8 rounded-lg border border-border mb-8 relative overflow-hidden">
            {/* Scarcity Banner */}
            {scarcity && scarcity.type !== "sold-out" && (
              <div className={`absolute top-0 left-0 right-0 py-2 px-4 text-center text-sm font-medium ${
                scarcity.type === "urgent" 
                  ? "bg-destructive/20 text-destructive border-b border-destructive/30" 
                  : "bg-primary/10 text-primary border-b border-primary/30"
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {scarcity.type === "urgent" ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  {scarcity.message}
                </div>
              </div>
            )}

            <div className={scarcity && scarcity.type !== "sold-out" ? "pt-8" : ""}>
              <p className="text-xs text-primary uppercase tracking-wider mb-2">Upgrade to</p>
              <h2 className="headline-card text-2xl mb-4">{upgrade.name}</h2>
              
              {upgradeTo === "coaching" && (
                <Badge variant="outline" className="mb-4 border-crimson text-crimson">
                  Limited to 10 Men
                </Badge>
              )}
              
              <p className="text-3xl font-display text-primary mb-6">{upgrade.price}</p>

              <ul className="space-y-3 text-left mb-8">
                {upgrade.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button variant="gold" size="lg" className="w-full" asChild>
                <Link to={upgrade.href}>
                  {scarcity?.type === "sold-out" ? "Join Waitlist" : "Upgrade Now"} 
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Have questions?{" "}
            <Link to="/book-call" className="text-primary hover:underline">
              Book a free call with Dom
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
