import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Target, MessageSquare, Phone, Calendar, Shield, Crown, Dumbbell, UtensilsCrossed, Briefcase, Brain, GraduationCap, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import coachingImage from "@/assets/coaching-image.jpg";

const Coaching = () => {
  const exclusiveFeatures = [
    {
      icon: Phone,
      title: "Weekly 1:1 Video Calls",
      description: "Direct time with Dom every week. Strategy, accountability, and personalized coaching.",
      exclusive: true,
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging Access",
      description: "Access to Dom throughout the week. Questions, check-ins, and real-time support.",
      exclusive: true,
    },
    {
      icon: Target,
      title: "Custom Programming",
      description: "Your program built from scratch based on your goals, equipment, and schedule.",
      exclusive: true,
    },
    {
      icon: GraduationCap,
      title: "Advanced Skill-Building",
      description: "High-level hustle training: scaling income, leadership, building legacy.",
      exclusive: true,
    },
  ];

  const includedCategories = [
    {
      title: "Exclusive Coaching Access",
      icon: Crown,
      highlight: true,
      items: [
        "Weekly 1:1 video calls with Dom",
        "Direct messaging access anytime",
        "Custom-built programming",
        "Priority support & feedback",
        "Advanced skill-building lessons",
        "Unlimited check-ins",
      ],
    },
    {
      title: "Full Workout System",
      icon: Dumbbell,
      items: [
        "Complete progressive workout library",
        "Personalized exercise selection",
        "Form coaching on calls",
        "Recovery programming",
      ],
    },
    {
      title: "Nutrition Coaching",
      icon: UtensilsCrossed,
      items: [
        "Custom nutrition guidance",
        "Meal planning for your goals",
        "Supplement recommendations",
        "Adjustments based on progress",
      ],
    },
    {
      title: "Skill & Business Building",
      icon: Briefcase,
      items: [
        "Standard skill-building lessons",
        "Advanced hustle training (exclusive)",
        "Business strategy coaching",
        "Financial discipline mentoring",
      ],
    },
    {
      title: "Faith & Mindset",
      icon: Brain,
      items: [
        "Weekly faith lessons",
        "Character development",
        "Daily discipline routines",
        "Mindset coaching on calls",
      ],
    },
    {
      title: "Community & Support",
      icon: Users,
      items: [
        "Priority community access",
        "Brotherhood accountability",
        "Progress celebration",
        "Lifetime brotherhood connection",
      ],
    },
  ];

  const features = [
    {
      icon: Phone,
      title: "Weekly 1:1 Calls",
      description: "Direct time with Dom every week. Strategy, accountability, and personalized coaching.",
    },
    {
      icon: MessageSquare,
      title: "Direct Messaging",
      description: "Access to Dom throughout the week. Questions, check-ins, and real-time support.",
    },
    {
      icon: Target,
      title: "Custom Programming",
      description: "Your program built from scratch based on your goals, equipment, and schedule.",
    },
    {
      icon: Shield,
      title: "Maximum Accountability",
      description: "No hiding. No excuses. This is the highest level of support and accountability available.",
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
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary uppercase tracking-wider">Limited Spots</span>
              </div>
              <h1 className="headline-hero mb-6">
                1:1 <span className="text-primary">Redemption</span> Coaching
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Maximum accountability. Direct access. Personalized everything. 
                This is for men who are ready to go all in.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-display text-primary">$1,250</span>
                <span className="text-muted-foreground text-xl">/month</span>
              </div>
              <Button variant="hero" size="hero" asChild>
                <Link to="/checkout?plan=coaching">Apply for Coaching</Link>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                * Limited to 10 active clients. Apply to check availability.
              </p>
            </div>
            <div className="relative hidden lg:block">
              <img
                src={coachingImage}
                alt="1:1 Coaching"
                className="rounded-lg w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Exclusive Features */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              <span className="text-primary">Coaching</span> Exclusives
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These features are only available to 1:1 Coaching members. The highest level of access and support.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {exclusiveFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-lg bg-charcoal border border-primary/30 hover:border-primary transition-all relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded uppercase tracking-wider font-bold">
                    Exclusive
                  </span>
                </div>
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="headline-card mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="headline-section mb-6">
              This Is For Men Who<span className="text-primary">...</span>
            </h2>
            <div className="divider-gold mb-8" />
            <div className="space-y-4 text-left">
              {[
                "Need the highest level of accountability possible",
                "Want a completely personalized approach",
                "Are ready to invest seriously in their transformation",
                "Need direct access and support throughout the week",
                "Have tried other programs and need something more intensive",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border"
                >
                  <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Complete Breakdown by Category */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              Everything <span className="text-primary">Included</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This is the complete package. No stone unturned. Maximum support for maximum results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedCategories.map((category, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg border ${
                  category.highlight 
                    ? "bg-charcoal border-primary/30 shadow-[0_0_30px_-10px_hsl(43_74%_49%_/_0.2)]" 
                    : "bg-charcoal border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className={`w-8 h-8 ${category.highlight ? "text-primary" : "text-primary"}`} />
                  <h3 className="headline-card text-base">{category.title}</h3>
                </div>
                {category.highlight && (
                  <span className="inline-block text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mb-3 uppercase tracking-wider">
                    Coaching Exclusive
                  </span>
                )}
                <ul className="space-y-2">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="max-w-lg mx-auto bg-background p-8 rounded-lg border border-primary shadow-[0_0_40px_-10px_hsl(43_74%_49%_/_0.3)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/30 rounded-full mb-4">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-xs text-primary uppercase tracking-wider">Premium</span>
            </div>
            <h3 className="headline-card mb-4">1:1 Redemption Coaching</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-display text-primary">$1,250</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Weekly 1:1 calls with Dom
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Direct messaging access
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Custom-built program
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Everything in Transformation included
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                Cancel anytime
              </li>
            </ul>
            <Button variant="gold" size="xl" className="w-full" asChild>
              <Link to="/checkout?plan=coaching">Apply Now</Link>
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              Limited spots available
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="section-container text-center">
          <h2 className="headline-section mb-4">
            Ready for <span className="text-primary">Maximum</span> Accountability?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            This is the highest level. Not for everyone. But if you're ready, I'm ready.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="hero" asChild>
              <Link to="/checkout?plan=coaching">Apply for Coaching</Link>
            </Button>
            <Button variant="heroOutline" size="hero" asChild>
              <Link to="/book-call">Book a Call First</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Coaching;
