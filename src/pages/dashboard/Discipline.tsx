import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  Sun, Moon, Loader2, Flame, ChevronRight, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyDiscipline } from "@/hooks/useDailyDiscipline";
import { useMilestones } from "@/hooks/useMilestones";
import { useCustomRoutines } from "@/hooks/useCustomRoutines";
import { useRoutineTimeOverrides } from "@/hooks/useRoutineTimeOverrides";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TemplateSelector from "@/components/discipline/TemplateSelector";
import AddCustomRoutineDialog from "@/components/discipline/AddCustomRoutineDialog";
import SimpleRoutineItem from "@/components/discipline/SimpleRoutineItem";
import SimplifiedJournal from "@/components/discipline/SimplifiedJournal";
import QuickActionFAB from "@/components/discipline/QuickActionFAB";
import DashboardBackLink from "@/components/DashboardBackLink";

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
    deleteCustomRoutine,
    loading: customRoutinesLoading,
  } = useCustomRoutines();

  const morningCustomRoutines = getMorningCustomRoutines();
  const eveningCustomRoutines = getEveningCustomRoutines();
  
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    (profile as any)?.discipline_template_id || null
  );

  // Time overrides hook
  const { getTime, saveTimeOverride } = useRoutineTimeOverrides(currentTemplateId);

  const today = format(new Date(), "EEEE, MMMM d");
  const compliance = getTodayCompliance();

  // Handle deep link completion from calendar
  const completeId = searchParams.get("complete");
  const completeType = searchParams.get("type") as "morning" | "evening" | null;

  useEffect(() => {
    if (completeId && completeType && !loading) {
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
      }
      
      navigate("/dashboard/discipline", { replace: true });
    }
  }, [completeId, completeType, loading]);

  // Sync template with profile
  useEffect(() => {
    const profileTemplateId = (profile as any)?.discipline_template_id || null;
    if (profileTemplateId !== currentTemplateId) {
      setCurrentTemplateId(profileTemplateId);
    }
  }, [profile]);

  // Check streak milestones
  useEffect(() => {
    if (streak > 0) {
      checkStreakMilestones(streak);
    }
  }, [streak, checkStreakMilestones]);

  // Handle #incomplete scroll
  useEffect(() => {
    if (window.location.hash === "#incomplete" && !loading) {
      const morningComplete = morningRoutines.every(r => isRoutineCompleted(r.id)) &&
        morningCustomRoutines.every(r => isRoutineCompleted(r.id));
      
      let targetId = "";
      if (!morningComplete) {
        targetId = "morning-routine";
      } else {
        targetId = "evening-routine";
      }
      
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [loading]);

  const handleTemplateChange = async (templateId: string) => {
    setCurrentTemplateId(templateId);
    await refetch();
  };

  const handleDeleteCustom = async (id: string) => {
    // Extract the actual ID from custom_xxx format
    const actualId = id.startsWith("custom_") ? id.replace("custom_", "") : id;
    return deleteCustomRoutine(actualId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasRoutines = morningRoutines.length > 0 || eveningRoutines.length > 0;
  const totalTasks = compliance.total;
  const completedTasks = compliance.completed;

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8 pb-24">
        <DashboardBackLink className="mb-6" />

        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="headline-section">
              Lights On / Lights <span className="text-primary">Out</span>
            </h1>
            <TemplateSelector 
              currentTemplateId={currentTemplateId}
              onTemplateChange={handleTemplateChange}
              trigger={
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Settings2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Template</span>
                </Button>
              }
            />
          </div>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        {/* Progress Bar + Stats */}
        <div className="bg-card rounded-lg border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {completedTasks}/{totalTasks} complete
              </span>
              {streak > 0 && (
                <div className="flex items-center gap-1 text-sm text-primary">
                  <Flame className="w-4 h-4" />
                  <span className="font-semibold">{streak}-day streak</span>
                </div>
              )}
            </div>
            <span className="text-sm font-bold text-primary">{compliance.percent}%</span>
          </div>
          <Progress value={compliance.percent} className="h-2" />
        </div>

        {!hasRoutines ? (
          <div className="bg-charcoal p-8 rounded-lg border border-border text-center mb-6">
            <Sun className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display text-lg mb-1">No Routines Set</h3>
            <p className="text-sm text-muted-foreground">
              Select a template above to get started with daily discipline.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Morning Routine */}
            <div id="morning-routine" className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sun className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">Morning</p>
                  <h2 className="font-display text-lg">Reveille → Word → Work</h2>
                </div>
              </div>

              <div className="divide-y divide-border/30">
                {morningRoutines.map((item) => (
                  <SimpleRoutineItem
                    key={item.id}
                    id={item.id}
                    actionText={item.action_text}
                    timeSlot={getTime(item.display_order, item.time_slot)}
                    displayOrder={item.display_order}
                    completed={isRoutineCompleted(item.id)}
                    completionTime={getCompletionTime(item.id)}
                    onToggle={toggleRoutineCompletion}
                    onSaveTime={saveTimeOverride}
                  />
                ))}
                {morningCustomRoutines.map((item) => (
                  <SimpleRoutineItem
                    key={item.id}
                    id={`custom_${item.id}`}
                    actionText={item.action_text}
                    timeSlot={item.time_slot}
                    completed={isRoutineCompleted(`custom_${item.id}`)}
                    completionTime={getCompletionTime(`custom_${item.id}`)}
                    onToggle={toggleRoutineCompletion}
                    isCustom
                  />
                ))}
              </div>

              <div className="p-3">
                <AddCustomRoutineDialog
                  routineType="morning"
                  onAdd={async (data) => addCustomRoutine({ ...data, display_order: 0, is_active: true })}
                />
              </div>
            </div>

            {/* Evening Routine */}
            <div id="evening-routine" className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Moon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider font-semibold">Evening</p>
                  <h2 className="font-display text-lg">Lockdown → Reflect → Rest</h2>
                </div>
              </div>

              <div className="divide-y divide-border/30">
                {eveningRoutines.map((item) => (
                  <SimpleRoutineItem
                    key={item.id}
                    id={item.id}
                    actionText={item.action_text}
                    timeSlot={getTime(item.display_order, item.time_slot)}
                    displayOrder={item.display_order}
                    completed={isRoutineCompleted(item.id)}
                    completionTime={getCompletionTime(item.id)}
                    onToggle={toggleRoutineCompletion}
                    onSaveTime={saveTimeOverride}
                  />
                ))}
                {eveningCustomRoutines.map((item) => (
                  <SimpleRoutineItem
                    key={item.id}
                    id={`custom_${item.id}`}
                    actionText={item.action_text}
                    timeSlot={item.time_slot}
                    completed={isRoutineCompleted(`custom_${item.id}`)}
                    completionTime={getCompletionTime(`custom_${item.id}`)}
                    onToggle={toggleRoutineCompletion}
                    isCustom
                  />
                ))}
              </div>

              <div className="p-3">
                <AddCustomRoutineDialog
                  routineType="evening"
                  onAdd={async (data) => addCustomRoutine({ ...data, display_order: 0, is_active: true })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Simplified Journal */}
        <div className="mt-6">
          <SimplifiedJournal
            getJournalResponse={getJournalResponse}
            saveJournalEntry={saveJournalEntry}
          />
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
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

      {/* Quick Action FAB */}
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
