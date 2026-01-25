import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  GraduationCap, 
  CheckCircle, 
  Loader2,
  Rocket,
  Crown,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSkillLessons } from "@/hooks/useSkillLessons";
import { useAuth } from "@/contexts/AuthContext";
import { useTTS } from "@/hooks/useTTS";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import UpgradePrompt from "@/components/UpgradePrompt";
import EmpireBuilding from "@/components/skills/EmpireBuilding";

const AdvancedSkills = () => {
  const { subscription } = useAuth();
  const { lessons, loading } = useSkillLessons();
  const [activeTab, setActiveTab] = useState("empire");
  const tts = useTTS();

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
              Free World Exclusive
            </Badge>
          </div>
          <h1 className="headline-section mb-2">
            <span className="text-primary">Trustee Program</span> — Advanced Hustle
          </h1>
          <p className="text-muted-foreground">
            World-class business education. Build an empire. Create generational wealth.
          </p>
        </div>

        <div className="steel-plate p-6 border border-primary/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary uppercase tracking-wider">Trustee-Level Access</p>
          </div>
          <p className="text-muted-foreground">
            As a Free World member, you have access to the complete business mastery curriculum.
            This content is designed for men ready to build real empires—not just side hustles.
            Study deeply. Apply relentlessly. Build something that lasts.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 p-2 bg-charcoal/80 border border-border rounded-xl">
            <TabsTrigger 
              value="empire" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10
                data-[state=active]:border data-[state=active]:border-primary/40 data-[state=active]:text-primary 
                data-[state=active]:shadow-[0_0_20px_-5px_hsl(43_74%_49%_/_0.5)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <Crown className="w-5 h-5" /> 
              <span>Empire Building</span>
            </TabsTrigger>
            <TabsTrigger 
              value="lessons" 
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-500/5
                data-[state=active]:border data-[state=active]:border-blue-500/40 data-[state=active]:text-blue-400 
                data-[state=active]:shadow-[0_0_20px_-5px_hsl(210_100%_50%_/_0.4)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <BookOpen className="w-5 h-5" /> 
              <span>Coach's Lessons</span>
            </TabsTrigger>
          </TabsList>

          {/* Empire Building Tab - Comprehensive Business Education */}
          <TabsContent value="empire">
            <EmpireBuilding />
          </TabsContent>

          {/* Lessons Tab - Admin-uploaded content */}
          <TabsContent value="lessons" className="space-y-4">
            {advancedLessons.length === 0 ? (
              <div className="text-center py-12 steel-plate">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No coach's lessons uploaded yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check the Empire Building tab for comprehensive business education.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {advancedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-6 rounded-lg steel-plate border border-primary/30 hover:border-primary/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-amber-500 text-primary-foreground flex items-center justify-center font-display text-xl flex-shrink-0">
                        {lesson.week_number}
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            Week {lesson.week_number}
                          </p>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            Advanced
                          </Badge>
                          {lesson.content && (
                            <AudioPlayButton
                              variant="compact"
                              label="Listen"
                              isLoading={tts.isLoading}
                              isPlaying={tts.isPlaying}
                              isPaused={tts.isPaused}
                              onClick={() => {
                                const parts = [
                                  `Week ${lesson.week_number}: ${lesson.title}.`,
                                  lesson.description || "",
                                  lesson.content || "",
                                  lesson.action_steps ? `Action steps: ${lesson.action_steps}` : "",
                                ].filter(Boolean);
                                tts.speak(parts.join(" "));
                              }}
                              onStop={tts.stop}
                            />
                          )}
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
        <div className="mt-8 bg-gradient-to-br from-primary/20 to-crimson/10 p-6 rounded-lg border border-primary/30 text-center">
          <p className="text-lg font-semibold mb-2">
            "The best investment you can make is in yourself."
          </p>
          <p className="text-sm text-muted-foreground">
            — Warren Buffett. Every hour you invest here compounds forever.
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