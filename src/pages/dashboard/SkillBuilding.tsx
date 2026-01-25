import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Briefcase, 
  CheckCircle, 
  Loader2,
  FileText,
  GraduationCap,
  Target,
  DollarSign,
  Users,
  Lightbulb,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSkillLessons } from "@/hooks/useSkillLessons";
import { useAuth } from "@/contexts/AuthContext";
import { useTTS } from "@/hooks/useTTS";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import UpgradePrompt from "@/components/UpgradePrompt";
import ResumeBuilder from "@/components/skills/ResumeBuilder";
import InterviewPrep from "@/components/skills/InterviewPrep";
import JobSearchTools from "@/components/skills/JobSearchTools";
import HustleIdeas from "@/components/skills/HustleIdeas";

const SkillBuilding = () => {
  const { subscription } = useAuth();
  const { lessons, loading } = useSkillLessons();
  const [activeTab, setActiveTab] = useState("lessons");
  const tts = useTTS();

  // Only transformation and coaching users can access
  const planType = subscription?.plan_type;
  if (planType === "membership") {
    return <UpgradePrompt feature="Work Release Program" upgradeTo="transformation" />;
  }

  // Filter out advanced lessons for non-coaching users
  const visibleLessons = lessons.filter(
    (l) => !l.is_advanced || planType === "coaching"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const toolCards = [
    {
      id: "resume",
      icon: FileText,
      title: "Release Documents",
      description: "Create a professional resume that gets you hired",
      tab: "resume"
    },
    {
      id: "interview",
      icon: Users,
      title: "Parole Board Prep",
      description: "Practice common questions and ace your interviews",
      tab: "interview"
    },
    {
      id: "jobs",
      icon: Target,
      title: "Employment Office",
      description: "Find opportunities and track your applications",
      tab: "jobs"
    },
    {
      id: "hustle",
      icon: DollarSign,
      title: "Yard Businesses",
      description: "Start making money while you build your career",
      tab: "hustle"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">
            Work Release Program
          </Badge>
          <h1 className="headline-section mb-2">
            Skill <span className="text-primary">Building</span>
          </h1>
          <p className="text-muted-foreground">
            Learn money-making skills, build your resume, and prepare for life on the outside.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary uppercase tracking-wider">Building for Release</p>
          </div>
          <p className="text-muted-foreground">
            This isn't just about getting a job—it's about building a life. Each week you'll learn a new skill 
            that can generate income. From yard businesses to legitimate enterprises—build the knowledge to 
            support yourself and your family on the outside.
          </p>
        </div>

        {/* Quick Access Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {toolCards.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.tab)}
              className={`p-4 rounded-lg border text-left transition-all hover:scale-105 ${
                activeTab === tool.tab
                  ? "bg-primary/10 border-primary/50"
                  : "bg-charcoal border-border hover:border-primary/30"
              }`}
            >
              <tool.icon className={`w-8 h-8 mb-2 ${activeTab === tool.tab ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-semibold mb-1">{tool.title}</h3>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </button>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 p-1.5 bg-charcoal/80 border border-border rounded-xl">
            <TabsTrigger 
              value="lessons"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10
                data-[state=active]:border data-[state=active]:border-primary/40 data-[state=active]:text-primary 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(43_74%_49%_/_0.4)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Lessons</span>
            </TabsTrigger>
            <TabsTrigger 
              value="resume"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-blue-500/5
                data-[state=active]:border data-[state=active]:border-blue-500/40 data-[state=active]:text-blue-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(210_100%_50%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger 
              value="interview"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-green-500/5
                data-[state=active]:border data-[state=active]:border-green-500/40 data-[state=active]:text-green-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(142_71%_45%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Interview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="jobs"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-orange-500/5
                data-[state=active]:border data-[state=active]:border-orange-500/40 data-[state=active]:text-orange-400 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(25_95%_53%_/_0.3)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Job Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="hustle"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-amber-500/10
                data-[state=active]:border data-[state=active]:border-primary/40 data-[state=active]:text-primary 
                data-[state=active]:shadow-[0_0_15px_-5px_hsl(43_74%_49%_/_0.4)]
                data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-charcoal"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Hustle</span>
            </TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-6">
            {/* Progress Summary */}
            {visibleLessons.length > 0 && (
              <div className="bg-card p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Skill Curriculum</span>
                  </div>
                  <Badge variant="outline" className="text-muted-foreground">
                    {visibleLessons.length} Lessons Available
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each lesson is designed to teach you a real skill that makes money. Study, apply, earn.
                </p>
              </div>
            )}

            {visibleLessons.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border border-border">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No skill lessons available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleLessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="rounded-lg bg-card border border-border hover:border-primary/50 transition-all overflow-hidden"
                  >
                    {/* Lesson Header */}
                    <div className="p-5 border-b border-border/50">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-amber-500 text-primary-foreground flex items-center justify-center font-display text-2xl flex-shrink-0 shadow-lg">
                          {lesson.week_number}
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                              Week {lesson.week_number} • Lesson {lessonIndex + 1}
                            </p>
                            {lesson.is_advanced && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                <Lightbulb className="w-3 h-3 mr-1" /> Advanced
                              </Badge>
                            )}
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
                          <h3 className="headline-card text-xl mb-2">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-muted-foreground">{lesson.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video Section */}
                    {lesson.video_url && (
                      <div className="bg-charcoal">
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

                    {/* Content Section */}
                    {lesson.content && (
                      <div className="p-5 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Eye className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-primary">Lesson Content</h4>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none">
                          {lesson.content.split('\n\n').map((paragraph, pIdx) => (
                            <div key={pIdx} className="mb-3">
                              {paragraph.split('\n').map((line, lIdx) => {
                                // Handle bold headers
                                if (line.startsWith('**') && line.includes(':**')) {
                                  return (
                                    <h5 key={lIdx} className="text-primary font-semibold mt-4 mb-2">
                                      {line.replace(/\*\*/g, '')}
                                    </h5>
                                  );
                                }
                                // Handle bullet points
                                if (line.startsWith('- ') || line.startsWith('• ')) {
                                  return (
                                    <li key={lIdx} className="text-muted-foreground ml-4 mb-1">
                                      {line.substring(2)}
                                    </li>
                                  );
                                }
                                // Handle numbered lists
                                if (/^\d+\.\s/.test(line)) {
                                  return (
                                    <li key={lIdx} className="text-muted-foreground ml-4 mb-1 list-decimal">
                                      {line.replace(/^\d+\.\s/, '')}
                                    </li>
                                  );
                                }
                                // Regular paragraph
                                return line ? (
                                  <p key={lIdx} className="text-muted-foreground mb-2">{line}</p>
                                ) : null;
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Steps Section */}
                    {lesson.action_steps && (
                      <div className="p-5 bg-primary/5 border-t border-primary/20">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-primary">Action Steps</h4>
                            <p className="text-xs text-muted-foreground">Apply what you learned</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {lesson.action_steps.split('\n').filter(step => step.trim()).map((step, stepIdx) => {
                            const cleanStep = step.replace(/^[-•\d.]\s*/, '').trim();
                            if (!cleanStep) return null;
                            return (
                              <div key={stepIdx} className="flex items-start gap-3 p-3 bg-charcoal rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {stepIdx + 1}
                                </div>
                                <p className="text-sm text-foreground">{cleanStep}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Lesson Footer */}
                    <div className="p-4 bg-charcoal/50 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        Week {lesson.week_number} Material
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <Target className="w-3 h-3" />
                        Take action today
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Resume Builder Tab */}
          <TabsContent value="resume">
            <ResumeBuilder />
          </TabsContent>

          {/* Interview Prep Tab */}
          <TabsContent value="interview">
            <InterviewPrep />
          </TabsContent>

          {/* Job Search Tab */}
          <TabsContent value="jobs">
            <JobSearchTools />
          </TabsContent>

          {/* Side Hustle Tab */}
          <TabsContent value="hustle">
            <HustleIdeas />
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex gap-4">
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillBuilding;