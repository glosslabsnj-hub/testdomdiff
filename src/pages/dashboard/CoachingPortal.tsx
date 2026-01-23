import { Link } from "react-router-dom";
import { 
  Crown, 
  Video, 
  MessageCircle, 
  FileText, 
  Calendar, 
  ArrowLeft,
  Star 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardHeader from "@/components/DashboardHeader";

const CoachingPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="section-container py-12">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          
          {/* Premium Header */}
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="headline-section">
              <span className="text-primary">1:1 Coaching</span> Portal
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your exclusive access to direct coaching with Dom. Maximum accountability.
          </p>
        </div>

        {/* Premium Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <Video className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Weekly 1:1 Calls</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Private video calls with Dom every week. Strategy, accountability, and personalized guidance.
            </p>
            <Button variant="gold" asChild>
              <Link to="/book-call">Schedule Your Call</Link>
            </Button>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <MessageCircle className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Direct Messaging</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Direct access to Dom via text/voice messaging. Get answers when you need them.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Access via your preferred platform</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <FileText className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Custom Programming</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Personalized workout and nutrition plans built specifically for your goals and situation.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">Updated based on your progress</p>
            </div>
          </div>

          <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
            <Calendar className="w-10 h-10 text-primary mb-4" />
            <h3 className="headline-card mb-2">Priority Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Skip the line. Get priority responses and emergency call access when needed.
            </p>
            <div className="p-4 bg-background/50 rounded border border-border text-center">
              <p className="text-xs text-muted-foreground">24-48 hour response guarantee</p>
            </div>
          </div>
        </div>

        {/* Coaching Notes Section */}
        <div className="p-8 bg-charcoal rounded-lg border border-border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Star className="w-6 h-6 text-primary" />
            <h3 className="headline-card">Your Coaching Notes</h3>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Notes and action items from your coaching sessions will appear here.
          </p>
          <div className="p-6 bg-background/50 rounded border border-dashed border-border text-center">
            <p className="text-sm text-muted-foreground">No coaching notes yet. Schedule your first call to get started.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-8 bg-charcoal rounded-lg border border-primary/30">
          <h3 className="headline-card mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="gold" asChild>
              <Link to="/book-call">Book Coaching Call</Link>
            </Button>
            <Button variant="goldOutline" asChild>
              <Link to="/dashboard/check-in">Submit Check-In</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoachingPortal;
