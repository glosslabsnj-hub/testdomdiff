import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cross, Target, Heart, Users, Flame, Shield, BookOpen, Quote } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import storyImage from "@/assets/story-image.jpg";
import faithImage from "@/assets/faith-image.jpg";
import trainingImage from "@/assets/training-image.jpg";
import domPrisonImage from "@/assets/dom-prison-cropped.jpg";

const About = () => {
  const timeline = [
    {
      year: "The Wrong Path",
      title: "Running with the Wrong Crowd",
      description: "In high school, the temptations were everywhere. Wrong friends. Wrong choices. Wrong direction. Every decision led further from purpose and deeper into darkness.",
    },
    {
      year: "The Fall",
      title: "Consequences Caught Up",
      description: "Shortly after high school, the lifestyle caught up. Bad decisions have a way of demanding payment. Dom found himself behind bars — a convicted felon facing two years of incarceration. The world as he knew it was gone.",
    },
    {
      year: "The Transformation",
      title: "Finding God Behind Bars",
      description: "What was meant to break him became what built him. In the confines of a cell, Dom found something the streets never offered: faith, discipline, and a relentless commitment to personal growth. Every day became a chance to get stronger — body, mind, and spirit.",
    },
    {
      year: "The Mission",
      title: "From Inmate to Inspiration",
      description: "The discipline forged on the inside became the foundation for success on the outside. Now, Dom takes what he learned in the hardest classroom on earth and uses it to help others break their own chains — physical, mental, and spiritual.",
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
      description: "Iron sharpens iron. We check in. We call each other out. We don't let anyone slip.",
    },
    {
      icon: Users,
      title: "Community",
      description: "This isn't a solo journey. We rise together, struggle together, and celebrate together.",
    },
  ];

  const beliefs = [
    "Discipline is a form of worship — your body is a temple, treat it like one",
    "God doesn't call the equipped, He equips the called",
    "Your past doesn't define you, but your decisions from today forward do",
    "Real transformation happens inside out — spirit, then body",
    "Excuses are lies we tell ourselves to stay comfortable",
    "Community and accountability are non-negotiable",
    "Every person has a purpose — fitness is the vehicle, not the destination",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal relative overflow-hidden">
        <div className="texture-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="section-container relative z-10">
          <div className="max-w-3xl">
            <p className="text-primary uppercase tracking-widest mb-4 font-semibold">About Dom Different</p>
            <h1 className="headline-hero mb-6">
              From <span className="text-primary">Locked Up</span><br />
              to Locking Others In
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              This isn't just a fitness brand. It's a redemption story. A movement born in a prison cell,
              forged through faith, and now dedicated to helping people break free from whatever holds them back.
            </p>
          </div>
        </div>
      </section>

      {/* The Real Story Section */}
      <section className="py-20 md:py-32 bg-background relative">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="order-2 lg:order-1">
              <h2 className="headline-section mb-6">
                The <span className="text-primary">Real Story</span>
              </h2>
              <div className="space-y-6">
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                  <p className="text-lg text-muted-foreground pl-6 italic border-l-4 border-primary">
                    "I spent two years locked in a cell. But those bars didn't trap me — they set me free."
                  </p>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Dom wasn't always the man you see today. In high school, he fell in with the wrong crowd. 
                  The parties, the streets, the lifestyle that promised everything but delivered nothing but destruction. 
                  One bad decision followed another, and shortly after graduation, the consequences came calling.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="text-foreground font-semibold">Two years as a convicted felon.</span> That's what 
                  following the wrong path cost him. The cell door clanged shut, and everything he thought he knew 
                  about himself shattered.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  But what was meant to break him became the crucible that forged him. Behind those walls, Dom found 
                  something the streets never offered: <span className="text-primary font-semibold">God, discipline, 
                  and an unshakeable commitment to becoming a different man.</span>
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={storyImage}
                alt="Dom's transformation journey"
                loading="lazy"
                className="relative rounded-lg w-full aspect-[4/5] object-cover border border-border shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full backdrop-blur-sm">
                  <Cross className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Redeemed by Grace</span>
                </div>
              </div>
            </div>
          </div>

          {/* The Transformation */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-charcoal rounded-lg p-8 border border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <h3 className="headline-card text-center mb-6 relative z-10">
                What Happened Behind Bars
              </h3>
              
              {/* Prison Photo - The Real Deal */}
              <div className="mb-8 flex justify-center relative z-10">
                <div className="relative group max-w-xs">
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-primary/10 rounded-lg blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={domPrisonImage}
                    alt="Dom during his incarceration - where the transformation began"
                    loading="lazy"
                    className="relative rounded-lg w-full aspect-[3/4] object-cover object-top border-2 border-primary/50 shadow-2xl"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-charcoal via-charcoal/90 to-transparent rounded-b-lg">
                    <p className="text-xs text-primary font-semibold uppercase tracking-wider text-center">
                      The Cell Block, 2021
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Where discipline was forged
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative z-10">
                <div className="text-center p-4 rounded-lg bg-background/50 border border-border">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <Cross className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Found Faith</h4>
                  <p className="text-sm text-muted-foreground">
                    The cell became a chapel. Every morning started with Scripture. Every night ended with prayer.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50 border border-border">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Built Discipline</h4>
                  <p className="text-sm text-muted-foreground">
                    No gym? No problem. Bodyweight workouts, prison-style conditioning, relentless daily consistency.
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-background/50 border border-border">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Grew Personally</h4>
                  <p className="text-sm text-muted-foreground">
                    Every book, every mentor, every moment of reflection became fuel for becoming a new person.
                  </p>
                </div>
              </div>
              <p className="text-center text-muted-foreground mt-6 relative z-10">
                The faith and discipline he cultivated during those two years gave him everything he needed to 
                succeed — <span className="text-primary font-semibold">on the inside and out.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              The <span className="text-primary">Journey</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="max-w-3xl mx-auto space-y-8">
            {timeline.map((item, index) => (
              <div
                key={index}
                className="relative pl-8 border-l-2 border-primary/30 hover:border-primary transition-colors"
              >
                <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full" />
                <p className="text-sm text-primary uppercase tracking-wider mb-1 font-bold">{item.year}</p>
                <h3 className="headline-card mb-2">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 md:py-32 bg-background relative">
        <div className="texture-overlay" />
        <div className="section-container relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="headline-section mb-6">
              The <span className="text-primary">Mission</span>
            </h2>
            <div className="divider-gold mb-8" />
            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              To take the same discipline that was forged behind bars and use it to set others free.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Free from excuses. Free from weakness. Free from the chains of their past. 
              We don't just build muscle — <span className="text-primary font-semibold">we build people of God.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-charcoal rounded-full border border-border">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm">Purpose-Driven</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-charcoal rounded-full border border-border">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm">Faith-Centered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-charcoal rounded-full border border-border">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm">Discipline-Forged</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-32 bg-charcoal">
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
                className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="headline-card mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faith + Discipline Section */}
      <section className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={faithImage}
            alt="Faith and discipline"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background" />
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
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We don't just work out — we worship. Every rep is an offering. Every set 
                is a sacrifice. We're not building bodies for vanity. We're building temples 
                for the Holy Spirit.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is where prison-proof discipline meets divine purpose. Where grit 
                meets grace. Where transformation happens from the inside out.
              </p>
              <div className="mt-8 p-4 rounded-lg bg-charcoal border border-primary/30">
                <p className="text-primary italic text-center">
                  "Do you not know that your bodies are temples of the Holy Spirit?" — 1 Corinthians 6:19
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={trainingImage}
                alt="Training with faith"
                loading="lazy"
                className="rounded-lg w-full aspect-square object-cover border border-border"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* What I Believe Section */}
      <section className="py-20 md:py-32 bg-charcoal">
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
                  className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
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
      <section className="py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="section-container text-center relative z-10">
          <h2 className="headline-section mb-6">
            Ready to Get <span className="text-primary">Locked In</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-lg">
            Your past doesn't define you. Your next decision does. Make it count.
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
