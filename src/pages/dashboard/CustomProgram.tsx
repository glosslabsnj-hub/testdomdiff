import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  ArrowRight, 
  Sparkles,
  MessageCircle,
  Calendar,
  FileText,
  Image,
  Video,
  Download,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Trophy,
  Utensils,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import NutritionProgramView from "@/components/dashboard/NutritionProgramView";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useClientCustomPrograms, ClientCustomProgram } from "@/hooks/useClientCustomPrograms";
import { useClientProgram, ClientProgramDay, ClientProgramExercise } from "@/hooks/useClientProgram";

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  return FileText;
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType === "application/pdf") return "PDF";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  return "File";
};

const SECTION_LABELS: Record<string, string> = {
  warmup: "Warm-up",
  main: "Main Work",
  accessory: "Accessory",
  conditioning: "Conditioning",
  cooldown: "Cool-down",
};

const CustomProgram = () => {
  const { isCoaching, subscription } = useEffectiveSubscription();
  const { user } = useAuth();
  const { programs: files, loading: filesLoading, getSignedUrl } = useClientCustomPrograms(user?.id || null);
  const { 
    weeks, 
    loading: programLoading, 
    hasProgram, 
    isPhaseComplete,
    toggleDayCompletion,
    isDayCompleted,
  } = useClientProgram(user?.id || null);
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);
  const [expandedDays, setExpandedDays] = useState<string[]>([]);
  const [programView, setProgramView] = useState<"workouts" | "nutrition">("workouts");
  
  // Calculate days since signup
  const daysSinceSignup = subscription?.started_at
    ? Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleDownload = async (program: ClientCustomProgram) => {
    setDownloadingId(program.id);
    const url = await getSignedUrl(program.file_url);
    setDownloadingId(null);
    
    if (url) {
      window.open(url, "_blank");
    }
  };

  const toggleWeek = (weekId: string) => {
    setExpandedWeeks((prev) =>
      prev.includes(weekId) ? prev.filter((id) => id !== weekId) : [...prev, weekId]
    );
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

  // Filter only active files
  const activeFiles = files.filter(p => p.is_active);
  const hasFiles = activeFiles.length > 0;
  const loading = filesLoading || programLoading;

  // Determine default tab
  const defaultTab = hasProgram ? "program" : "files";
  
  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="headline-section">
              Your Custom <span className="text-primary">Program</span>
            </h1>
            {(hasProgram || hasFiles) && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isCoaching 
              ? "Your personalized training program designed by Dom, specifically for your goals."
              : "This section is exclusive to Free World coaching clients."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (hasProgram || hasFiles) ? (
          <Tabs defaultValue={defaultTab} className="space-y-6">
            <TabsList className="bg-charcoal border border-border">
              <TabsTrigger value="program" className="data-[state=active]:bg-primary/20">
                <Calendar className="w-4 h-4 mr-2" />
                Program
              </TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-primary/20">
                <FileText className="w-4 h-4 mr-2" />
                Files {hasFiles && `(${activeFiles.length})`}
              </TabsTrigger>
            </TabsList>

            {/* Program Tab */}
            <TabsContent value="program" className="space-y-6">
              {/* Workouts/Nutrition Toggle */}
              <ToggleGroup 
                type="single" 
                value={programView} 
                onValueChange={(value) => value && setProgramView(value as "workouts" | "nutrition")}
                className="justify-start"
              >
                <ToggleGroupItem 
                  value="workouts" 
                  className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary gap-2"
                >
                  <Dumbbell className="w-4 h-4" />
                  Workouts
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="nutrition" 
                  className="data-[state=on]:bg-primary/20 data-[state=on]:text-primary gap-2"
                >
                  <Utensils className="w-4 h-4" />
                  Nutrition
                </ToggleGroupItem>
              </ToggleGroup>

              {/* Nutrition View */}
              {programView === "nutrition" && (
                <NutritionProgramView clientId={user?.id} />
              )}

              {/* Workouts View */}
              {programView === "workouts" && (
                <>
                  {isPhaseComplete ? (
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                            <Trophy className="w-7 h-7 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-foreground">Phase Complete!</h3>
                            <p className="text-muted-foreground">
                              You've finished all 4 weeks of your custom program
                            </p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Message Dom to discuss your progress and get your next phase of training.
                        </p>
                        <Button variant="gold" asChild>
                          <Link to="/dashboard/messages">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Dom for Next Phase
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : !hasProgram ? (
                    <InProgressCard daysSinceSignup={daysSinceSignup} />
                  ) : (
                <div className="space-y-4">
                  {weeks.map((week) => {
                    const isExpanded = expandedWeeks.includes(week.id);
                    const completedDays = (week.days || []).filter(
                      (d) => !d.is_rest_day && isDayCompleted(d.id)
                    ).length;
                    const totalWorkoutDays = (week.days || []).filter((d) => !d.is_rest_day).length;
                    const weekComplete = completedDays === totalWorkoutDays && totalWorkoutDays > 0;

                    return (
                      <Card
                        key={week.id}
                        className={weekComplete ? "border-green-500/30 bg-green-500/5" : ""}
                      >
                        <Collapsible open={isExpanded} onOpenChange={() => toggleWeek(week.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                  )}
                                  <div>
                                    <CardTitle className="text-lg">
                                      {week.title || `Week ${week.week_number}`}
                                    </CardTitle>
                                    {week.focus_description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {week.focus_description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {weekComplete ? (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Complete
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline">
                                      {completedDays}/{totalWorkoutDays} days
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0 space-y-3">
                              {(week.days || []).map((day) => (
                                <DayCard
                                  key={day.id}
                                  day={day}
                                  weekNumber={week.week_number}
                                  isCompleted={isDayCompleted(day.id)}
                                  isExpanded={expandedDays.includes(day.id)}
                                  onToggle={() => toggleDay(day.id)}
                                  onComplete={() => toggleDayCompletion(day.id, week.week_number)}
                                />
                              ))}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
                  )}

                  {/* Questions CTA */}
                  {hasProgram && !isPhaseComplete && (
                    <Card className="bg-charcoal border-border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageCircle className="w-6 h-6 text-primary" />
                            <div>
                              <h4 className="font-semibold text-foreground">Questions about your program?</h4>
                              <p className="text-sm text-muted-foreground">Send Dom a message anytime</p>
                            </div>
                          </div>
                          <Button variant="goldOutline" asChild>
                            <Link to="/dashboard/messages">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message Dom
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              {activeFiles.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No program files uploaded yet.
                      <br />
                      Check the Program tab for your structured workouts.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeFiles.map((program) => {
                    const FileIcon = getFileIcon(program.file_type);
                    const isDownloading = downloadingId === program.id;

                    return (
                      <Card key={program.id} className="border-primary/20 hover:border-primary/40 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <FileIcon className="w-7 h-7 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-foreground mb-1">
                                {program.title}
                              </h3>
                              {program.description && (
                                <p className="text-muted-foreground mb-3">
                                  {program.description}
                                </p>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {getFileTypeLabel(program.file_type)}
                              </Badge>
                            </div>

                            <Button
                              variant="gold"
                              onClick={() => handleDownload(program)}
                              disabled={isDownloading}
                              className="flex-shrink-0"
                            >
                              {isDownloading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <InProgressCard daysSinceSignup={daysSinceSignup} />
        )}
      </div>
    </DashboardLayout>
  );
};

// In Progress Card Component
function InProgressCard({ daysSinceSignup }: { daysSinceSignup: number }) {
  return (
    <>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge className="bg-primary/20 text-primary border-primary/30">
              <Clock className="w-3 h-3 mr-1" />
              In Progress
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              Day {daysSinceSignup} of Coaching
            </Badge>
          </div>
          <CardTitle className="text-2xl mt-4">
            Your Program is Being Built
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Dom is reviewing your intake and designing a personalized training plan 
            specifically for you. This isn't a template—it's a fully customized 
            program built around your goals, schedule, and experience level.
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
              <Sparkles className="w-8 h-8 text-primary mb-2" />
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
    </>
  );
}

// Day Card Component
interface DayCardProps {
  day: ClientProgramDay;
  weekNumber: number;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

function DayCard({ day, weekNumber, isCompleted, isExpanded, onToggle, onComplete }: DayCardProps) {
  if (day.is_rest_day) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">
            {day.day_of_week.slice(0, 2)}
          </span>
        </div>
        <div className="flex-1">
          <span className="text-sm text-muted-foreground">Rest Day</span>
        </div>
      </div>
    );
  }

  // Group exercises by section
  const exercisesBySection = (day.exercises || []).reduce((acc, exercise) => {
    const section = exercise.section_type || "main";
    if (!acc[section]) acc[section] = [];
    acc[section].push(exercise);
    return acc;
  }, {} as Record<string, ClientProgramExercise[]>);

  const sectionOrder = ["warmup", "main", "accessory", "conditioning", "cooldown"];

  return (
    <div
      className={`border rounded-lg overflow-hidden ${
        isCompleted ? "border-green-500/30 bg-green-500/5" : "border-border"
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {day.day_of_week.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{day.workout_name}</span>
                {isCompleted && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {day.exercises?.length || 0} exercises
              </p>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-4">
            {day.workout_description && (
              <p className="text-sm text-muted-foreground">{day.workout_description}</p>
            )}

            {sectionOrder.map((section) => {
              const exercises = exercisesBySection[section];
              if (!exercises || exercises.length === 0) return null;

              return (
                <div key={section}>
                  <h5 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                    {SECTION_LABELS[section] || section}
                  </h5>
                  <div className="space-y-2">
                    {exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-charcoal"
                      >
                        <Dumbbell className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{exercise.exercise_name}</p>
                          {(exercise.sets || exercise.reps_or_time) && (
                            <p className="text-xs text-muted-foreground">
                              {exercise.sets && `${exercise.sets} sets`}
                              {exercise.sets && exercise.reps_or_time && " × "}
                              {exercise.reps_or_time}
                              {exercise.rest && ` • ${exercise.rest} rest`}
                            </p>
                          )}
                          {exercise.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {exercise.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <Button
              variant={isCompleted ? "goldOutline" : "gold"}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed — Tap to Undo
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default CustomProgram;
