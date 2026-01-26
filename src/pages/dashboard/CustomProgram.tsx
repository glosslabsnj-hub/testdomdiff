import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  ArrowRight, 
  Sparkles,
  MessageCircle,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";

const CustomProgram = () => {
  const { isCoaching, subscription } = useEffectiveSubscription();
  
  // Calculate days since signup
  const daysSinceSignup = subscription?.started_at
    ? Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Your Custom <span className="text-primary">Program</span>
          </h1>
          <p className="text-muted-foreground">
            {isCoaching 
              ? "Your personalized training program designed by Dom, specifically for your goals."
              : "This section is exclusive to Free World coaching clients."}
          </p>
        </div>

        {/* Coming Soon Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Coming Soon
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                Day {daysSinceSignup} of Coaching
              </Badge>
            </div>
            <CardTitle className="text-2xl mt-4">
              Your Custom Program is Being Built
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Dom is personally designing your workout program based on your intake assessment, 
              goals, and current fitness level. This isn't a template—it's a fully customized 
              training plan just for you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-charcoal border border-border">
                <Dumbbell className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Custom Workouts</h4>
                <p className="text-sm text-muted-foreground">
                  Tailored exercises and progressions for your body and goals
                </p>
              </div>
              <div className="p-4 rounded-lg bg-charcoal border border-border">
                <Clock className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Weekly Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Program adjusts based on your weekly check-ins and progress
                </p>
              </div>
              <div className="p-4 rounded-lg bg-charcoal border border-border">
                <Calendar className="w-8 h-8 text-primary mb-2" />
                <h4 className="font-semibold text-foreground mb-1">Periodized Plan</h4>
                <p className="text-sm text-muted-foreground">
                  Strategic phases designed for long-term transformation
                </p>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                What to Do Now
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                While your custom program is being built, you have full access to the 12-week 
                transformation program. Start training there and Dom will transition you to 
                your custom plan once it's ready.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="gold" asChild>
                  <Link to="/dashboard/program">
                    <Calendar className="w-4 h-4 mr-2" />
                    Start 12-Week Program
                  </Link>
                </Button>
                <Button variant="goldOutline" asChild>
                  <Link to="/dashboard/messages">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Dom
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/program"
            className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Your Program
                </h4>
                <p className="text-sm text-muted-foreground">12-week transformation</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
          
          <Link
            to="/dashboard/coaching"
            className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  Coaching Portal
                </h4>
                <p className="text-sm text-muted-foreground">Your 1:1 access with Dom</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomProgram;
