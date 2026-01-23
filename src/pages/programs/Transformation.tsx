import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Flame, Calendar, Users, Target, BookOpen, Trophy } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import transformationImage from "@/assets/transformation-image.jpg";

const Transformation = () => {
  const phases = [
    {
      phase: "Phase 1",
      title: "Foundation",
      weeks: "Weeks 1-4",
      focus: "Build the base. Establish habits. Create the daily discipline that everything else builds upon.",
    },
    {
      phase: "Phase 2",
      title: "Build",
      weeks: "Weeks 5-8",
      focus: "Increase intensity. Refine technique. Push past comfort zones. This is where growth happens.",
    },
    {
      phase: "Phase 3",
      title: "Peak",
      weeks: "Weeks 9-12",
      focus: "Maximum output. Fine-tune everything. Cross the finish line transformed — body, mind, and spirit.",
    },
  ];

  const included = [
    "Complete 12-week framework with weekly structure",
    "Weekly group coaching calls with Dom",
    "Weekly check-in accountability system",
    "Phase-based progression templates",
    "Faith + mindset curriculum",
    "Nutrition templates and meal planning guides",
    "Progress tracking templates",
    "Community access and brotherhood",
    "All workout templates",
    "Daily discipline routine templates",
  ];

  const features = [
    {
      icon: Calendar,
      title: "12-Week Structure",
      description: "Proven framework with weekly breakdowns. You know exactly what to do every single day.",
    },
    {
      icon: Users,
      title: "Weekly Group Calls",
      description: "Live coaching with Dom. Ask questions. Get feedback. Stay accountable.",
    },
    {
      icon: Target,
      title: "Check-In System",
      description: "Weekly accountability check-ins to track progress and stay on course.",
    },
    {
      icon: Flame,
      title: "Phase Progression",
      description: "Foundation → Build → Peak. Strategic progression for maximum results.",
    },
    {
      icon: BookOpen,
      title: "Faith Curriculum",
      description: "Weekly scripture, mindset lessons, and spiritual disciplines alongside physical training.",
    },
    {
      icon: Trophy,
      title: "Transformation Focus",
      description: "This isn't maintenance. This is complete transformation — designed to change your life.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary uppercase tracking-wider">Flagship Program</span>
              </div>
              <h1 className="headline-hero mb-6">
                New Life <span className="text-primary">12-Week</span> Transformation
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                The complete transformation experience. 12 weeks to rebuild your body and 
                renew your mind through faith-first discipline.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display text-primary">$749.99</span>
                <span className="text-muted-foreground text-xl">one-time</span>
              </div>
              <Button variant="hero" size="hero" asChild>
                <Link to="/checkout?plan=transformation">Start Transformation</Link>
              </Button>
            </div>
            <div className="relative hidden lg:block">
              <img
                src={transformationImage}
                alt="Transformation results"
                className="rounded-lg w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              The 3-Phase <span className="text-primary">System</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Strategic progression designed to build you up systematically. 
              Each phase prepares you for the next.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="relative p-8 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all"
              >
                <div className="absolute -top-4 left-6 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded">
                  {phase.phase}
                </div>
                <p className="text-sm text-muted-foreground mb-2 mt-2">{phase.weeks}</p>
                <h3 className="headline-card mb-3">{phase.title}</h3>
                <p className="text-muted-foreground">{phase.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              What's <span className="text-primary">Included</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all"
              >
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="headline-card mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full Breakdown */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="headline-section mb-6">
                Complete <span className="text-primary">Breakdown</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Everything you need for a complete transformation. No hidden extras. 
                No upsells. Just results.
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
            <div className="bg-charcoal p-8 rounded-lg border border-primary shadow-[0_0_40px_-10px_hsl(43_74%_49%_/_0.3)]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-4">
                <span className="text-xs text-primary uppercase tracking-wider">Most Popular</span>
              </div>
              <h3 className="headline-card mb-4">12-Week Transformation</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-display text-primary">$749.99</span>
                <span className="text-muted-foreground">one-time</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Full 12-week program access
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Weekly coaching calls included
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Start immediately after intake
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  Lifetime access to materials
                </li>
              </ul>
              <Button variant="gold" size="xl" className="w-full" asChild>
                <Link to="/checkout?plan=transformation">Start Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
        <div className="section-container text-center">
          <h2 className="headline-section mb-4">
            12 Weeks to a <span className="text-primary">New Life</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            This is where transformation happens. Are you ready to become who God made you to be?
          </p>
          <Button variant="hero" size="hero" asChild>
            <Link to="/checkout?plan=transformation">Start Transformation — $749.99</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Transformation;
