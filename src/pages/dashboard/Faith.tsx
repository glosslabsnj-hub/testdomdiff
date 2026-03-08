import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
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
import { useFaithProgress } from "@/hooks/useFaithProgress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { calculateCurrentWeek } from "@/lib/weekCalculator";
import { useSermonTTS } from "@/hooks/useSermonTTS";
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
  const tts = useSermonTTS();
  const { streak } = useDailyDiscipline();

  // Calculate current week from subscription start date
  const calculatedWeek = useMemo(() => {
    return calculateCurrentWeek(subscription?.started_at);
  }, [subscription?.started_at]);

  const [currentWeek, setCurrentWeek] = useState(1);
  const [newPrayer, setNewPrayer] = useState("");

  // Initialize current week when calculated
  useEffect(() => {
    setCurrentWeek(calculatedWeek);
  }, [calculatedWeek]);

  // Supabase-backed faith progress (replaces localStorage)
  const {
    journalEntry,
    completedActions,
    reflectionAnswers,
    prayers,
    memorizedWeeks: memorizedScriptures,
    saveJournal,
    toggleAction,
    saveReflection,
    addPrayer: addPrayerToDb,
    removePrayer: removePrayerFromDb,
    toggleMemorized: toggleMemorizedDb,
    setJournalEntry,
  } = useFaithProgress(currentWeek);

  // Membership users can only see Week 1 as a preview
  const isMembershipPreview = isMembership;
  if (isMembershipPreview) {
    // Force to week 1 only
    if (currentWeek !== 1) {
      setCurrentWeek(1);
    }
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

  const addPrayer = () => {
    if (newPrayer.trim()) {
      addPrayerToDb(newPrayer.trim());
      setNewPrayer("");
    }
  };

  const toggleMemorized = () => {
    toggleMemorizedDb(currentWeek);
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

        {/* Solitary Preview Banner */}
        {isMembershipPreview && (
          <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-primary text-sm">Week 1 Preview</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're in Solitary, so you get Week 1 of Chapel as a preview.
                  Upgrade to Gen Pop to unlock all 12 weeks of faith and mindset lessons.
                </p>
                <Button variant="goldOutline" size="sm" className="mt-3" asChild>
                  <Link to="/checkout?plan=transformation">
                    Unlock All 12 Weeks <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Overall Progress Bar */}
        {!isMembershipPreview && (
          <div className="mb-8 p-4 bg-charcoal rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Scripture Memory Progress</p>
              <p className="text-sm font-medium text-primary">{Math.round(progressPercent)}%</p>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Week Selector - hidden for Solitary preview (locked to week 1) */}
        {!isMembershipPreview && (
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentWeek <= 1}
            onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-1 sm:gap-1.5 md:gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => {
              const lesson = lessons.find((l) => l.week_number === week);
              const isPublished = lesson?.is_published;
              const isMemorized = memorizedScriptures.includes(week);
              return (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-medium transition-all relative ${
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
        )}

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
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto sm:grid sm:w-full sm:grid-cols-4 bg-charcoal">
                <TabsTrigger value="lesson" className="min-w-[60px] sm:min-w-[70px] px-3 sm:px-2 text-xs sm:text-sm">Sermon</TabsTrigger>
                <TabsTrigger value="journal" className="min-w-[60px] sm:min-w-[80px] px-3 sm:px-2 text-xs sm:text-sm">Cell Notes</TabsTrigger>
                <TabsTrigger value="prayers" className="min-w-[60px] sm:min-w-[85px] px-3 sm:px-2 text-xs sm:text-sm">Prayer Wall</TabsTrigger>
                <TabsTrigger value="actions" className="min-w-[60px] sm:min-w-[80px] px-3 sm:px-2 text-xs sm:text-sm">Faith Walk</TabsTrigger>
              </TabsList>
            </div>

            {/* Lesson Tab */}
            <TabsContent value="lesson" className="space-y-6">
              <div className="bg-card p-4 sm:p-8 rounded-lg border border-border">
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
                          className="shrink-0 min-h-[44px]"
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
              <div className="bg-card p-4 sm:p-8 rounded-lg border border-border">
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
                <Button variant="gold" onClick={() => saveJournal(journalEntry)}>
                  Save Journal Entry
                </Button>

                {/* Reflection Questions */}
                {reflectionQuestions.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-border">
                    <h4 className="font-semibold mb-4">Reflection Questions</h4>
                    <div className="space-y-4">
                      {reflectionQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-charcoal rounded-lg">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-2">{question}</p>
                              <Textarea
                                value={reflectionAnswers[question] || ""}
                                onChange={(e) => saveReflection(question, e.target.value)}
                                placeholder="Your answer..."
                                className="min-h-[80px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Prayers Tab */}
            <TabsContent value="prayers" className="space-y-6">
              <div className="bg-card p-4 sm:p-8 rounded-lg border border-border">
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

                {prayers.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No prayer requests yet. Add your first one above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prayers.map((prayer) => (
                      <div key={prayer.id} className="flex items-start gap-3 p-3 bg-charcoal rounded-lg">
                        <Heart className="w-4 h-4 text-primary mt-1 shrink-0" />
                        <p className="text-sm flex-1">{prayer.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrayerFromDb(prayer.id)}
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
              <div className="bg-card p-4 sm:p-8 rounded-lg border border-border">
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
                          <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {index + 1}
                          </span>
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