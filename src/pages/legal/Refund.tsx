import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Refund = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <section className="pt-32 pb-20 section-container">
      <h1 className="headline-section mb-8">Refund <span className="text-primary">Policy</span></h1>
      <div className="prose prose-invert max-w-3xl space-y-6 text-muted-foreground">
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <h2 className="headline-card text-foreground mt-8">Solitary Confinement ($19.99/mo)</h2>
        <p>Cancel anytime. No refunds for partial months. Access continues until billing period ends.</p>
        <h2 className="headline-card text-foreground mt-8">General Population ($79/mo)</h2>
        <p>Cancel anytime. No refunds for partial months. Access continues until billing period ends.</p>
        <h2 className="headline-card text-foreground mt-8">Free World 1:1 Coaching ($499/mo)</h2>
        <p>Limited spots. Cancel with 7 days notice before next billing. No partial refunds.</p>
      </div>
    </section>
    <Footer />
  </div>
);

export default Refund;
