import { useState } from "react";
import {
  Users,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Send,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Instagram,
  MessageCircle,
  Clock,
  Star,
  Search,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exportUtils";

interface CollabProspect {
  id: string;
  handle: string;
  name: string | null;
  platform: string;
  follower_count: number | null;
  niche: string | null;
  status: string;
  outreach_dm: string | null;
  collab_idea: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "prospect", label: "Prospect", color: "bg-gray-500/20 text-gray-400" },
  { value: "researching", label: "Researching", color: "bg-blue-500/20 text-blue-400" },
  { value: "reached_out", label: "Reached Out", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "responded", label: "Responded", color: "bg-green-500/20 text-green-400" },
  { value: "confirmed", label: "Confirmed", color: "bg-purple-500/20 text-purple-400" },
  { value: "completed", label: "Completed", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "passed", label: "Passed", color: "bg-red-500/20 text-red-400" },
];

const NICHE_OPTIONS = [
  "Fitness", "Faith", "Business/Hustle", "Motivation", "Street/Culture",
  "MMA/Fighting", "Bodybuilding", "Lifestyle", "Comedy", "Music",
  "Fashion", "Nutrition", "Mental Health", "Parenting", "Other",
];

export default function CollabFinder() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [generatingDM, setGeneratingDM] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState("");

  // Form state
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [followerCount, setFollowerCount] = useState("");
  const [niche, setNiche] = useState("Fitness");
  const [collabIdea, setCollabIdea] = useState("");
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: prospects = [], isLoading } = useQuery({
    queryKey: ["collab-prospects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("collab_prospects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") return [];
        throw error;
      }
      return data as CollabProspect[];
    },
    retry: false,
  });

  const addProspect = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("collab_prospects")
        .insert({
          handle: handle.replace("@", ""),
          name: name || null,
          platform,
          follower_count: followerCount ? parseInt(followerCount) : null,
          niche,
          collab_idea: collabIdea || null,
          notes: notes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collab-prospects"] });
      toast.success("Prospect added!");
      setHandle(""); setName(""); setFollowerCount(""); setCollabIdea(""); setNotes("");
      setShowAddForm(false);
    },
    onError: () => toast.error("Failed to add prospect"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "reached_out") updates.last_contacted_at = new Date().toISOString();
      const { error } = await (supabase as any)
        .from("collab_prospects")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collab-prospects"] });
      toast.success("Status updated");
    },
  });

  const deleteProspect = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("collab_prospects")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collab-prospects"] });
      toast.success("Prospect removed");
    },
  });

  const generateDM = async (prospect: CollabProspect) => {
    setGeneratingDM(prospect.id);
    try {
      const { data, error } = await supabase.functions.invoke("social-engagement-coach", {
        body: {
          mode: "collab_dm",
          target_handle: prospect.handle,
          target_name: prospect.name,
          target_niche: prospect.niche,
          target_followers: prospect.follower_count,
          collab_idea: prospect.collab_idea,
        },
      });
      if (error) throw error;

      // Save the DM to the prospect
      const dmText = data.result?.dm_direct || "";
      await (supabase as any)
        .from("collab_prospects")
        .update({ outreach_dm: JSON.stringify(data.result), updated_at: new Date().toISOString() })
        .eq("id", prospect.id);

      queryClient.invalidateQueries({ queryKey: ["collab-prospects"] });
      toast.success("Outreach DMs generated!");
      setExpandedId(prospect.id);
    } catch (err) {
      toast.error("Failed to generate DMs");
      console.error(err);
    } finally {
      setGeneratingDM(null);
    }
  };

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast.success("Copied!");
  };

  const filteredProspects = filterStatus === "all"
    ? prospects
    : prospects.filter((p) => p.status === filterStatus);

  const statusCounts = prospects.reduce((acc: Record<string, number>, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          <div>
            <h3 className="text-lg font-bold">Collab Finder</h3>
            <p className="text-xs text-muted-foreground">
              Find creators to collab with. Generate outreach DMs. Track everything.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {prospects.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1"
              onClick={() => {
                downloadCSV(
                  prospects.map((p) => ({
                    handle: `@${p.handle}`,
                    name: p.name || "",
                    platform: p.platform,
                    followers: p.follower_count || "",
                    niche: p.niche || "",
                    status: p.status,
                    collab_idea: p.collab_idea || "",
                    notes: p.notes || "",
                    last_contacted: p.last_contacted_at ? new Date(p.last_contacted_at).toLocaleDateString() : "",
                  })),
                  `collab-prospects-${new Date().toISOString().split("T")[0]}.csv`,
                  [
                    { key: "handle", label: "Handle" },
                    { key: "name", label: "Name" },
                    { key: "platform", label: "Platform" },
                    { key: "followers", label: "Followers" },
                    { key: "niche", label: "Niche" },
                    { key: "status", label: "Status" },
                    { key: "collab_idea", label: "Collab Idea" },
                    { key: "notes", label: "Notes" },
                    { key: "last_contacted", label: "Last Contacted" },
                  ]
                );
              }}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )}
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white gap-1.5"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Prospect
          </Button>
        </div>
      </div>

      {/* How This Works - explained simply */}
      <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-3">
        <p className="text-xs font-bold text-purple-400 mb-1">How This Works (Simple Version):</p>
        <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
          <li><span className="font-medium text-foreground">Add a creator</span> you want to collab with (their @handle, how many followers they have, what they're about)</li>
          <li><span className="font-medium text-foreground">Hit "Generate DM"</span> and I'll write 3 different outreach messages in YOUR voice — pick the one that feels right</li>
          <li><span className="font-medium text-foreground">Copy the DM</span>, send it on Instagram, and update the status here so you can track who you've reached out to</li>
          <li><span className="font-medium text-foreground">Follow up</span> — if they don't reply in 3-5 days, use the follow-up message I generate</li>
        </ol>
      </div>

      {/* Add Prospect Form */}
      {showAddForm && (
        <div className="rounded-lg bg-charcoal border border-border p-4 space-y-3">
          <h4 className="text-sm font-semibold">Add New Prospect</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Instagram Handle</Label>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@theirhandle"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Name (optional)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Their name"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Follower Count</Label>
              <Input
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                placeholder="e.g., 100000"
                type="number"
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Their Niche</Label>
              <Select value={niche} onValueChange={setNiche}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NICHE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={n}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Collab Idea (optional — what would you do together?)</Label>
            <Input
              value={collabIdea}
              onChange={(e) => setCollabIdea(e.target.value)}
              placeholder="e.g., Joint live workout, challenge video, podcast episode"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this creator"
              className="bg-background"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => addProspect.mutate()}
              disabled={!handle.trim() || addProspect.isPending}
              className="bg-purple-500 hover:bg-purple-600 text-white gap-1.5"
            >
              {addProspect.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Add Prospect
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilterStatus("all")}
          className={cn(
            "text-xs px-2.5 py-1 rounded-full border transition-colors",
            filterStatus === "all" ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All ({prospects.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors",
              filterStatus === s.value ? "border-purple-500 text-purple-400 bg-purple-500/10" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {s.label} ({statusCounts[s.value] || 0})
          </button>
        ))}
      </div>

      {/* Prospects List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredProspects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm text-muted-foreground">No prospects yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add creators you want to collab with to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProspects.map((prospect) => {
            const isExpanded = expandedId === prospect.id;
            const statusInfo = STATUS_OPTIONS.find((s) => s.value === prospect.status);
            let dmData: any = null;
            if (prospect.outreach_dm) {
              try { dmData = JSON.parse(prospect.outreach_dm); } catch {}
            }

            return (
              <div key={prospect.id} className="rounded-lg bg-charcoal border border-border overflow-hidden">
                <button
                  className="w-full p-3 flex items-center gap-3 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : prospect.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <Instagram className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">@{prospect.handle}</span>
                      {prospect.name && <span className="text-xs text-muted-foreground">({prospect.name})</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className={cn("text-[10px]", statusInfo?.color)}>
                        {statusInfo?.label}
                      </Badge>
                      {prospect.niche && (
                        <span className="text-[10px] text-muted-foreground">{prospect.niche}</span>
                      )}
                      {prospect.follower_count && (
                        <span className="text-[10px] text-muted-foreground">
                          {prospect.follower_count >= 1000000
                            ? `${(prospect.follower_count / 1000000).toFixed(1)}M`
                            : prospect.follower_count >= 1000
                              ? `${(prospect.follower_count / 1000).toFixed(0)}K`
                              : prospect.follower_count} followers
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1 text-purple-400 hover:text-purple-300"
                      onClick={(e) => { e.stopPropagation(); generateDM(prospect); }}
                      disabled={generatingDM === prospect.id}
                    >
                      {generatingDM === prospect.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                      {dmData ? "Regenerate DM" : "Generate DM"}
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
                    {/* Status Changer */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs shrink-0">Status:</Label>
                      <Select
                        value={prospect.status}
                        onValueChange={(v) => updateStatus.mutate({ id: prospect.id, status: v })}
                      >
                        <SelectTrigger className="bg-background h-7 text-xs w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {prospect.collab_idea && (
                      <div className="rounded bg-background/50 p-2 border border-border">
                        <p className="text-[10px] uppercase text-muted-foreground font-medium">Collab Idea:</p>
                        <p className="text-xs mt-0.5">{prospect.collab_idea}</p>
                      </div>
                    )}

                    {/* Generated DMs */}
                    {dmData && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-purple-400">Outreach DMs (pick one):</p>

                        {dmData.dm_direct && (
                          <DMCard
                            label="The Direct One"
                            description="Straight to the point. Confident. Let's work."
                            text={dmData.dm_direct}
                            copiedField={copiedField}
                            onCopy={(text, field) => copyText(text, field)}
                            fieldKey={`${prospect.id}-direct`}
                          />
                        )}
                        {dmData.dm_relationship && (
                          <DMCard
                            label="The Relationship Builder"
                            description="Build genuine connection first. Collab mention is subtle."
                            text={dmData.dm_relationship}
                            copiedField={copiedField}
                            onCopy={(text, field) => copyText(text, field)}
                            fieldKey={`${prospect.id}-relationship`}
                          />
                        )}
                        {dmData.dm_value && (
                          <DMCard
                            label="The Value Proposition"
                            description="Lead with what's in it for both of you."
                            text={dmData.dm_value}
                            copiedField={copiedField}
                            onCopy={(text, field) => copyText(text, field)}
                            fieldKey={`${prospect.id}-value`}
                          />
                        )}
                        {dmData.follow_up && (
                          <DMCard
                            label="Follow-Up (send after 3-5 days)"
                            description="If they didn't reply, send this."
                            text={dmData.follow_up}
                            copiedField={copiedField}
                            onCopy={(text, field) => copyText(text, field)}
                            fieldKey={`${prospect.id}-followup`}
                          />
                        )}

                        {dmData.collab_ideas?.length > 0 && (
                          <div className="rounded bg-background/50 p-2 border border-border">
                            <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1">Collab Ideas:</p>
                            <ul className="space-y-0.5">
                              {dmData.collab_ideas.map((idea: string, i: number) => (
                                <li key={i} className="text-xs flex items-start gap-1.5">
                                  <Star className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                                  {idea}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {dmData.strategy_notes && (
                          <div className="rounded bg-background/50 p-2 border border-border">
                            <p className="text-[10px] uppercase text-muted-foreground font-medium">Strategy Notes:</p>
                            <p className="text-xs mt-0.5 italic">{dmData.strategy_notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delete */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs gap-1 text-red-400 hover:text-red-300"
                        onClick={() => deleteProspect.mutate(prospect.id)}
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DMCard({
  label,
  description,
  text,
  copiedField,
  onCopy,
  fieldKey,
}: {
  label: string;
  description: string;
  text: string;
  copiedField: string;
  onCopy: (text: string, field: string) => void;
  fieldKey: string;
}) {
  return (
    <div className="rounded-lg bg-background/50 border border-border p-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-xs font-semibold">{label}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[10px] gap-1"
          onClick={() => onCopy(text, fieldKey)}
        >
          {copiedField === fieldKey ? (
            <Check className="h-2.5 w-2.5 text-green-400" />
          ) : (
            <Copy className="h-2.5 w-2.5" />
          )}
          Copy
        </Button>
      </div>
      <p className="text-xs whitespace-pre-wrap bg-charcoal rounded p-2 mt-1">{text}</p>
    </div>
  );
}
