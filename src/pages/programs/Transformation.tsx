import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, X, Flame, Calendar, Users, Target, BookOpen, Trophy, ArrowRight, Dumbbell, UtensilsCrossed, Briefcase, Brain } from "lucide-react";
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

  const includedCategories = [
    {
      title: "Workouts",
      icon: Dumbbell,
      items: [
        "Full progressive workout library (not just bodyweight)",
        "Complete 12-week assigned schedule",
        "Weekly video coaching from Dom",
        "Phase-based progression (Foundation → Build → Peak)",
      ],
    },
    {
      title: "Nutrition",
      icon: UtensilsCrossed,
      items: [
        "Complete nutrition templates",
        "Meal planning with swaps",
        "TDEE-matched calorie targets",
        "Macro guidance for your goals",
      ],
    },
    {
      title: "Skill-Building",
      icon: Briefcase,
      items: [
        "Money-making skill lessons",
        "Side hustle frameworks",
        "Business fundamentals",
        "Financial discipline training",
      ],
    },
    {
      title: "Faith & Mindset",
      icon: Brain,
      items: [
        "Weekly faith lessons",
        "Scripture-based mindset training",
        "Daily discipline routines",
        "Character development curriculum",
      ],
    },
  ];

  const notIncluded = [
    { item: "Weekly 1:1 video calls with Dom", upgrade: "Free World" },
    { item: "Direct messaging access to Dom", upgrade: "Free World" },
    { item: "Advanced skill-building lessons", upgrade: "Free World" },
    { item: "Custom-built programming", upgrade: "Free World" },
    { item: "Priority support", upgrade: "Free World" },
  ];

  const features = [
    {
      icon: Calendar,
      title: "12-Week Assigned Schedule",
      description: "Your workouts are assigned each week. No guessing. Just follow the program.",
    },
    {
      icon: Users,
      title: "Weekly Video Coaching",
      description: "New coaching video from Dom each week with guidance, motivation, and teaching.",
    },
    {
      icon: Target,
      title: "Full Workout Library",
      description: "Access the complete progressive workout library, not just bodyweight templates.",
    },
    {
      icon: Flame,
      title: "Phase Progression",
      description: "Foundation → Build → Peak. Strategic progression for maximum results.",
    },
    {
      icon: BookOpen,
      title: "Skill-Building Lessons",
      description: "Learn money-making skills alongside your physical transformation. Build your hustle.",
    },
    {
      icon: Trophy,
      title: "Community Access",
      description: "Connect with your community in The Yard. Iron sharpens iron.",
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
                <span className="text-sm text-primary uppercase tracking-wider">You've Earned Your Place</span>
              </div>
              <h1 className="headline-hero mb-6">
                <span className="text-primary">General Population</span><br />12 Weeks
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                You've earned your place. In Gen Pop, you connect with peers, access video 
                instruction, get nutrition plans, and start building your hustle.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display text-primary">$379.99</span>
                <span className="text-muted-foreground text-xl">one-time</span>
              </div>
              <Button variant="hero" size="hero" asChild>
                <Link to="/checkout?plan=transformation">Join Gen Pop</Link>
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

      {/* Detailed Category Breakdown */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              Complete <span className="text-primary">Breakdown</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need for a complete transformation. No hidden extras. No upsells. Just results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {includedCategories.map((category, index) => (
              <div key={index} className="bg-charcoal p-6 rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className="w-8 h-8 text-primary" />
                  <h3 className="headline-card">{category.title}</h3>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* What's NOT included */}
          <div className="bg-charcoal/50 p-6 rounded-lg border border-border">
            <h3 className="headline-card mb-4 flex items-center gap-2">
              <X className="w-5 h-5 text-muted-foreground" />
              Available in Free World Only
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {notIncluded.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded bg-background">
                  <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item.item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="goldOutline" size="sm" asChild>
                <Link to="/checkout?plan=coaching" className="inline-flex items-center gap-2">
                  Apply for Free World <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="max-w-lg mx-auto bg-background p-8 rounded-lg border border-primary shadow-[0_0_40px_-10px_hsl(43_74%_49%_/_0.3)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <span className="text-xs text-primary uppercase tracking-wider">Most Popular</span>
            </div>
            <h3 className="headline-card mb-4">General Population</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display text-primary">$379.99</span>
              <span className="text-muted-foreground">one-time</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Full 12-week program access
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Weekly coaching videos included
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Start immediately after intake
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                98-day access (12 weeks + 14-day grace)
              </li>
            </ul>
            <Button variant="gold" size="xl" className="w-full" asChild>
              <Link to="/checkout?plan=transformation">Join Gen Pop</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="section-container text-center">
          <h2 className="headline-section mb-4">
            12 Weeks in <span className="text-primary">Gen Pop</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            You've earned your place. Time to build with the community.
          </p>
          <Button variant="hero" size="hero" asChild>
            <Link to="/checkout?plan=transformation">Join Gen Pop — $379.99</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Transformation;
