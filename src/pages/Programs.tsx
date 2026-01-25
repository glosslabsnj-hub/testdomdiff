import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users, Flame, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgramComparisonTable from "@/components/ProgramComparisonTable";

const Programs = () => {
  const programs = [
    {
      id: "membership",
      title: "Solitary Confinement",
      subtitle: "The Foundation",
      price: "$49.99",
      period: "/month",
      icon: Users,
      description: "Strip away the distractions. In Solitary, you get nothing but the essentials — the raw guidelines needed to perform. No noise. Just discipline.",
      features: [
        "4 bodyweight workout templates",
        "Daily discipline routine templates",
        "Basic nutrition template (one fixed meal)",
        "Weekly check-in submissions",
        "Progress tracking",
      ],
      href: "/programs/membership",
      cta: "Enter Solitary",
    },
    {
      id: "transformation",
      title: "General Population",
      subtitle: "12 Weeks",
      price: "$379.99",
      period: "one-time",
      icon: Flame,
      description: "You've earned your place. In Gen Pop, you connect with peers, access video instruction, get nutrition plans, and start building your hustle.",
      features: [
        "Everything in Solitary included",
        "Full 12-week progressive program",
        "Weekly video coaching from Dom",
        "Full nutrition templates + meal swaps",
        "Faith + mindset weekly curriculum",
        "Skill-building lessons",
        "Community access (The Yard)",
      ],
      href: "/programs/transformation",
      cta: "Join Gen Pop",
      popular: true,
    },
    {
      id: "coaching",
      title: "Free World 1:1 Coaching",
      subtitle: "Limited to 10 Clients",
      price: "$999.99",
      period: "/month",
      icon: Target,
      description: "You've done the time. Now live free. Direct access to Dom for personalized coaching, custom programming, and in-person training available.",
      features: [
        "Everything in Gen Pop included",
        "Weekly 1:1 video calls with Dom",
        "Direct messaging access",
        "In-person training (NJ area)",
        "Advanced skill-building lessons",
        "Custom-built programming",
      ],
      href: "/programs/coaching",
      cta: "Apply for Coaching",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary uppercase tracking-widest mb-4">Programs</p>
            <h1 className="headline-hero mb-6">
              Pick Your <span className="text-primary">Block</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Three ways to transform. Same God-led discipline. Different levels of 
              accountability and support. Find what fits your season.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className={`relative flex flex-col p-8 rounded-lg border transition-all ${
                  program.popular
                    ? "bg-charcoal border-primary shadow-[0_0_40px_-10px_hsl(43_74%_49%_/_0.3)]"
                    : "bg-charcoal border-border hover:border-primary/50"
                }`}
              >
                {program.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <program.icon className="w-10 h-10 text-primary mb-4" />
                  <p className="text-sm text-primary uppercase tracking-wider mb-1">{program.subtitle}</p>
                  <h2 className="headline-card">{program.title}</h2>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-display text-primary">{program.price}</span>
                  <span className="text-muted-foreground">{program.period}</span>
                </div>

                <p className="text-muted-foreground mb-6">{program.description}</p>

                <ul className="space-y-3 mb-8 flex-grow">
                  {program.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={program.popular ? "gold" : "goldOutline"}
                  size="lg"
                  className="w-full"
                  asChild
                >
                  <Link to={program.href}>{program.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              Compare <span className="text-primary">All Features</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See exactly what's included in each program. Choose the level of support 
              that matches your commitment.
            </p>
          </div>
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <ProgramComparisonTable />
          </div>
        </div>
      </section>

      {/* Comparison Note */}
      <section className="py-16 bg-background">
        <div className="section-container text-center">
          <h3 className="headline-card mb-4">Not Sure Which Is Right For You?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Start with Solitary to build the basics. Upgrade to Gen Pop when you're 
            ready to commit. Apply for Free World when you need maximum accountability.
          </p>
          <Button variant="goldOutline" asChild>
            <Link to="/book-call" className="inline-flex items-center gap-2">
              Book a Free Consultation <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
