import { Link } from "react-router-dom";
import { Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UpgradePromptProps {
  feature: string;
  upgradeTo?: "transformation" | "coaching";
}

const UpgradePrompt = ({ feature, upgradeTo = "transformation" }: UpgradePromptProps) => {
  const upgradeDetails = {
    transformation: {
      name: "General Population",
      price: "$749.99",
      href: "/programs/transformation",
      benefits: [
        "Full progressive workout library",
        "Assigned 12-week program schedule",
        "Weekly video coaching from Dom",
        "Nutrition templates & guidelines",
        "Skill-building lessons",
      ],
    },
    coaching: {
      name: "Free World Coaching",
      price: "$1,250/mo",
      href: "/programs/coaching",
      benefits: [
        "Everything in Gen Pop",
        "Direct messaging with Dom",
        "Weekly 1:1 video calls",
        "Advanced skill-building",
        "Priority support",
      ],
    },
  };

  const upgrade = upgradeDetails[upgradeTo];

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

          <div className="bg-card p-8 rounded-lg border border-border mb-8">
            <p className="text-xs text-primary uppercase tracking-wider mb-2">Upgrade to</p>
            <h2 className="headline-card text-2xl mb-4">{upgrade.name}</h2>
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
                Upgrade Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
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
