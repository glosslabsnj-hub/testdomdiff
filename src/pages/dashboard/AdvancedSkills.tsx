import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  GraduationCap, 
  CheckCircle, 
  Loader2,
  Rocket,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Lightbulb,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useSkillLessons } from "@/hooks/useSkillLessons";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";

// Advanced business strategies for coaching tier
const businessStrategies = [
  {
    id: "1",
    title: "Building a Personal Brand",
    icon: Users,
    difficulty: "medium",
    description: "Create an authentic brand that attracts opportunities and builds trust.",
    steps: [
      "Define your unique value proposition—what makes you different",
      "Choose 2-3 platforms to focus on (LinkedIn, Instagram, YouTube)",
      "Create consistent content that showcases your expertise",
      "Engage with your audience daily",
      "Collaborate with others in your niche"
    ],
    tips: [
      "Authenticity beats perfection every time",
      "Share your story—people connect with real experiences",
      "Post consistently, even if it's just 3x per week"
    ],
    resources: [
      { name: "Personal Branding Guide", url: "https://www.youtube.com/results?search_query=personal+branding+guide" }
    ]
  },
  {
    id: "2",
    title: "Starting an LLC",
    icon: Building2,
    difficulty: "medium",
    description: "Protect yourself legally and establish credibility with a proper business structure.",
    steps: [
      "Choose your state for incorporation (consider tax benefits)",
      "Pick a unique business name",
      "File Articles of Organization with your state",
      "Get an EIN from the IRS (free)",
      "Open a business bank account",
      "Set up basic accounting (Wave, QuickBooks)"
    ],
    tips: [
      "Wyoming and Delaware have favorable LLC laws",
      "Keep business and personal finances separate",
      "Consider a registered agent service for privacy"
    ],
    resources: [
      { name: "IRS EIN Application", url: "https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" },
      { name: "LegalZoom", url: "https://www.legalzoom.com" }
    ]
  },
  {
    id: "3",
    title: "Scaling to $10K/Month",
    icon: TrendingUp,
    difficulty: "hard",
    description: "Move from side hustle to sustainable income through strategic scaling.",
    steps: [
      "Master your craft—become genuinely excellent at what you do",
      "Document your process so you can delegate",
      "Raise your prices (you're probably undercharging)",
      "Create systems for lead generation",
      "Build recurring revenue streams",
      "Hire your first contractor or VA"
    ],
    tips: [
      "$10K/month = $2,500/week = $500/day",
      "Focus on high-ticket offerings vs. low-ticket volume",
      "Track your numbers religiously—what gets measured gets managed"
    ],
    resources: [
      { name: "Scaling Business Guide", url: "https://www.youtube.com/results?search_query=scale+business+10k+month" }
    ]
  },
  {
    id: "4",
    title: "Digital Product Creation",
    icon: Rocket,
    difficulty: "medium",
    description: "Build products once and sell them forever—the ultimate leverage play.",
    steps: [
      "Identify a painful problem in your niche",
      "Create a simple solution (ebook, course, template)",
      "Build with free tools (Canva, Notion, Loom)",
      "Set up a sales page (Gumroad, Teachable)",
      "Drive traffic through content marketing",
      "Collect testimonials and iterate"
    ],
    tips: [
      "Start with a $27-97 product to test the market",
      "Your first product won't be perfect—ship it anyway",
      "Build an email list from day one"
    ],
    resources: [
      { name: "Gumroad", url: "https://gumroad.com" },
      { name: "Teachable", url: "https://teachable.com" }
    ]
  },
  {
    id: "5",
    title: "High-Ticket Coaching/Consulting",
    icon: DollarSign,
    difficulty: "hard",
    description: "Charge premium prices for transformational results.",
    steps: [
      "Get results for yourself first (credibility)",
      "Get results for 3-5 people for free (case studies)",
      "Package your methodology into a clear offer",
      "Price based on value delivered, not hours worked",
      "Create a simple sales process",
      "Deliver exceptional results to get referrals"
    ],
    tips: [
      "High-ticket clients are often easier than low-ticket",
      "Confidence in your pricing comes from confidence in your results",
      "One $5,000 client = 50 × $100 clients"
    ],
    resources: [
      { name: "High-Ticket Selling", url: "https://www.youtube.com/results?search_query=high+ticket+coaching" }
    ]
  }
];

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30"
};

const AdvancedSkills = () => {
  const { subscription } = useAuth();
  const { lessons, loading } = useSkillLessons();
  const [activeTab, setActiveTab] = useState("strategies");

  // Only coaching users can access
  if (subscription?.plan_type !== "coaching") {
    return <UpgradePrompt feature="Advanced Skill-Building" upgradeTo="coaching" />;
  }

  // Show only advanced lessons
  const advancedLessons = lessons.filter((l) => l.is_advanced);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cell Block
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-gradient-to-r from-primary/20 to-amber-500/20 text-primary border-primary/30">
              Trustee Program Exclusive
            </Badge>
          </div>
          <h1 className="headline-section mb-2">
            <span className="text-primary">Trustee Program</span> — Advanced Hustle
          </h1>
          <p className="text-muted-foreground">
            Next-level business strategies and income-building skills for serious entrepreneurs.
          </p>
        </div>

        <div className="bg-gradient-to-br from-charcoal to-primary/5 p-6 rounded-lg border border-primary/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary uppercase tracking-wider">Trustee-Level Access</p>
          </div>
          <p className="text-muted-foreground">
            As a Free World member, you have trustee-level access to advanced strategies that go beyond the basics.
            This content is designed for men ready to build real businesses and create lasting wealth on the outside.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-charcoal">
            <TabsTrigger value="strategies" className="gap-2">
              <Rocket className="w-4 h-4" /> Business Strategies
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2">
              <GraduationCap className="w-4 h-4" /> Lessons
            </TabsTrigger>
          </TabsList>

          {/* Business Strategies Tab */}
          <TabsContent value="strategies" className="space-y-4">
            <div className="space-y-4">
              {businessStrategies.map((strategy) => (
                <Accordion key={strategy.id} type="single" collapsible>
                  <AccordionItem value={strategy.id} className="bg-card border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 text-left w-full pr-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <strategy.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{strategy.title}</h3>
                            <Badge className={difficultyColors[strategy.difficulty as keyof typeof difficultyColors]}>
                              {strategy.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {strategy.description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="pt-2 pb-6 space-y-4">
                      <p className="text-muted-foreground">{strategy.description}</p>
                      
                      {/* Steps */}
                      <div className="p-4 bg-charcoal rounded-lg">
                        <h4 className="font-semibold mb-3 text-primary">Step-by-Step Guide:</h4>
                        <ol className="space-y-2">
                          {strategy.steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      
                      {/* Tips */}
                      <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-primary" /> Pro Tips
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {strategy.tips.map((tip, i) => (
                            <li key={i}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Resources */}
                      {strategy.resources.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Resources:</h4>
                          <div className="flex flex-wrap gap-2">
                            {strategy.resources.map((resource, i) => (
                              <a
                                key={i}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1 bg-charcoal rounded-full text-sm hover:bg-primary/20 transition-colors"
                              >
                                {resource.name}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4">
            {advancedLessons.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No advanced lessons available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check the Business Strategies tab, or check back soon!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {advancedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-6 rounded-lg bg-card border border-primary/30 hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-amber-500 text-primary-foreground flex items-center justify-center font-display text-xl flex-shrink-0">
                        {lesson.week_number}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Week {lesson.week_number}
                          </p>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            Advanced
                          </Badge>
                        </div>
                        <h3 className="headline-card mb-2">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-muted-foreground mb-4">{lesson.description}</p>
                        )}

                        {lesson.video_url && (
                          <div className="mb-4 rounded-lg overflow-hidden bg-charcoal border border-border">
                            <div className="aspect-video">
                              <iframe
                                src={lesson.video_url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}

                        {lesson.content && (
                          <div className="p-4 rounded bg-charcoal border border-border mb-4">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lesson.content}</p>
                          </div>
                        )}

                        {lesson.action_steps && (
                          <div className="p-4 rounded bg-charcoal border border-primary/20 mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-primary" />
                              <p className="text-sm text-primary font-medium">Action Steps</p>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lesson.action_steps}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Motivation */}
        <div className="mt-8 bg-gradient-to-br from-primary/20 to-amber-500/10 p-6 rounded-lg border border-primary/30 text-center">
          <p className="text-lg font-semibold mb-2">
            "The only thing standing between you and your goal is the story you keep telling yourself."
          </p>
          <p className="text-sm text-muted-foreground">
            Build the empire you were meant to build.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/skills">View All Work Release Lessons</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Cell Block</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSkills;
