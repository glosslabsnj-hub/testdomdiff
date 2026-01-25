import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sun, Moon, Droplet, BookOpen, Loader2, Check,
  Flame, Clock, History, ChevronRight, Save, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useMilestones } from "@/hooks/useMilestones";
import { useRoutineTimeOverrides } from "@/hooks/useRoutineTimeOverrides";
import { useCustomRoutines } from "@/hooks/useCustomRoutines";
import { useRoutineSubSteps } from "@/hooks/useRoutineSubSteps";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TemplateSelector from "@/components/discipline/TemplateSelector";
import AddCustomRoutineDialog from "@/components/discipline/AddCustomRoutineDialog";
import CustomRoutineItem from "@/components/discipline/CustomRoutineItem";
import DraggableRoutineList from "@/components/discipline/DraggableRoutineList";
import ExportScheduleDialog from "@/components/discipline/ExportScheduleDialog";
import RoutineItem from "@/components/discipline/RoutineItem";
import QuickActionFAB from "@/components/discipline/QuickActionFAB";
import { MorningBriefing, WardenTip } from "@/components/warden";
import { RoutineWithDuration } from "@/lib/calendarUtils";

const JOURNAL_PROMPTS = [
  "What were my 3 wins today?",
  "What did I learn or struggle with?",
  "What am I grateful for?",
  "What will I do better tomorrow?",
  "How did I honor God today?",
];

const Discipline = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const {
    loading,
    morningRoutines,
    eveningRoutines,
    streak,
    waterCount,
    setWaterCount,
    toggleRoutineCompletion,
    isRoutineCompleted,
    getCompletionTime,
    saveJournalEntry,
    getJournalResponse,
    getTodayCompliance,
    refetch,
  } = useDailyDiscipline();

  const { checkStreakMilestones } = useMilestones();

  // Custom routines hook
  const {
    getMorningCustomRoutines,
    getEveningCustomRoutines,
    addCustomRoutine,
    updateCustomRoutine,
    deleteCustomRoutine,
    reorderCustomRoutines,
    loading: customRoutinesLoading,
  } = useCustomRoutines();

  // Get custom routines for completion tracking
  const morningCustomRoutines = getMorningCustomRoutines();
  const eveningCustomRoutines = getEveningCustomRoutines();
  const [journalDrafts, setJournalDrafts] = useState<Record<string, string>>({});
  const [savingJournal, setSavingJournal] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    (profile as any)?.discipline_template_id || null
  );

  // Time overrides hook
  const { getTime, saveTimeOverride } = useRoutineTimeOverrides(currentTemplateId);

  // Sub-steps hook
  const {
    getSubSteps,
    addUserSubStep,
    editSubStep,
    deleteSubStep,
    toggleSubStepComplete,
    isSubStepCompleted,
  } = useRoutineSubSteps(currentTemplateId);

  const today = format(new Date(), "EEEE, MMMM d, yyyy");
  const compliance = getTodayCompliance();

  // Handle deep link completion from calendar
  const completeId = searchParams.get("complete");
  const completeType = searchParams.get("type") as "morning" | "evening" | null;

  useEffect(() => {
    if (completeId && completeType && !loading) {
      // Find if this is a valid routine
      const allRoutines = completeType === "morning" 
        ? [...morningRoutines, ...morningCustomRoutines]
        : [...eveningRoutines, ...eveningCustomRoutines];
      
      const routine = allRoutines.find(r => r.id === completeId);
      
      if (routine && !isRoutineCompleted(completeId)) {
        toggleRoutineCompletion(completeId);
        toast({
          title: "Task completed!",
          description: "Marked from your calendar",
        });
      } else if (routine && isRoutineCompleted(completeId)) {
        toast({
          title: "Already complete",
          description: "This task was already marked done",
        });
      }
      
      // Clear URL params
      navigate("/dashboard/discipline", { replace: true });
    }
  }, [completeId, completeType, loading, morningRoutines, eveningRoutines, morningCustomRoutines, eveningCustomRoutines]);

  // Sync currentTemplateId with profile when profile updates
  useEffect(() => {
    const profileTemplateId = (profile as any)?.discipline_template_id || null;
    if (profileTemplateId !== currentTemplateId) {
      setCurrentTemplateId(profileTemplateId);
    }
  }, [profile]);

  // Initialize journal drafts from saved entries
  useEffect(() => {
    const initialDrafts: Record<string, string> = {};
    JOURNAL_PROMPTS.forEach(prompt => {
      initialDrafts[prompt] = getJournalResponse(prompt);
    });
    setJournalDrafts(initialDrafts);
  }, [getJournalResponse]);

  // Check streak milestones when streak changes
  useEffect(() => {
    if (streak > 0) {
      checkStreakMilestones(streak);
    }
  }, [streak, checkStreakMilestones]);

  // Handler for when template changes - refetch routines
  const handleTemplateChange = async (templateId: string) => {
    setCurrentTemplateId(templateId);
    await refetch();
  };

  const handleJournalChange = (prompt: string, value: string) => {
    setJournalDrafts(prev => ({ ...prev, [prompt]: value }));
  };

  const handleSaveJournal = async (prompt: string) => {
    setSavingJournal(prompt);
    await saveJournalEntry(prompt, journalDrafts[prompt] || "");
    setSavingJournal(null);
  };

  const handleWaterClick = (index: number) => {
    if (index === waterCount) {
      setWaterCount(waterCount + 1);
    } else if (index === waterCount - 1) {
      setWaterCount(waterCount - 1);
    }
  };

  const fetchJournalHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("discipline_journals")
        .select("*")
        .eq("user_id", user.id)
        .order("journal_date", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) throw error;

      const grouped = (data || []).reduce((acc: any, entry: any) => {
        const date = entry.journal_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
      }, {});

      setJournalHistory(Object.entries(grouped).map(([date, entries]) => ({
        date,
        entries,
      })));
    } catch (e) {
      console.error("Error fetching journal history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Prepare routines for export with duration/description
  const prepareRoutinesForExport = (
    routines: any[],
    customRoutines: any[],
    routineType: "morning" | "evening"
  ): RoutineWithDuration[] => {
    const combined = [
      ...routines.map(r => ({
        id: r.id,
        action_text: r.action_text,
        time_slot: r.time_slot,
        duration_minutes: r.duration_minutes || 5,
        description: r.description || null,
        routine_type: routineType,
      })),
      ...customRoutines.map(r => ({
        id: r.id,
        action_text: r.action_text,
        time_slot: r.time_slot,
        duration_minutes: r.duration_minutes || 5,
        description: r.description || null,
        routine_type: routineType,
      })),
    ];
    return combined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasRoutines = morningRoutines.length > 0 || eveningRoutines.length > 0;
  
  const morningExportRoutines = prepareRoutinesForExport(morningRoutines, morningCustomRoutines, "morning");
  const eveningExportRoutines = prepareRoutinesForExport(eveningRoutines, eveningCustomRoutines, "evening");

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Morning Briefing - Daily Devotional */}
        <div className="mb-4">
          <MorningBriefing />
        </div>

        {/* Warden Tip */}
        <WardenTip 
          tip={streak > 0 
            ? `${streak} day streak. ${streak >= 7 ? "You're proving discipline is a daily choice." : "Build on this momentum."} ${compliance.percent >= 80 ? "Today's looking solid." : "Lock in those remaining tasks."}`
            : "Start your streak today. One routine at a time."
          }
          className="mb-8"
        />

        {/* Header with Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="headline-section mb-2">
              Lights On / Lights <span className="text-primary">Out</span>
            </h1>
            <p className="text-muted-foreground">
              {today} — Build the structure that creates transformation.
            </p>
          </div>

          {/* Stats Row and Template Selector */}
          <div className="flex flex-wrap items-center gap-4">
            <TemplateSelector 
              currentTemplateId={currentTemplateId}
              onTemplateChange={handleTemplateChange}
            />
            {/* Streak Badge */}
            <div className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
              streak > 0 
                ? "bg-primary/10 border-primary/30" 
                : "bg-charcoal border-border"
            )}>
              <Flame className={cn(
                "w-6 h-6",
                streak > 0 ? "text-primary animate-flame" : "text-muted-foreground"
              )} />
              <div>
                <p className="text-2xl font-display text-primary">{streak}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</p>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-charcoal border border-border">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-border"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${(compliance.percent / 100) * 126} 126`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {compliance.percent}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">{compliance.completed}/{compliance.total}</p>
                <p className="text-xs text-muted-foreground">Today's Tasks</p>
              </div>
            </div>
          </div>
        </div>

        {!hasRoutines ? (
          <div className="bg-charcoal p-8 rounded-lg border border-border text-center mb-8">
            <Sun className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="headline-card mb-2">Routines Coming Soon</h3>
            <p className="text-muted-foreground">Your daily discipline routines are being prepared.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Morning Routine */}
            <div className="bg-card p-6 md:p-8 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Sun className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider font-semibold">Count Time: AM</p>
                    <h2 className="font-display text-xl">Reveille → Word → Work</h2>
                  </div>
                </div>
                {morningExportRoutines.length > 0 && (
                  <ExportScheduleDialog
                    routineType="morning"
                    routines={morningExportRoutines}
                    baseTime={morningRoutines[0]?.time_slot || "5:30 AM"}
                    trigger={
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Export
                      </Button>
                    }
                  />
                )}
              </div>

              {morningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No morning routine set</p>
              ) : (
                <div className="space-y-3">
                  {morningRoutines.map((item) => (
                    <RoutineItem
                      key={item.id}
                      id={item.id}
                      actionText={item.action_text}
                      timeSlot={item.time_slot}
                      description={(item as any).description}
                      displayOrder={item.display_order}
                      completed={isRoutineCompleted(item.id)}
                      completionTime={getCompletionTime(item.id)}
                      onToggle={toggleRoutineCompletion}
                      getTime={getTime}
                      onSaveTime={saveTimeOverride}
                      subSteps={getSubSteps(item.display_order)}
                      onSubStepToggle={toggleSubStepComplete}
                      onSubStepEdit={editSubStep}
                      onSubStepDelete={deleteSubStep}
                      onSubStepAdd={(text) => addUserSubStep(item.display_order, text)}
                      isSubStepCompleted={isSubStepCompleted}
                    />
                  ))}
                </div>
              )}
              
              {/* Custom Morning Routines */}
              {morningCustomRoutines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your Custom Tasks</p>
                  <DraggableRoutineList
                    routines={morningCustomRoutines}
                    onReorder={(orderedIds) => reorderCustomRoutines("morning", orderedIds)}
                    onToggle={toggleRoutineCompletion}
                    isCompleted={isRoutineCompleted}
                    getCompletionTime={getCompletionTime}
                    onUpdate={updateCustomRoutine}
                    onDelete={deleteCustomRoutine}
                  />
                </div>
              )}
              
              {/* Add Custom Morning Routine */}
              <AddCustomRoutineDialog
                routineType="morning"
                onAdd={async (data) => addCustomRoutine({ ...data, display_order: 0, is_active: true })}
              />
            </div>

            {/* Evening Routine */}
            <div className="bg-card p-6 md:p-8 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/20">
                    <Moon className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary uppercase tracking-wider font-semibold">Count Time: PM</p>
                    <h2 className="font-display text-xl">Lockdown → Reflect → Rest</h2>
                  </div>
                </div>
                {eveningExportRoutines.length > 0 && (
                  <ExportScheduleDialog
                    routineType="evening"
                    routines={eveningExportRoutines}
                    baseTime={eveningRoutines[0]?.time_slot || "8:00 PM"}
                    trigger={
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Export
                      </Button>
                    }
                  />
                )}
              </div>

              {eveningRoutines.length === 0 ? (
                <p className="text-muted-foreground text-sm">No evening routine set</p>
              ) : (
                <div className="space-y-3">
                  {eveningRoutines.map((item) => (
                    <RoutineItem
                      key={item.id}
                      id={item.id}
                      actionText={item.action_text}
                      timeSlot={item.time_slot}
                      description={(item as any).description}
                      displayOrder={item.display_order}
                      completed={isRoutineCompleted(item.id)}
                      completionTime={getCompletionTime(item.id)}
                      onToggle={toggleRoutineCompletion}
                      getTime={getTime}
                      onSaveTime={saveTimeOverride}
                      subSteps={getSubSteps(item.display_order)}
                      onSubStepToggle={toggleSubStepComplete}
                      onSubStepEdit={editSubStep}
                      onSubStepDelete={deleteSubStep}
                      onSubStepAdd={(text) => addUserSubStep(item.display_order, text)}
                      isSubStepCompleted={isSubStepCompleted}
                    />
                  ))}
                </div>
              )}
              
              {/* Custom Evening Routines */}
              {eveningCustomRoutines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Your Custom Tasks</p>
                  <DraggableRoutineList
                    routines={eveningCustomRoutines}
                    onReorder={(orderedIds) => reorderCustomRoutines("evening", orderedIds)}
                    onToggle={toggleRoutineCompletion}
                    isCompleted={isRoutineCompleted}
                    getCompletionTime={getCompletionTime}
                    onUpdate={updateCustomRoutine}
                    onDelete={deleteCustomRoutine}
                  />
                </div>
              )}
              
              {/* Add Custom Evening Routine */}
              <AddCustomRoutineDialog
                routineType="evening"
                onAdd={async (data) => addCustomRoutine({ ...data, display_order: 0, is_active: true })}
              />
            </div>
          </div>
        )}

        {/* Water Tracking */}
        <div className="mt-8 bg-card p-6 md:p-8 rounded-lg border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/20">
              <Droplet className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-primary uppercase tracking-wider font-semibold">Hydration</p>
              <h2 className="font-display text-xl">Hydration Rations</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleWaterClick(i)}
                className={cn(
                  "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                  i < waterCount
                    ? "bg-primary border-primary scale-105"
                    : "bg-charcoal border-dashed border-border hover:border-primary/50 hover:scale-105"
                )}
              >
                {i < waterCount ? (
                  <Check className="w-6 h-6 text-primary-foreground" />
                ) : (
                  <Droplet className="w-6 h-6 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Target: 8 glasses (64oz) minimum
            </p>
            <p className={cn(
              "text-sm font-semibold",
              waterCount >= 8 ? "text-primary" : "text-foreground"
            )}>
              {waterCount}/8 completed
              {waterCount >= 8 && " ✓"}
            </p>
          </div>
        </div>

        {/* Journal Section */}
        <div className="mt-8 bg-card p-6 md:p-8 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-primary uppercase tracking-wider font-semibold">Journaling</p>
                <h2 className="font-display text-xl">Cell Notes</h2>
              </div>
            </div>

            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setHistoryOpen(true);
                    fetchJournalHistory();
                  }}
                  className="gap-2"
                >
                  <History className="w-4 h-4" />
                  View History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Journal History</DialogTitle>
                </DialogHeader>
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : journalHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No journal entries yet.</p>
                ) : (
                  <div className="space-y-6">
                    {journalHistory.map((day: any) => (
                      <div key={day.date}>
                        <h4 className="font-semibold text-primary mb-3">
                          {format(new Date(day.date), "EEEE, MMMM d, yyyy")}
                        </h4>
                        <div className="space-y-3">
                          {day.entries.map((entry: any) => (
                            <div key={entry.id} className="bg-charcoal p-4 rounded-lg">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {entry.prompt}
                              </p>
                              <p className="text-sm">{entry.response}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {JOURNAL_PROMPTS.map((prompt, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-charcoal border border-border"
              >
                <p className="text-sm font-semibold mb-2">{prompt}</p>
                <textarea
                  className="w-full h-20 bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Write your reflection..."
                  value={journalDrafts[prompt] || ""}
                  onChange={(e) => handleJournalChange(prompt, e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveJournal(prompt)}
                    disabled={savingJournal === prompt || !journalDrafts[prompt]?.trim()}
                    className="gap-2"
                  >
                    {savingJournal === prompt ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in" className="gap-2">
              Report to Roll Call
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Cell Block</Link>
          </Button>
        </div>
      </div>

      {/* Quick Action Floating Button */}
      <QuickActionFAB
        morningRoutines={morningRoutines}
        eveningRoutines={eveningRoutines}
        isCompleted={isRoutineCompleted}
        onComplete={toggleRoutineCompletion}
      />
    </div>
  );
};

export default Discipline;
