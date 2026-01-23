import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users, Flame, Target } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import trainingImage from "@/assets/training-image.jpg";

const Programs = () => {
  const programs = [
    {
      id: "membership",
      title: "Discipline Membership",
      subtitle: "Monthly Structure",
      price: "$79.99",
      period: "/month",
      icon: Users,
      description: "Ongoing structure, templates, and weekly rhythm for men committed to consistent discipline.",
      features: [
        "Template workout builder access",
        "Daily discipline routine templates",
        "Nutrition templates",
        "Weekly checklist + trackers",
        "Community access",
        "Monthly group call",
      ],
      href: "/programs/membership",
      cta: "Join Membership",
    },
    {
      id: "transformation",
      title: "New Life 12-Week Transformation",
      subtitle: "Flagship Program",
      price: "$749.99",
      period: "one-time",
      icon: Flame,
      description: "The complete transformation experience. 12 weeks to rebuild your body and renew your mind through faith-first discipline.",
      features: [
        "Complete 12-week framework",
        "Weekly group coaching calls",
        "Weekly check-in system",
        "Phase-based progression (Foundation → Build → Peak)",
        "Faith + mindset curriculum",
        "Nutrition templates",
        "Progress tracking templates",
        "Community access",
      ],
      href: "/programs/transformation",
      cta: "Start Transformation",
      popular: true,
    },
    {
      id: "coaching",
      title: "1:1 Redemption Coaching",
      subtitle: "Maximum Accountability",
      price: "$1,250",
      period: "/month",
      icon: Target,
      description: "Limited spots. Highest accountability. Direct access to Dom for personalized coaching and feedback.",
      features: [
        "Personalized feedback & programming",
        "Direct messaging access",
        "Custom-built structure",
        "Priority support",
        "Unlimited check-ins",
        "Weekly 1:1 calls",
        "All membership benefits included",
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
              Choose Your <span className="text-primary">Path</span>
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

      {/* Comparison Note */}
      <section className="py-16 bg-charcoal">
        <div className="section-container text-center">
          <h3 className="headline-card mb-4">Not Sure Which Is Right For You?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Start with the membership to test the waters. Upgrade to the 12-week when you're 
            ready to commit. Apply for 1:1 when you need maximum accountability.
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
