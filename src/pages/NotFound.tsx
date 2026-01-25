import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, Dumbbell, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-[0.02] pointer-events-none" />
      
      <div className="max-w-lg w-full text-center relative z-10">
        {/* Cell Block Number */}
        <div className="mb-6">
          <span className="text-8xl md:text-9xl font-bold text-gold/20 select-none">
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 uppercase tracking-wider">
          Cell Not <span className="text-crimson">Found</span>
        </h1>

        {/* Subtext */}
        <p className="text-muted-foreground mb-2">
          Wrong block, inmate. This cell doesn't exist.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          The page you're looking for has been moved or never existed.
        </p>

        {/* Path attempted */}
        <div className="mb-8 p-3 bg-charcoal rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            Attempted path: <span className="text-gold font-mono">{location.pathname}</span>
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
          className="mt-6 text-sm text-muted-foreground hover:text-gold transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Go back
        </button>

        {/* Decorative bars */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-16 bg-gold/10 rounded-full" />
          ))}
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-16 bg-gold/10 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
