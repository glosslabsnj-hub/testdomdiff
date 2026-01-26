import { useState, useEffect } from "react";
import { BookOpen, History, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { format } from "date-fns";

interface SimplifiedJournalProps {
  getJournalResponse: (prompt: string) => string;
  saveJournalEntry: (prompt: string, response: string) => Promise<void>;
}

const JOURNAL_PROMPT = "What's on your mind today?";

export default function SimplifiedJournal({
  getJournalResponse,
  saveJournalEntry,
}: SimplifiedJournalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [journalHistory, setJournalHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Initialize draft from saved entry
  useEffect(() => {
    setDraft(getJournalResponse(JOURNAL_PROMPT));
  }, [getJournalResponse]);

  const handleSave = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      await saveJournalEntry(JOURNAL_PROMPT, draft.trim());
      toast({
        title: "Entry saved",
        description: "Your reflection has been recorded.",
      });
    } catch (e) {
      toast({
        title: "Error saving",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
        .limit(30);

      if (error) throw error;

      // Group by date
      const grouped = (data || []).reduce((acc: any, entry: any) => {
        const date = entry.journal_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
      }, {});

      setJournalHistory(
        Object.entries(grouped).map(([date, entries]) => ({
          date,
          entries,
        }))
      );
    } catch (e) {
      console.error("Error fetching journal history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-display text-lg">Cell Notes</h3>
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
              className="gap-2 text-muted-foreground"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Journal History</DialogTitle>
            </DialogHeader>
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : journalHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No journal entries yet.
              </p>
            ) : (
              <div className="space-y-4">
                {journalHistory.map((day: any) => (
                  <div key={day.date} className="border-b border-border pb-4 last:border-0">
                    <h4 className="font-semibold text-sm mb-2 text-primary">
                      {format(new Date(day.date), "EEEE, MMMM d")}
                    </h4>
                    {day.entries.map((entry: any) => (
                      <p key={entry.id} className="text-sm text-muted-foreground">
                        {entry.response}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What's on your mind? Wins, struggles, gratitude..."
        className="min-h-[100px] bg-charcoal border-border resize-none mb-3"
      />

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="gold"
          onClick={handleSave}
          disabled={saving || !draft.trim()}
          className="gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Entry
        </Button>
      </div>
    </div>
  );
}
