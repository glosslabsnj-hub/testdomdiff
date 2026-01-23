import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Users, Calendar, Clock, MessageSquare, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Membership = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Template Workout Builder",
      description: "Access to all workout templates with prison-style frameworks. Build your own sessions.",
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
      title: "Monthly Group Call",
      description: "Live coaching and Q&A session with Dom each month.",
    },
  ];

  const included = [
    "Template workout builder access",
    "Daily discipline routine templates",
    "Nutrition templates & meal structure guides",
    "Weekly habit tracker templates",
    "Progress tracking templates",
    "Community access",
    "Monthly group coaching call",
    "Weekly check-in template",
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

      {/* What's Included */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="headline-section mb-6">
                Everything <span className="text-primary">Included</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Templates you fill with your own work. Frameworks that create consistency. 
                Structure that builds discipline.
              </p>
              <ul className="space-y-4">
                {included.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-background p-8 rounded-lg border border-border">
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
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
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
