import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, MessageSquare, Trophy, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import SolitaryUpgradeModal from "@/components/SolitaryUpgradeModal";

const Community = () => {
  const { subscription } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const isMembership = subscription?.plan_type === "membership";
  
  // Solitary (membership) users see modal and redirect on close
  useEffect(() => {
    if (isMembership) {
      setShowModal(true);
    }
  }, [isMembership]);

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      navigate("/dashboard");
    }
  };

  if (isMembership) {
    return (
      <SolitaryUpgradeModal
        open={showModal}
        onOpenChange={handleModalClose}
        feature="The Yard (Community)"
      />
    );
  }
  
  const isCoaching = subscription?.plan_type === "coaching";
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="section-container py-12">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cell Block
          </Link>
          <h1 className="headline-section mb-2">
            <span className="text-primary">{isCoaching ? "The Network" : "The Yard"}</span> — Brotherhood
          </h1>
          <p className="text-muted-foreground">
            {isCoaching 
              ? "Connect with fellow free men. Build lasting relationships on the outside."
              : "Connect with fellow inmates. Iron sharpens iron in the yard."}
          </p>
        </div>

        {/* Community Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-charcoal border border-border">
            <MessageSquare className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Discussion Forums</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share experiences, ask questions, and connect with other men on the same journey.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-charcoal border border-border">
            <Trophy className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Accountability Groups</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join small groups of 4-6 men for weekly check-ins and mutual accountability.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-charcoal border border-border">
            <Calendar className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Live Group Sessions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Weekly live calls with Dom and the community. Q&A, teaching, and brotherhood.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-charcoal border border-border">
            <Users className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Member Directory</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find and connect with other members in your area or with similar goals.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="p-8 bg-charcoal rounded-lg border border-primary/30">
          <h3 className="headline-card mb-4 text-primary">Community Guidelines</h3>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">1.</span>
              <span>Respect every man's journey. We're all at different stages.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">2.</span>
              <span>What's shared here stays here. Confidentiality is sacred.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">3.</span>
              <span>Encourage, don't criticize. Build each other up.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold">4.</span>
              <span>Stay on mission. This is about faith, fitness, and discipline.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Community;
