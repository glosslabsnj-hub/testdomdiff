import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Target, MessageSquare, Phone, Calendar, Shield, Crown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import coachingImage from "@/assets/coaching-image.jpg";

const Coaching = () => {
  const included = [
    "Personalized program built for your goals",
    "Weekly 1:1 coaching calls with Dom",
    "Direct messaging access",
    "Unlimited check-ins",
    "Priority support",
    "Custom nutrition guidance",
    "All membership benefits included",
    "Personal accountability partner",
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

      {/* Features */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              What Makes This <span className="text-primary">Different</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all"
              >
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

      {/* What's Included */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="headline-section mb-6">
                Everything <span className="text-primary">Included</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                This is the complete package. No stone unturned. Maximum support for maximum results.
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal">
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
