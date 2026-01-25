import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, Clock, BookOpen, ArrowRight, Dumbbell, UtensilsCrossed } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Membership = () => {
  const features = [
    {
      icon: Dumbbell,
      title: "4 Bodyweight Workout Templates",
      description: "Cell Block Push, Yard Legs, Lockdown Pull, and Full Body Circuit. No equipment required.",
    },
    {
      icon: Calendar,
      title: "Daily Discipline Routines",
      description: "Morning and evening routine templates to structure your day from wake to sleep.",
    },
    {
      icon: UtensilsCrossed,
      title: "Basic Nutrition Template",
      description: "One fixed meal plan based on your goal — fat loss, muscle building, or recomposition.",
    },
    {
      icon: Clock,
      title: "Weekly Check-Ins",
      description: "Submit your weekly progress and stay accountable to the program.",
    },
    {
      icon: BookOpen,
      title: "Progress Tracking",
      description: "Track your workouts, habits, and transformation over time.",
    },
  ];

  const included = [
    { item: "4 bodyweight workout templates", included: true },
    { item: "Daily discipline routine templates", included: true },
    { item: "Basic nutrition template (one fixed meal)", included: true },
    { item: "Weekly check-in submissions", included: true },
    { item: "Progress tracking", included: true },
  ];

  const notIncluded = [
    { item: "Faith + mindset lessons", upgrade: "Gen Pop" },
    { item: "Full progressive workout library", upgrade: "Gen Pop" },
    { item: "12-Week assigned schedule", upgrade: "Gen Pop" },
    { item: "Full nutrition templates & meal swaps", upgrade: "Gen Pop" },
    { item: "Skill-building lessons", upgrade: "Gen Pop" },
    { item: "Community access (The Yard)", upgrade: "Gen Pop" },
    { item: "Direct messaging to Dom", upgrade: "Free World" },
    { item: "Weekly 1:1 video calls", upgrade: "Free World" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary uppercase tracking-widest mb-4">Solitary Confinement</p>
            <h1 className="headline-hero mb-6">
              The <span className="text-primary">Foundation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Strip away the distractions. In Solitary, you get nothing but the essentials — 
              the raw guidelines needed to perform. No noise. Just discipline.
            </p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-display text-primary">$49.99</span>
              <span className="text-muted-foreground text-xl">/month</span>
            </div>
            <Button variant="hero" size="hero" asChild>
              <Link to="/checkout?plan=membership">Enter Solitary</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              What You <span className="text-primary">Get</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="headline-card mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Breakdown */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              Complete <span className="text-primary">Breakdown</span>
            </h2>
            <div className="divider-gold" />
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Included */}
            <div className="bg-background p-8 rounded-lg border border-border">
              <h3 className="headline-card mb-6 flex items-center gap-2">
                <Check className="w-6 h-6 text-primary" />
                What's Included
              </h3>
              <ul className="space-y-4">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded bg-charcoal/50">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item.item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Included */}
            <div className="bg-background p-8 rounded-lg border border-border">
              <h3 className="headline-card mb-6 flex items-center gap-2">
                <X className="w-6 h-6 text-muted-foreground" />
                Upgrade to Unlock
              </h3>
              <ul className="space-y-4">
                {notIncluded.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded bg-charcoal/50">
                    <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">{item.item}</span>
                      <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {item.upgrade}+
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Ready to join the General Population?
                </p>
                <Button variant="goldOutline" size="sm" asChild>
                  <Link to="/checkout?plan=transformation" className="inline-flex items-center gap-2">
                    Join Gen Pop <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="max-w-lg mx-auto bg-charcoal p-8 rounded-lg border border-border">
            <h3 className="headline-card mb-4">Solitary Confinement</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display text-primary">$49.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Instant portal access
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Start immediately after intake
              </li>
            </ul>
            <Button variant="gold" size="xl" className="w-full" asChild>
              <Link to="/checkout?plan=membership">Enter Solitary</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Upgrade to General Population anytime
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
        <div className="section-container text-center">
          <h2 className="headline-section mb-4">
            Ready for <span className="text-primary">Solitary</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Strip away the noise. Start with the essentials.
          </p>
          <Button variant="hero" size="hero" asChild>
            <Link to="/checkout?plan=membership">Enter Solitary — $49.99/mo</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
