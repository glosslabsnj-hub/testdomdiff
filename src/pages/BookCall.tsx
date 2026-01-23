import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BookCall = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="pt-32 pb-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-primary uppercase tracking-widest mb-4">Free Consultation</p>
              <h1 className="headline-hero mb-6">
                Book a <span className="text-primary">Call</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Not sure which program is right for you? Let's talk. 
                15 minutes to discuss your goals and find the best path forward.
              </p>
            </div>

            {/* Calendly Placeholder */}
            <div className="bg-charcoal p-12 rounded-lg border border-border text-center mb-12">
              <Calendar className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="headline-card mb-4">Calendly Integration</h3>
              <p className="text-muted-foreground mb-6">
                Calendly scheduling widget will be embedded here.
              </p>
              <div className="p-6 bg-background rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Replace this section with your Calendly embed code:
                </p>
                <code className="text-xs text-primary mt-2 block">
                  {`<div class="calendly-inline-widget" data-url="YOUR_CALENDLY_URL"></div>`}
                </code>
              </div>
            </div>

            {/* What to Expect */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="p-6 rounded-lg bg-charcoal border border-border">
                <Phone className="w-10 h-10 text-primary mb-4" />
                <h3 className="headline-card mb-2">15-Minute Call</h3>
                <p className="text-muted-foreground">
                  Quick, focused conversation to understand your goals and 
                  determine the best program for your situation.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-charcoal border border-border">
                <Calendar className="w-10 h-10 text-primary mb-4" />
                <h3 className="headline-card mb-2">No Obligation</h3>
                <p className="text-muted-foreground">
                  This is a consultation, not a sales pitch. We'll give you 
                  honest advice about whether this is right for you.
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
