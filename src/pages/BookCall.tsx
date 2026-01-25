import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, ArrowRight, Clock, CheckCircle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const BookCall = () => {
  const [calendlyUrl, setCalendlyUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Calendly URL from database
    const loadCalendlyUrl = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "calendly_url")
          .single();
        
        if (data?.value) {
          setCalendlyUrl(data.value);
        }
      } catch (error) {
        console.error("Failed to load Calendly URL:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCalendlyUrl();

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

  const isPlaceholderUrl = !calendlyUrl || calendlyUrl === "https://calendly.com/your-link";

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
              {loading ? (
                <div className="p-12 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : isPlaceholderUrl ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="headline-card mb-4">Booking Coming Soon</h3>
                  <p className="text-muted-foreground mb-6">
                    Our scheduling system is being set up. In the meantime, reach out directly.
                  </p>
                  <Button variant="gold" size="lg" asChild>
                    <a href="mailto:support@domdifferent.com">
                      Email Us
                    </a>
                  </Button>
                </div>
              ) : (
                <div 
                  className="calendly-inline-widget" 
                  data-url={calendlyUrl}
                  style={{ minWidth: "320px", height: "700px" }}
                />
              )}
              
              {/* Fallback if widget doesn't load */}
              <noscript>
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="headline-card mb-4">Schedule Your Call</h3>
                  <p className="text-muted-foreground mb-6">
                    JavaScript is required to display the scheduling widget.
                  </p>
                  <Button variant="gold" size="lg" asChild>
                    <a href={calendlyUrl || "mailto:support@domdifferent.com"} target="_blank" rel="noopener noreferrer">
                      {calendlyUrl ? "Open Scheduler" : "Email Us"}
                    </a>
                  </Button>
                </div>
              </noscript>
            </div>

            {/* What to Expect */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">15 Minutes</h3>
                <p className="text-sm text-muted-foreground">
                  Quick, focused conversation to understand your goals
                </p>
              </div>
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No Pressure</h3>
                <p className="text-sm text-muted-foreground">
                  Honest advice, not a sales pitch
                </p>
              </div>
              <div className="p-6 rounded-lg bg-charcoal border border-border text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Clear Direction</h3>
                <p className="text-sm text-muted-foreground">
                  Leave knowing exactly which path is right for you
                </p>
              </div>
            </div>

            {/* Alternative CTA */}
            <div className="text-center p-8 bg-charcoal rounded-lg border border-primary/30">
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
