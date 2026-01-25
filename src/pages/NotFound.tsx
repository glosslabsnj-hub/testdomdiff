import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, Dumbbell, ArrowLeft } from "lucide-react";
import CrossLoader from "@/components/CrossLoader";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Motivational quotes for the 404 page
  const quotes = [
    { text: "Though I walk through the valley of the shadow of death, I will fear no evil.", reference: "Psalm 23:4" },
    { text: "For I know the plans I have for you, plans to prosper you and not to harm you.", reference: "Jeremiah 29:11" },
    { text: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", reference: "Joshua 1:9" },
    { text: "The Lord is my light and my salvation — whom shall I fear?", reference: "Psalm 27:1" },
    { text: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { text: "No weapon formed against you shall prosper.", reference: "Isaiah 54:17" },
    { text: "When you pass through the waters, I will be with you.", reference: "Isaiah 43:2" },
    { text: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29" },
    { text: "The righteous may fall seven times, but they rise again.", reference: "Proverbs 24:16" },
    { text: "God is our refuge and strength, an ever-present help in trouble.", reference: "Psalm 46:1" },
    { text: "Do not be overcome by evil, but overcome evil with good.", reference: "Romans 12:21" },
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-[0.02] pointer-events-none" />
      
      {/* Ambient gold glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-lg w-full text-center relative z-10">
        {/* Gold Cross Loader */}
        <div className="mb-8 flex justify-center">
          <CrossLoader size="xl" />
        </div>

        {/* Cell Block Number */}
        <div className="mb-4">
          <span className="text-7xl md:text-8xl font-display font-bold text-primary/30 select-none tracking-wider">
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3 uppercase tracking-wider">
          Lost on the <span className="text-primary">Path</span>
        </h1>

        {/* Motivational message */}
        <p className="text-muted-foreground mb-2 leading-relaxed">
          This page doesn't exist, but your journey does.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-6">
          Every setback is a setup for a comeback.
        </p>

        {/* Scripture quote */}
        <div className="mb-8 p-4 bg-charcoal rounded-lg border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="text-foreground italic text-sm leading-relaxed mb-2">
            "{randomQuote.text}"
          </p>
          <p className="text-xs text-primary font-medium">
            — {randomQuote.reference}
          </p>
        </div>

        {/* Path attempted */}
        <div className="mb-8 p-3 bg-charcoal-dark rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            Attempted path: <span className="text-primary font-mono">{location.pathname}</span>
          </p>
        </div>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="gold"
            size="lg"
            asChild
            className="gap-2"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="gap-2"
          >
            <Link to="/dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            asChild
            className="gap-2"
          >
            <Link to="/programs">
              <Dumbbell className="w-4 h-4" />
              Programs
            </Link>
          </Button>
        </div>

        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mt-6 text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Go back
        </button>

        {/* Decorative iron bars */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 h-12 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" 
            />
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-1 h-12 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent rounded-full" 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
