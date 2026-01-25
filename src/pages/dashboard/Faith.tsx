import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle,
  Circle,
  PenLine,
  Heart,
  Star,
  Trophy,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFaithLessons } from "@/hooks/useFaithLessons";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import { useToast } from "@/hooks/use-toast";
import { useTTS } from "@/hooks/useTTS";
import { AudioPlayButton } from "@/components/AudioPlayButton";
import UpgradePrompt from "@/components/UpgradePrompt";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import EmptyState from "@/components/EmptyState";

const Faith = () => {
  const { lessons, loading } = useFaithLessons(true);
  const { user } = useAuth();
  const { subscription, isMembership } = useEffectiveSubscription();
  const { toast } = useToast();
  const tts = useTTS();
  const { streak } = useDailyDiscipline();
  
  // Calculate current week from subscription start date
  const calculatedWeek = useMemo(() => {
    return calculateCurrentWeek(subscription?.started_at);
  }, [subscription?.started_at]);
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [journalEntry, setJournalEntry] = useState("");
  const [prayerList, setPrayerList] = useState<string[]>([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [memorizedScriptures, setMemorizedScriptures] = useState<number[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  
  // Initialize current week when calculated
  useEffect(() => {
    setCurrentWeek(calculatedWeek);
  }, [calculatedWeek]);

  // Load saved data from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedJournal = localStorage.getItem(`faith_journal_${user.id}_week_${currentWeek}`);
      const savedPrayers = localStorage.getItem(`faith_prayers_${user.id}`);
      const savedActions = localStorage.getItem(`faith_actions_${user.id}_week_${currentWeek}`);
      const savedMemorized = localStorage.getItem(`faith_memorized_${user.id}`);
      const savedReflections = localStorage.getItem(`faith_reflections_${user.id}_week_${currentWeek}`);
      
      if (savedJournal) setJournalEntry(savedJournal);
      if (savedPrayers) setPrayerList(JSON.parse(savedPrayers));
      if (savedActions) setCompletedActions(JSON.parse(savedActions));
      if (savedMemorized) setMemorizedScriptures(JSON.parse(savedMemorized));
      if (savedReflections) setReflectionAnswers(JSON.parse(savedReflections));
    }
  }, [user?.id, currentWeek]);
  
  // Block membership users from accessing Faith content (after all hooks)
  if (isMembership) {
    return <UpgradePrompt feature="Chapel (Faith & Mindset)" upgradeTo="transformation" />;
  }

  const currentLesson = lessons.find((l) => l.week_number === currentWeek);
  const hasContent = currentLesson && (
    currentLesson.title ||
    currentLesson.big_idea ||
    currentLesson.scripture ||
    currentLesson.teaching_content
  );

  const completedWeeks = memorizedScriptures.length;
  const progressPercent = Math.min(100, Math.max(0, (completedWeeks / 12) * 100));

  const saveJournal = () => {
    if (user?.id) {
      localStorage.setItem(`faith_journal_${user.id}_week_${currentWeek}`, journalEntry);
      toast({ title: "Journal Saved", description: "Your reflection has been saved." });
    }
  };

  const addPrayer = () => {
    if (newPrayer.trim() && user?.id) {
      const updated = [...prayerList, newPrayer.trim()];
      setPrayerList(updated);
      localStorage.setItem(`faith_prayers_${user.id}`, JSON.stringify(updated));
      setNewPrayer("");
      toast({ title: "Prayer Added", description: "Added to your prayer list." });
    }
  };

  const removePrayer = (index: number) => {
    if (user?.id) {
      const updated = prayerList.filter((_, i) => i !== index);
      setPrayerList(updated);
      localStorage.setItem(`faith_prayers_${user.id}`, JSON.stringify(updated));
    }
  };

  const toggleAction = (action: string) => {
    if (user?.id) {
      const updated = completedActions.includes(action)
        ? completedActions.filter(a => a !== action)
        : [...completedActions, action];
      setCompletedActions(updated);
      localStorage.setItem(`faith_actions_${user.id}_week_${currentWeek}`, JSON.stringify(updated));
    }
  };

  const toggleMemorized = () => {
    if (user?.id) {
      const updated = memorizedScriptures.includes(currentWeek)
        ? memorizedScriptures.filter(w => w !== currentWeek)
        : [...memorizedScriptures, currentWeek];
      setMemorizedScriptures(updated);
      localStorage.setItem(`faith_memorized_${user.id}`, JSON.stringify(updated));
      
      if (!memorizedScriptures.includes(currentWeek)) {
        toast({ title: "Scripture Memorized! 🎉", description: `Week ${currentWeek} scripture added to your memory bank.` });
      }
    }
  };

  const saveReflection = (question: string, answer: string) => {
    if (user?.id) {
      const updated = { ...reflectionAnswers, [question]: answer };
      setReflectionAnswers(updated);
      localStorage.setItem(`faith_reflections_${user.id}_week_${currentWeek}`, JSON.stringify(updated));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="section-container py-8">
          <DashboardBackLink />
          <DashboardSkeleton variant="detail" />
        </div>
      </DashboardLayout>
    );
  }

  // Parse action steps into array
  const actionSteps = currentLesson?.action_steps?.split('\n').filter(s => s.trim()) || [];
  const reflectionQuestions = currentLesson?.reflection_questions?.split('\n').filter(q => q.trim()) || [];

  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />

        {/* Header with Progress */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="headline-section mb-2">
              <span className="text-primary">Chapel</span> — Faith & Mindset
            </h1>
            <p className="text-muted-foreground">Weekly lessons on faith, discipline, and mental fortitude.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-4 py-2 bg-charcoal rounded-lg border border-primary/30">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-primary">{streak}</span>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            
            {/* Scripture Progress */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-charcoal rounded-lg border border-border">
              <Star className="w-5 h-5 text-primary" />
              <span className="text-sm">{completedWeeks}/12 memorized</span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8 p-4 bg-charcoal rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Scripture Memory Progress</p>
            <p className="text-sm font-medium text-primary">{Math.round(progressPercent)}%</p>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Week Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentWeek <= 1}
            onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => {
              const lesson = lessons.find((l) => l.week_number === week);
              const isPublished = lesson?.is_published;
              const isMemorized = memorizedScriptures.includes(week);
              return (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all relative ${
                    currentWeek === week
                      ? "bg-primary text-primary-foreground"
                      : isPublished
                      ? "bg-charcoal border border-border hover:border-primary/50"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  disabled={!isPublished}
                >
                  {week}
                  {isMemorized && (
                    <Star className="w-3 h-3 text-primary absolute -top-1 -right-1 fill-primary" />
                  )}
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentWeek >= 12}
            onClick={() => setCurrentWeek((w) => Math.min(12, w + 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {!hasContent ? (
          <EmptyState
            type="faith"
            title={`Week ${currentWeek} Lesson Coming Soon`}
            description="This week's chapel session is being prepared. In the meantime, meditate on last week's scripture and keep your prayer list active."
            actionLabel="View Prayer List"
            onAction={() => {/* Stay on page, user can scroll */}}
          />
        ) : (
          <Tabs defaultValue="lesson" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-charcoal">
              <TabsTrigger value="lesson">Sermon</TabsTrigger>
              <TabsTrigger value="journal">Cell Notes</TabsTrigger>
              <TabsTrigger value="prayers">Prayer Wall</TabsTrigger>
              <TabsTrigger value="actions">Faith Walk</TabsTrigger>
            </TabsList>

            {/* Lesson Tab */}
            <TabsContent value="lesson" className="space-y-6">
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="space-y-6">
                  {currentLesson.title && (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-primary uppercase tracking-wider mb-1">Week {currentWeek}</p>
                        <h2 className="headline-section">{currentLesson.title}</h2>
                      </div>
                      <AudioPlayButton
                        variant="default"
                        label="Listen to Sermon"
                        isLoading={tts.isLoading}
                        isPlaying={tts.isPlaying}
                        isPaused={tts.isPaused}
                        onClick={() => {
                          const parts = [
                            currentLesson.title ? `Week ${currentWeek}: ${currentLesson.title}.` : "",
                            currentLesson.big_idea ? `Big Idea: ${currentLesson.big_idea}.` : "",
                            currentLesson.scripture ? `Scripture: ${currentLesson.scripture}.` : "",
                            currentLesson.teaching_content || "",
                            currentLesson.weekly_challenge ? `This week's challenge: ${currentLesson.weekly_challenge}` : "",
                          ].filter(Boolean);
                          tts.speak(parts.join(" "));
                        }}
                        onStop={tts.stop}
                      />
                    </div>
                  )}

                  {currentLesson.big_idea && (
                    <div className="p-4 bg-charcoal rounded-lg border-l-4 border-primary">
                      <p className="text-xs text-primary uppercase tracking-wider mb-1">Big Idea</p>
                      <p className="text-lg font-medium">{currentLesson.big_idea}</p>
                    </div>
                  )}

                  {currentLesson.scripture && (
                    <div className="p-4 bg-charcoal rounded-lg relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs text-primary uppercase tracking-wider">Scripture to Memorize</p>
                            <AudioPlayButton
                              variant="compact"
                              label="Listen"
                              isLoading={tts.isLoading}
                              isPlaying={tts.isPlaying}
                              isPaused={tts.isPaused}
                              onClick={() => tts.speak(currentLesson.scripture || "")}
                              onStop={tts.stop}
                            />
                          </div>
                          <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.scripture}</p>
                        </div>
                        <Button
                          variant={memorizedScriptures.includes(currentWeek) ? "gold" : "goldOutline"}
                          size="sm"
                          onClick={toggleMemorized}
                          className="shrink-0"
                        >
                          {memorizedScriptures.includes(currentWeek) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" /> Memorized
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4 mr-1" /> Mark as Memorized
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentLesson.teaching_content && (
                    <div className="p-4 bg-charcoal rounded-lg">
                      <p className="text-xs text-primary uppercase tracking-wider mb-1">Story / Teaching</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.teaching_content}</p>
                    </div>
                  )}

                  {currentLesson.weekly_challenge && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-4 h-4 text-primary" />
                        <p className="text-xs text-primary uppercase tracking-wider">Weekly Challenge</p>
                      </div>
                      <p className="font-medium">{currentLesson.weekly_challenge}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Journal Tab */}
            <TabsContent value="journal" className="space-y-6">
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <PenLine className="w-5 h-5 text-primary" />
                  <h3 className="headline-card">Week {currentWeek} Reflection Journal</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Take time to reflect on this week's lesson. Write your thoughts, prayers, and revelations.
                </p>
                <Textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="What is God speaking to you this week? What stood out from the lesson? How will you apply this to your life?"
                  className="min-h-[200px] mb-4"
                />
                <Button variant="gold" onClick={saveJournal}>
                  Save Journal Entry
                </Button>

                {/* Reflection Questions */}
                {reflectionQuestions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h4 className="font-semibold mb-4">Reflection Questions</h4>
                    <div className="space-y-4">
                      {reflectionQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-charcoal rounded-lg">
                          <p className="text-sm font-medium mb-2">{question}</p>
                          <Textarea
                            value={reflectionAnswers[question] || ""}
                            onChange={(e) => saveReflection(question, e.target.value)}
                            placeholder="Your answer..."
                            className="min-h-[80px]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Prayers Tab */}
            <TabsContent value="prayers" className="space-y-6">
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="headline-card">Prayer List</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep track of your prayers and watch God work in your life.
                </p>
                
                <div className="flex gap-2 mb-6">
                  <Textarea
                    value={newPrayer}
                    onChange={(e) => setNewPrayer(e.target.value)}
                    placeholder="Add a prayer request..."
                    className="min-h-[60px]"
                  />
                  <Button variant="gold" onClick={addPrayer} className="shrink-0">
                    Add
                  </Button>
                </div>

                {prayerList.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No prayer requests yet. Add your first one above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prayerList.map((prayer, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-charcoal rounded-lg">
                        <Heart className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <p className="text-sm flex-1">{prayer}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removePrayer(index)}
                          className="text-muted-foreground hover:text-destructive shrink-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="space-y-6">
              <div className="bg-card p-8 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <h3 className="headline-card">Weekly Action Steps</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Check off each action step as you complete it this week.
                </p>

                {actionSteps.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No action steps for this week.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {actionSteps.map((step, index) => {
                      const isCompleted = completedActions.includes(step);
                      return (
                        <button
                          key={index}
                          onClick={() => toggleAction(step)}
                          className={`w-full flex items-start gap-3 p-4 rounded-lg border transition-all text-left ${
                            isCompleted
                              ? "bg-primary/10 border-primary/30"
                              : "bg-charcoal border-border hover:border-primary/50"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                            {step}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Progress Summary */}
                <div className="mt-6 p-4 bg-charcoal rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Week {currentWeek} Progress</span>
                    <Badge variant={completedActions.length === actionSteps.length ? "default" : "outline"}>
                      {completedActions.length}/{actionSteps.length} Complete
                    </Badge>
                  </div>
                  <Progress 
                    value={actionSteps.length > 0 ? (completedActions.length / actionSteps.length) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Faith;