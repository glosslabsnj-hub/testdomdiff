import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="pt-32 pb-20 section-container">
      <h1 className="headline-section mb-8">Terms of <span className="text-primary">Service</span></h1>
      <div className="prose prose-invert max-w-3xl">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-muted-foreground">
          <p>By accessing Dom Different programs, you agree to these terms. This is a template — consult legal counsel for final terms.</p>
          <h2 className="headline-card text-foreground mt-8">1. Program Access</h2>
          <p>Access is granted upon completed payment and intake form submission. Sharing credentials is prohibited.</p>
          <h2 className="headline-card text-foreground mt-8">2. Payment Terms</h2>
          <p>Solitary Confinement: $49.99/month recurring. General Population: $379.99 one-time. Free World Coaching: $999.99/month recurring (limited to 10 clients).</p>
          <h2 className="headline-card text-foreground mt-8">3. User Conduct</h2>
          <p>Users must engage respectfully with the community and coaching staff.</p>
          <h2 className="headline-card text-foreground mt-8">4. Intellectual Property</h2>
          <p>All program content is proprietary. Reproduction or distribution is prohibited.</p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Terms;
