import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, ArrowRight, Clock, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// TODO: Replace with your actual Calendly URL when ready
const CALENDLY_URL = "https://calendly.com/your-link";

const BookCall = () => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector(
        'script[src="https://assets.calendly.com/assets/external/widget.js"]'
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-primary uppercase tracking-widest mb-4">Free Consultation</p>
              <h1 className="headline-hero mb-6">
                Book a <span className="text-primary">Call</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Not sure which program is right for you? Let's talk. 
                15 minutes to discuss your goals and find the best path forward.
              </p>
            </div>

            {/* Calendly Widget */}
            <div className="bg-charcoal rounded-xl border border-border overflow-hidden mb-12">
              <div 
                className="calendly-inline-widget" 
                data-url={CALENDLY_URL}
                style={{ minWidth: "320px", height: "700px" }}
              />
              
              {/* Fallback if widget doesn't load */}
              <noscript>
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="headline-card mb-4">Schedule Your Call</h3>
                  <p className="text-muted-foreground mb-6">
                    JavaScript is required to display the scheduling widget.
                  </p>
                  <Button variant="gold" size="lg" asChild>
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                      Open Scheduler
                    </a>
                  </Button>
                </div>
              </noscript>
            </div>

            {/* What to Expect */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">15 Minutes</h3>
                <p className="text-sm text-muted-foreground">
                  Quick, focused conversation to understand your goals
                </p>
              </div>
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No Pressure</h3>
                <p className="text-sm text-muted-foreground">
                  Honest advice, not a sales pitch
                </p>
              </div>
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Clear Direction</h3>
                <p className="text-sm text-muted-foreground">
                  Leave knowing exactly which path is right for you
                </p>
              </div>
            </div>

            {/* Alternative CTA */}
            <div className="text-center p-8 bg-charcoal rounded-lg border border-gold/30">
              <h3 className="headline-card mb-4">Ready to Start Now?</h3>
              <p className="text-muted-foreground mb-6">
                Skip the call and jump straight into the transformation.
              </p>
              <Button variant="gold" size="lg" asChild>
                <Link to="/programs" className="gap-2">
                  View Programs <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookCall;
