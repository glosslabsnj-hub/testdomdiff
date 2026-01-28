import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Cross, Shield, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import CartButton from "@/components/shop/CartButton";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const handleLogout = async () => {
    await signOut();
  };
  // Base nav links (always shown)
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/programs", label: "Programs" },
    { href: "/shop", label: "Commissary", icon: Package },
    { href: "/book-call", label: "Book a Call" },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Cross className="w-6 h-6 text-primary" />
            <span className="font-display text-xl md:text-2xl tracking-wider">
              DOM <span className="text-primary">DIFFERENT</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <CartButton />
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                  isActive("/admin")
                    ? "text-gold"
                    : "text-muted-foreground hover:text-gold"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Button variant="gold" size="default" asChild>
                  <Link to="/dashboard">My Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-crimson hover:text-crimson hover:bg-crimson/10"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="default" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="gold" size="default" asChild>
                  <Link to="/checkout">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile: Cart + Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <CartButton />
            <button
              className="text-foreground p-3 -mr-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-t border-border animate-slide-up">
          <nav className="section-container py-6 flex flex-col gap-4">
            
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 text-lg font-semibold uppercase tracking-wider py-2 ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-foreground/70"
                }`}
              >
                {link.icon && <link.icon className="w-5 h-5" />}
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-2 text-lg font-semibold uppercase tracking-wider py-2 ${
                  isActive("/admin")
                    ? "text-gold"
                    : "text-muted-foreground"
                }`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Button variant="gold" size="lg" className="mt-4" asChild>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    My Dashboard
                  </Link>
                </Button>
                <Button
                  variant="crimson"
                  size="lg"
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="lg" className="mt-4" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="gold" size="lg" asChild>
                  <Link to="/checkout" onClick={() => setIsOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
