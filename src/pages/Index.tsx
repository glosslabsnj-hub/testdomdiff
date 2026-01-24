import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Flame, Cross, Target, BookOpen, Trophy, ArrowRight, ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MerchShowcase from "@/components/MerchShowcase";
import heroImage from "@/assets/hero-image.jpg";
import storyImage from "@/assets/story-image.jpg";
import trainingImage from "@/assets/training-image.jpg";
import faithImage from "@/assets/faith-image.jpg";
import transformationImage from "@/assets/transformation-image.jpg";
const Index = () => {
  const targetAudience = ["You're done making excuses and ready to be held accountable", "You want your faith to be the foundation — not an afterthought", "You need structure that works anywhere, anytime, with minimal equipment", "You're tired of inconsistency and ready for daily discipline", "You want to be part of a brotherhood, not just another gym bro"];
  const howItWorks = [{
    step: "01",
    title: "Booking",
    description: "Choose your cell block and complete processing. No games, no hidden fees.",
    icon: Target
  }, {
    step: "02",
    title: "Intake Processing",
    description: "Complete your intake form so we can assign your personalized program.",
    icon: BookOpen
  }, {
    step: "03",
    title: "Serve Your Time",
    description: "Execute daily. Report weekly. Build the discipline that lasts a lifetime.",
    icon: Flame
  }];
  const programs = [{
    title: "Solitary Confinement",
    price: "$19.99",
    period: "/month",
    description: "The foundation. Strip away distractions. Just the essentials needed to perform.",
    features: ["4 bodyweight workout templates", "Daily discipline routine templates", "Basic nutrition template", "Weekly check-in submissions", "Progress tracking"],
    cta: "Enter Solitary",
    href: "/programs/membership",
    popular: false
  }, {
    title: "General Population",
    price: "$299.99",
    period: "one-time",
    description: "You've earned your place. Connect with peers, get video instruction, and start building your hustle.",
    features: ["Complete 12-week framework", "Weekly video coaching", "Nutrition templates + meal guides", "Faith + mindset lessons", "Skill-building lessons", "Community access"],
    cta: "Join Gen Pop",
    href: "/programs/transformation",
    popular: true
  }, {
    title: "Free World 1:1 Coaching",
    price: "$999.99",
    period: "/month",
    description: "You've done the time. Now live free. Direct access to Dom.",
    features: ["Weekly 1:1 video calls", "Direct messaging access", "Custom-built programming", "Advanced skill-building", "Everything in Gen Pop included"],
    cta: "Apply for Free World",
    href: "/programs/coaching",
    popular: false
  }];
  const testimonials = [{
    name: "Marcus T.",
    transformation: "Lost 47 lbs in 12 weeks",
    quote: "Dom's program gave me the discipline I needed. For the first time, my faith and fitness work together."
  }, {
    name: "James R.",
    transformation: "Built 15 lbs of muscle",
    quote: "The prison-style workouts humbled me. No excuses. Just results. God got the glory."
  }, {
    name: "David M.",
    transformation: "Complete lifestyle change",
    quote: "I came for the body. I stayed for the brotherhood. This is different."
  }];
  const whatIncluded = [
    { item: "Bodyweight workout templates for any environment", tier: "All" },
    { item: "Daily discipline routines (Lights On / Lights Out)", tier: "All" },
    { item: "Weekly accountability check-ins", tier: "All" },
    { item: "Basic nutrition template (one fixed meal plan)", tier: "All" },
    { item: "Progress tracking and compliance metrics", tier: "All" },
    { item: "Faith + mindset lessons with scripture focus", tier: "Gen Pop+" },
    { item: "Goal-based 12-week programming built for you", tier: "Gen Pop+" },
    { item: "Full nutrition plans matched to your TDEE", tier: "Gen Pop+" },
    { item: "Skill-building and hustle training", tier: "Gen Pop+" },
    { item: "Community access (The Yard)", tier: "Gen Pop+" },
    { item: "Direct coaching access and custom elite programming", tier: "Free World" },
    { item: "Weekly 1:1 video calls with Dom", tier: "Free World" },
  ];
  const faqs = [{
    question: "Do I need gym equipment?",
    answer: "No. All programs are designed for bodyweight training with minimal space. Dumbbells and bands are optional additions."
  }, {
    question: "Is this program Christian-only?",
    answer: "This program is built on Christian faith principles. Scripture, prayer, and God-led discipline are core — not optional. If that resonates, you're in the right place."
  }, {
    question: "What's the time commitment?",
    answer: "Workouts are 30-45 minutes. Daily discipline routines take 15-30 minutes. Weekly check-ins take 10 minutes. If you can't find that time, we need to talk about priorities."
  }, {
    question: "Can I cancel my membership?",
    answer: "Yes. Cancel anytime. But if you quit, you're only cheating yourself. We don't do refunds on lack of discipline."
  }, {
    question: "What makes this different from other programs?",
    answer: "Faith is the foundation, not an add-on. Prison-style discipline means no excuses. Templates mean you own your journey. And brotherhood means you're never alone."
  }];
  return <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden hero-glow">
        {/* Background Image with enhanced overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Discipline training" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>

        {/* Texture Overlay */}
        <div className="texture-overlay" />

        {/* Vignette effect */}
        <div className="absolute inset-0 vignette pointer-events-none z-[1]" />

        {/* Content */}
        <div className="relative z-10 section-container text-center py-20">
          <div className="max-w-4xl mx-auto">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8 animate-fade-in backdrop-blur-sm">
              <Cross className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Men Only • Faith First</span>
            </div>

            <h1 className="headline-hero mb-6 animate-fade-in">
              From Locked Up<br />
              <span className="text-primary drop-shadow-[0_0_40px_hsl(28_90%_48%_/_0.6)]">to Locked In.</span>
            </h1>
            <p className="text-base md:text-lg text-primary/80 italic mb-4 animate-fade-in delay-100 max-w-2xl mx-auto">
              "I can do all things through Christ who strengthens me." — Philippians 4:13
            </p>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-slide-up opacity-0 delay-200 mx-[35px]">
              Men-only. Faith-first. Prison-proof discipline meets divine purpose. 
              Transform your body. Renew your mind. Redeem your life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up opacity-0 delay-300">
            <Button variant="hero" size="hero" asChild className="glow-gold animate-glow-pulse">
                <Link to="/programs/transformation">
                  <span className="hidden sm:inline">Join General Population</span>
                  <span className="sm:hidden">Join Gen Pop</span>
                </Link>
              </Button>
              <Button variant="heroOutline" size="hero" asChild>
                <Link to="/programs/membership">
                  Enter Solitary
                </Link>
              </Button>
            </div>
            <Link to="/programs/coaching" className="inline-flex items-center gap-2 mt-6 text-muted-foreground hover:text-primary transition-colors animate-slide-up opacity-0 delay-400">
              Ready for the Free World? <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-primary/70" />
          </div>
        </div>
      </section>

      {/* This Is For Men Who Section */}
      <section className="py-20 md:py-32 bg-charcoal section-ambient">
        <div className="section-container relative z-10">
          <div className="text-center mb-12">
            <h2 className="headline-section mb-4">
              This Is For Men Who<span className="text-primary">...</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {targetAudience.map((item, index) => <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border border-border hover:border-primary/50 transition-colors card-glow">
                <Cross className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-lg">{item}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Dom's Story Section */}
      <section className="py-20 md:py-32 bg-background relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="texture-overlay" />
        
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src={storyImage} alt="Dom's transformation" className="relative rounded-lg w-full aspect-square object-cover border border-border" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent rounded-lg" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-full">
                  <Cross className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">Forged Through Fire</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="headline-section mb-6">
                The <span className="text-primary">Dom Different</span> Story
              </h2>
              <div className="space-y-6 text-muted-foreground">
                <div className="border-l-4 border-primary pl-4 bg-charcoal/50 py-3 pr-3 rounded-r-lg">
                  <p className="text-sm text-primary uppercase tracking-wider mb-1 font-bold">The Wrong Path</p>
                  <p>High school brought the wrong crowd. Bad choices followed. Shortly after, Dom found himself behind bars — two years as a convicted felon.</p>
                </div>
                <div className="border-l-4 border-primary pl-4 bg-charcoal/50 py-3 pr-3 rounded-r-lg">
                  <p className="text-sm text-primary uppercase tracking-wider mb-1 font-bold">The Transformation</p>
                  <p>What was meant to break him built him. Faith, discipline, and relentless personal growth — forged in a cell, perfected through purpose.</p>
                </div>
                <div className="border-l-4 border-primary pl-4 bg-charcoal/50 py-3 pr-3 rounded-r-lg">
                  <p className="text-sm text-primary uppercase tracking-wider mb-1 font-bold">The Mission</p>
                  <p>Now helping men break their own chains. Same prison-proof discipline. Same faith-first approach. Different results for every man who commits.</p>
                </div>
              </div>
              <Button variant="goldOutline" size="lg" className="mt-8" asChild>
                <Link to="/about">Read the Full Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              The <span className="text-primary">Processing</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => <div key={index} className="relative p-8 rounded-lg bg-background border border-border hover:border-primary/50 transition-all group">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary rounded-lg flex items-center justify-center font-display text-xl text-primary-foreground shadow-lg">
                  {step.step}
                </div>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 mt-4 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="headline-card mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 md:py-32 bg-background relative section-ambient">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/8 via-crimson/3 to-transparent" />
        
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              Pick Your <span className="text-primary">Block</span>
            </h2>
            <div className="divider-gold mb-6" />
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three cell blocks. Same God-led discipline. Different levels of access.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {programs.map((program, index) => <div key={index} className={`relative p-8 rounded-lg border transition-all hover:scale-[1.02] ${program.popular ? "bg-charcoal border-primary glow-dual" : "bg-charcoal border-border hover:border-primary/50"}`}>
                {program.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary via-gold-light to-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                    Most Popular
                  </div>}
                <h3 className="headline-card mb-2">{program.title}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-display text-primary drop-shadow-[0_0_15px_hsl(28_90%_48%_/_0.4)]">{program.price}</span>
                  <span className="text-muted-foreground">{program.period}</span>
                </div>
                <p className="text-muted-foreground mb-6">{program.description}</p>
                <ul className="space-y-3 mb-8">
                  {program.features.map((feature, idx) => <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>)}
                </ul>
                <Button variant={program.popular ? "gold" : "goldOutline"} size="lg" className="w-full" asChild>
                  <Link to={program.href}>{program.cta}</Link>
                </Button>
              </div>)}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 md:py-32 bg-charcoal relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[100px] rounded-full" />
        
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              Real Men. <span className="text-primary">Real Results.</span>
            </h2>
            <div className="divider-gold" />
          </div>

          {/* Transformation Image */}
          <div className="relative mb-16 max-w-4xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative">
              <img src={transformationImage} alt="Transformation results" className="w-full rounded-lg border border-border" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/70 rounded-lg" />
              <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded border border-primary/30">
                <p className="text-sm text-primary uppercase tracking-wider font-bold">Before → After</p>
                <p className="text-xs text-muted-foreground">Results vary. Dedication required.</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <div key={index} className="p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-all group">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-primary">{testimonial.transformation}</span>
                </div>
                <p className="text-muted-foreground mb-4 italic leading-relaxed">"{testimonial.quote}"</p>
                <p className="font-bold text-foreground">— {testimonial.name}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 md:py-32 bg-background relative overflow-hidden">
        <div className="texture-overlay" />
        
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="headline-section mb-6">
                What's <span className="text-primary">Included</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Every program is built on proven templates — frameworks you fill with your own
                discipline. No fluff. No filler. Just the structure you need.
              </p>
              <ul className="space-y-3">
                {whatIncluded.map((entry, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-charcoal/50 border border-transparent hover:border-primary/30 transition-colors">
                    <div className="p-1 rounded-full bg-primary/20 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span>{entry.item}</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        entry.tier === "All" 
                          ? "bg-primary/20 text-primary" 
                          : entry.tier === "Gen Pop+" 
                            ? "bg-blue-500/20 text-blue-400" 
                            : "bg-purple-500/20 text-purple-400"
                      }`}>
                        {entry.tier}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-primary/10 to-primary/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src={trainingImage} alt="Training intensity" className="relative rounded-lg w-full aspect-square object-cover border border-border" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-charcoal">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="headline-section mb-4">
              Common <span className="text-primary">Questions</span>
            </h2>
            <div className="divider-gold" />
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => <details key={index} className="group p-6 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-muted-foreground">{faq.answer}</p>
              </details>)}
          </div>
        </div>
      </section>

      {/* Merch Showcase Section */}
      <MerchShowcase />

      {/* Final CTA Section */}
      <section className="py-24 md:py-40 bg-background relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={faithImage} alt="Faith and discipline" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        </div>
        <div className="texture-overlay" />
        <div className="absolute inset-0 vignette pointer-events-none" />
        
        <div className="section-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-8">
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Your Time Is Now</span>
          </div>
          
          <h2 className="headline-hero mb-6">
            Built Different.<br />
            <span className="text-primary drop-shadow-[0_0_40px_hsl(43_74%_49%_/_0.5)]">Led by God.</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop waiting. Start building. Your transformation begins with one decision.
          </p>
          <Button variant="hero" size="hero" asChild className="glow-gold">
            <Link to="/programs/transformation">
              Start Your Transformation Now
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;