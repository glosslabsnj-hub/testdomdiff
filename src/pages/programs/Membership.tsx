import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Users, Calendar, Clock, MessageSquare, BookOpen, ArrowRight, Dumbbell, UtensilsCrossed, Briefcase } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Membership = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Bodyweight Workout Templates",
      description: "Access to bodyweight-only workout templates. No equipment required. Prison-style frameworks.",
    },
    {
      icon: Calendar,
      title: "Daily Discipline Routines",
      description: "Morning and evening routine templates to structure your day from wake to sleep.",
    },
    {
      icon: Clock,
      title: "Weekly Checklists",
      description: "Track your workouts, habits, and progress with proven accountability frameworks.",
    },
    {
      icon: MessageSquare,
      title: "Community Access",
      description: "Connect with other men walking the same path. Brotherhood accountability.",
    },
    {
      icon: Users,
      title: "Mindset + Faith Lessons",
      description: "Weekly lessons on faith, discipline, and mindset to renew your mind.",
    },
  ];

  const included = [
    { item: "Bodyweight workout templates (no equipment)", included: true },
    { item: "Daily discipline routine templates", included: true },
    { item: "Mindset + Faith weekly lessons", included: true },
    { item: "Weekly habit tracker templates", included: true },
    { item: "Progress tracking templates", included: true },
    { item: "Community access", included: true },
    { item: "Weekly check-in submissions", included: true },
  ];

  const notIncluded = [
    { item: "Full progressive workout library", upgrade: "Transformation" },
    { item: "12-Week assigned schedule", upgrade: "Transformation" },
    { item: "Nutrition templates & meal guides", upgrade: "Transformation" },
    { item: "Skill-building lessons", upgrade: "Transformation" },
    { item: "Weekly video coaching", upgrade: "Transformation" },
    { item: "Direct messaging to Dom", upgrade: "Coaching" },
    { item: "Weekly 1:1 video calls", upgrade: "Coaching" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary uppercase tracking-widest mb-4">Discipline Membership</p>
            <h1 className="headline-hero mb-6">
              Monthly <span className="text-primary">Structure</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Ongoing structure, templates, and weekly rhythm for men committed to consistent 
              discipline. Build the habits that last.
            </p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-display text-primary">$79.99</span>
              <span className="text-muted-foreground text-xl">/month</span>
            </div>
            <Button variant="hero" size="hero" asChild>
              <Link to="/checkout?plan=membership">Join Membership</Link>
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
                  Ready for the full transformation experience?
                </p>
                <Button variant="goldOutline" size="sm" asChild>
                  <Link to="/programs/transformation" className="inline-flex items-center gap-2">
                    View Transformation <ArrowRight className="w-4 h-4" />
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
            <h3 className="headline-card mb-4">Discipline Membership</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display text-primary">$79.99</span>
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
              <Link to="/checkout?plan=membership">Join Now</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Upgrade to Transformation anytime
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
        <div className="section-container text-center">
          <h2 className="headline-section mb-4">
            Ready to Build <span className="text-primary">Discipline</span>?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the brotherhood. Start your journey today.
          </p>
          <Button variant="hero" size="hero" asChild>
            <Link to="/checkout?plan=membership">Join Membership — $79.99/mo</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
