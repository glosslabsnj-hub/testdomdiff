import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cross, Target, Heart, Users, Flame, Shield, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import storyImage from "@/assets/story-image.jpg";
import faithImage from "@/assets/faith-image.jpg";
import trainingImage from "@/assets/training-image.jpg";

const About = () => {
  const timeline = [
    {
      year: "Before",
      title: "Lost in the World",
      description: "Undisciplined. Unfocused. Running from purpose and making every excuse. The body was weak because the spirit was weaker.",
    },
    {
      year: "Rock Bottom",
      title: "The Breaking Point",
      description: "When everything else failed, God didn't. The cell became a chapel. The yard became a gym. Discipline became salvation.",
    },
    {
      year: "Transformation",
      title: "Forged in Faith",
      description: "Every rep became a prayer. Every meal became an act of worship. The body rebuilt as the spirit renewed.",
    },
    {
      year: "Now",
      title: "Called to Lead",
      description: "Using the same prison-proof discipline to help other men find their identity in Christ and build the bodies they were designed to have.",
    },
  ];

  const values = [
    {
      icon: Cross,
      title: "Faith First",
      description: "Every workout, every meal, every decision flows from our identity in Christ. This isn't optional — it's foundational.",
    },
    {
      icon: Flame,
      title: "Relentless Discipline",
      description: "Consistency beats intensity. Show up daily. Execute the plan. No excuses. No shortcuts. No quitting.",
    },
    {
      icon: Shield,
      title: "Accountability",
      description: "Iron sharpens iron. We check in. We call each other out. We don't let brothers slip.",
    },
    {
      icon: Users,
      title: "Brotherhood",
      description: "This isn't a solo journey. We rise together, struggle together, and celebrate together.",
    },
  ];

  const beliefs = [
    "Discipline is a form of worship — your body is a temple, treat it like one",
    "God doesn't call the equipped, He equips the called",
    "Your past doesn't define you, but your decisions from today forward do",
    "Real transformation happens inside out — spirit, then body",
    "Excuses are lies we tell ourselves to stay comfortable",
    "Brotherhood and accountability are non-negotiable",
    "Every man has a purpose — fitness is the vehicle, not the destination",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary uppercase tracking-widest mb-4">About Dom Different</p>
            <h1 className="headline-hero mb-6">
              From Bondage to <span className="text-primary">Brotherhood</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              This isn't just a fitness brand. It's a movement. A calling. A way of life 
              built on the foundation of faith and forged through relentless discipline.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="sticky top-24">
              <img
                src={storyImage}
                alt="Dom's journey"
                className="rounded-lg w-full aspect-[3/4] object-cover"
              />
            </div>
            <div className="space-y-8">
              <h2 className="headline-section mb-8">
                The <span className="text-primary">Journey</span>
              </h2>
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-8 border-l-2 border-primary/30 hover:border-primary transition-colors"
                >
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                  <p className="text-sm text-primary uppercase tracking-wider mb-1">{item.year}</p>
                  <h3 className="headline-card mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="headline-section mb-6">
              The <span className="text-primary">Mission</span>
            </h2>
            <div className="divider-gold mb-8" />
            <p className="text-xl text-muted-foreground mb-8">
              To help men discover who God made them to be — strong in spirit, 
              disciplined in body, and unwavering in purpose. We don't just build muscle. 
              We build men.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm">Purpose-Driven</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm">Faith-Centered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm">Discipline-Forged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              Core <span className="text-primary">Values</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-all text-center"
              >
                <value.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="headline-card mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faith + Discipline Section */}
      <section className="py-20 md:py-32 bg-charcoal relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={faithImage}
            alt="Faith and discipline"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/95 to-charcoal" />
        </div>
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="headline-section mb-6">
                Faith <span className="text-primary">+</span> Discipline
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Most fitness programs treat faith as an afterthought. Here, it's the engine.
              </p>
              <p className="text-muted-foreground mb-6">
                We don't just work out — we worship. Every rep is an offering. Every set 
                is a sacrifice. We're not building bodies for vanity. We're building temples 
                for the Holy Spirit.
              </p>
              <p className="text-muted-foreground">
                This is where prison-proof discipline meets divine purpose. Where grit 
                meets grace. Where transformation happens from the inside out.
              </p>
            </div>
            <div className="relative">
              <img
                src={trainingImage}
                alt="Training with faith"
                className="rounded-lg w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* What I Believe Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="headline-section mb-4">
                What I <span className="text-primary">Believe</span>
              </h2>
              <div className="divider-gold" />
            </div>
            <div className="space-y-4">
              {beliefs.map((belief, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-charcoal border border-border hover:border-primary/50 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>{belief}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charcoal">
        <div className="section-container text-center">
          <h2 className="headline-section mb-6">
            Ready to Build <span className="text-primary">Different</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Your transformation starts with a decision. Not tomorrow. Today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="hero" asChild>
              <Link to="/programs">View Programs</Link>
            </Button>
            <Button variant="heroOutline" size="hero" asChild>
              <Link to="/book-call">Book a Call</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
