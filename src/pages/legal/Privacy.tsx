import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="pt-32 pb-20 section-container">
      <h1 className="headline-section mb-8">Privacy <span className="text-primary">Policy</span></h1>
      <div className="prose prose-invert max-w-3xl">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="space-y-6 text-muted-foreground">
          <p>This privacy policy explains how we collect, use, and protect your information. Template — consult legal counsel.</p>
          <h2 className="headline-card text-foreground mt-8">Information We Collect</h2>
          <p>Name, email, phone, physical stats, training history, and payment information.</p>
          <h2 className="headline-card text-foreground mt-8">How We Use Information</h2>
          <p>To provide coaching services, process payments, and communicate program updates.</p>
          <h2 className="headline-card text-foreground mt-8">Data Protection</h2>
          <p>We use industry-standard security measures to protect your data.</p>
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Privacy;
