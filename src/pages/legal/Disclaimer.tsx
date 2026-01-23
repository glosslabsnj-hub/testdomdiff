import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Disclaimer = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="pt-32 pb-20 section-container">
      <h1 className="headline-section mb-8">Fitness <span className="text-primary">Disclaimer</span></h1>
      <div className="prose prose-invert max-w-3xl space-y-6 text-muted-foreground">
        <div className="bg-charcoal p-6 rounded-lg border border-primary/30">
          <p className="text-primary font-semibold">IMPORTANT: This is not medical advice.</p>
        </div>
        <p>The content provided through Dom Different programs is for informational and educational purposes only and is not intended as medical advice.</p>
        <h2 className="headline-card text-foreground mt-8">Consult Your Physician</h2>
        <p>Before beginning any exercise or nutrition program, consult with a qualified healthcare provider.</p>
        <h2 className="headline-card text-foreground mt-8">Assumption of Risk</h2>
        <p>Physical exercise involves inherent risks. You assume all risks associated with participation.</p>
        <h2 className="headline-card text-foreground mt-8">Results Not Guaranteed</h2>
        <p>Individual results vary based on effort, consistency, genetics, and other factors.</p>
      </div>
    </section>
    <Footer />
  </div>
);

export default Disclaimer;
