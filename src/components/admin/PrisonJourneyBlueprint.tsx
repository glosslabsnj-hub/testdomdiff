import { useState } from "react";
import { 
  Map, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Star,
  Zap,
  Crown,
  Lock,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  timeframe: string;
  isComplete?: boolean;
  isCritical?: boolean;
}

interface TierJourney {
  tier: string;
  tierLabel: string;
  description: string;
  color: string;
  steps: JourneyStep[];
}

const tierJourneys: TierJourney[] = [
  {
    tier: "membership",
    tierLabel: "Solitary Confinement",
    description: "Self-discipline foundation with bodyweight training",
    color: "border-muted-foreground/50",
    steps: [
      { id: "s1", title: "Purchase Solitary", description: "User selects $49.99/mo plan", timeframe: "0 min", isCritical: true },
      { id: "s2", title: "Signup & Email Confirm", description: "Auto-confirm enabled for speed", timeframe: "1 min" },
      { id: "s3", title: "4-Step Intake", description: "Goal, experience, injuries, commitment", timeframe: "3 min", isCritical: true },
      { id: "s4", title: "Intake Confirmation", description: "Shows what's unlocked, CTA to dashboard", timeframe: "0.5 min" },
      { id: "s5", title: "First Dashboard Visit", description: "Orientation modal auto-opens", timeframe: "0.5 min" },
      { id: "s6", title: "Watch Walkthrough", description: "Solitary-specific onboarding video", timeframe: "2 min", isCritical: true },
      { id: "s7", title: "Complete Orientation Checklist", description: "Watch video, set routines, first workout", timeframe: "30 min" },
      { id: "s8", title: "First Yard Time Workout", description: "Complete a bodyweight template", timeframe: "45 min", isCritical: true },
      { id: "s9", title: "First Roll Call (Week 1)", description: "Submit weekly accountability check-in", timeframe: "5 min" },
      { id: "s10", title: "Upgrade Prompt", description: "Locked tiles show Gen Pop benefits", timeframe: "Ongoing" },
    ],
  },
  {
    tier: "transformation",
    tierLabel: "General Population",
    description: "12-week structured transformation with community",
    color: "border-primary/50",
    steps: [
      { id: "g1", title: "Purchase Gen Pop", description: "User selects $379.99 one-time", timeframe: "0 min", isCritical: true },
      { id: "g2", title: "Signup & Email Confirm", description: "Auto-confirm enabled for speed", timeframe: "1 min" },
      { id: "g3", title: "4-Step Intake", description: "Goal, experience, injuries, commitment", timeframe: "3 min", isCritical: true },
      { id: "g4", title: "Intake Confirmation", description: "Processing Complete with next steps", timeframe: "0.5 min" },
      { id: "g5", title: "First Dashboard Visit", description: "Orientation modal auto-opens", timeframe: "0.5 min" },
      { id: "g6", title: "Watch Walkthrough", description: "Gen Pop-specific onboarding video", timeframe: "3 min", isCritical: true },
      { id: "g7", title: "Complete Orientation Checklist", description: "Video, routines, nutrition, first workout", timeframe: "45 min" },
      { id: "g8", title: "Begin The Sentence (W1D1)", description: "Start 12-week program", timeframe: "45 min", isCritical: true },
      { id: "g9", title: "Set Up Chow Hall", description: "Review meal plan, targets, grocery list", timeframe: "15 min" },
      { id: "g10", title: "First Chapel Lesson", description: "Complete Week 1 faith lesson", timeframe: "15 min" },
      { id: "g11", title: "Join The Yard", description: "Introduce yourself in community", timeframe: "5 min" },
      { id: "g12", title: "First Roll Call (Week 1)", description: "Submit weekly check-in", timeframe: "5 min", isCritical: true },
    ],
  },
  {
    tier: "coaching",
    tierLabel: "Free World",
    description: "Premium 1:1 coaching with maximum accountability",
    color: "border-crimson/50",
    steps: [
      { id: "c1", title: "Purchase Free World", description: "User selects $999.99/mo premium", timeframe: "0 min", isCritical: true },
      { id: "c2", title: "Signup & Email Confirm", description: "Auto-confirm enabled for speed", timeframe: "1 min" },
      { id: "c3", title: "Redirect to Book P.O. Check-In", description: "Coaching tier skips standard intake", timeframe: "0.5 min", isCritical: true },
      { id: "c4", title: "Book Onboarding Call", description: "Schedule first call with Dom", timeframe: "2 min" },
      { id: "c5", title: "First Dashboard Visit", description: "Coaching-specific orientation modal", timeframe: "0.5 min" },
      { id: "c6", title: "Watch Welcome Home Video", description: "Coaching-specific walkthrough", timeframe: "3 min", isCritical: true },
      { id: "c7", title: "Complete Orientation", description: "Video, structure, first check-in prep", timeframe: "30 min" },
      { id: "c8", title: "First P.O. Check-In Call", description: "Initial coaching session with Dom", timeframe: "60 min", isCritical: true },
      { id: "c9", title: "Access Direct Line", description: "Send first message to Dom", timeframe: "5 min" },
      { id: "c10", title: "Begin Custom Program", description: "Start personalized training plan", timeframe: "45 min", isCritical: true },
      { id: "c11", title: "Access Entrepreneur Track", description: "Unlock advanced business content", timeframe: "30 min" },
      { id: "c12", title: "Weekly P.O. Report", description: "Submit weekly accountability", timeframe: "5 min" },
    ],
  },
];

const northStarLayout = [
  { section: "Roll Call Today", description: "Single-CTA widget showing next action", priority: 1 },
  { section: "Warden's Brief", description: "AI-generated weekly motivation", priority: 2 },
  { section: "Weekly Progress Card", description: "Current week stats at a glance", priority: 3 },
  { section: "Primary Training CTA", description: "The Sentence / Yard Time based on tier", priority: 4 },
  { section: "Core Cell Blocks", description: "5-6 main feature tiles (tier-specific)", priority: 5 },
  { section: "Locked/Upgrade Section", description: "Premium features with upgrade prompts", priority: 6 },
  { section: "Quick Actions Bar", description: "Start workout, check-in, book call", priority: 7 },
];

export function PrisonJourneyBlueprint() {
  const [selectedTier, setSelectedTier] = useState("transformation");
  
  const currentJourney = tierJourneys.find(t => t.tier === selectedTier);
  
  return (
    <Card className="bg-charcoal border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          Prison Journey UX Blueprint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTier} onValueChange={setSelectedTier}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="membership" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Solitary
            </TabsTrigger>
            <TabsTrigger value="transformation" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Gen Pop
            </TabsTrigger>
            <TabsTrigger value="coaching" className="text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Free World
            </TabsTrigger>
          </TabsList>
          
          {tierJourneys.map((journey) => (
            <TabsContent key={journey.tier} value={journey.tier} className="space-y-6">
              {/* Tier Header */}
              <div className={cn("p-4 rounded-lg border", journey.color)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-display font-bold text-lg">{journey.tierLabel}</h3>
                  <Badge variant="outline">{journey.steps.length} steps</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{journey.description}</p>
              </div>
              
              {/* Journey Timeline */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  User Journey (Purchase → Week 1)
                </h4>
                <div className="space-y-1">
                  {journey.steps.map((step, index) => (
                    <div 
                      key={step.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg transition-colors",
                        step.isCritical 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-background/30 hover:bg-background/50"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold",
                        step.isCritical 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-medium text-sm">{step.title}</span>
                          {step.isCritical && (
                            <Star className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {step.timeframe}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* North Star Dashboard Layout */}
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            North Star Dashboard Layout
          </h4>
          <div className="space-y-2">
            {northStarLayout.map((item) => (
              <div 
                key={item.section}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/30"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{item.priority}</span>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{item.section}</span>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Theme Guidelines */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            Jail Theme Terminology Guide
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Cell Block</span>
              <p className="text-xs text-muted-foreground">Main dashboard</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">The Sentence</span>
              <p className="text-xs text-muted-foreground">12-week program</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Yard Time</span>
              <p className="text-xs text-muted-foreground">Workout library</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Chow Hall</span>
              <p className="text-xs text-muted-foreground">Nutrition</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Chapel</span>
              <p className="text-xs text-muted-foreground">Faith lessons</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Roll Call</span>
              <p className="text-xs text-muted-foreground">Weekly check-in</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Time Served</span>
              <p className="text-xs text-muted-foreground">Progress tracker</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">The Yard</span>
              <p className="text-xs text-muted-foreground">Community</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">Work Release</span>
              <p className="text-xs text-muted-foreground">Skill building</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30">
              <span className="font-medium text-primary">CO Desk</span>
              <p className="text-xs text-muted-foreground">Help/Support</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PrisonJourneyBlueprint;
