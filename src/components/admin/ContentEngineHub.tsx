import { useState } from "react";
import { Flame, Sparkles, Library, Loader2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentEngine, type ContentCategory, type ContentMode, type ContentStatus, type ContentPostInput } from "@/hooks/useContentEngine";
import ContentCard from "./content-engine/ContentCard";
import ContentGeneratorModal from "./content-engine/ContentGeneratorModal";

const categories: { value: ContentCategory | "all"; label: string; short: string }[] = [
  { value: "all", label: "All", short: "All" },
  { value: "faith", label: "Faith", short: "Faith" },
  { value: "discipline", label: "Discipline", short: "Disc" },
  { value: "training", label: "Training", short: "Train" },
  { value: "hustle", label: "Hustle", short: "Hustle" },
  { value: "controversy", label: "Controversy", short: "Hot" },
  { value: "story", label: "Story", short: "Story" },
  { value: "transformations", label: "Transformations", short: "Trans" },
  { value: "authority", label: "Authority", short: "Auth" },
  { value: "culture", label: "Culture", short: "Cult" },
  { value: "platform", label: "Platform", short: "Plat" },
];

const statusFilters: { value: ContentStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "fresh", label: "Fresh" },
  { value: "favorite", label: "Favorites" },
  { value: "used", label: "Used" },
];

export default function ContentEngineHub() {
  const [category, setCategory] = useState<ContentCategory | "all">("all");
  const [mode, setMode] = useState<ContentMode | "all">("all");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const { posts, isLoading, createPost, updateStatus, deletePost } = useContentEngine({
    category,
    mode,
    status,
  });

  const handleSave = (input: ContentPostInput) => {
    createPost.mutate(input);
  };

  const handleUpdateStatus = (id: string, newStatus: ContentStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            Content Strategy Engine
          </h2>
          <p className="text-sm text-muted-foreground">
            Your social media command center. Strategy-driven content that grows the brand — not just promotes it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setGeneratorOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        </div>
      </div>

      {/* Strategy Reminder */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="text-primary font-medium">Content Strategy:</span> Mix Hot Takes, Value Drops, Stories, Trending Formats, and Engagement Bait. Keep promos under 20%. Consistency + variety = growth.
        </p>
      </div>

      {/* Filters - Mobile Optimized */}
      <div className="space-y-3">
        {/* Mode & Status Toggles - Stack on mobile */}
        <div className="flex flex-col gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Mode:</span>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as ContentMode | "all")}
              className="flex-1 justify-start"
            >
              <ToggleGroupItem value="all" className="text-xs h-8 px-2 sm:px-3">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="done_for_you" className="text-xs h-8 px-2 sm:px-3">
                <span className="hidden sm:inline">Done-For-You</span>
                <span className="sm:hidden">DFY</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="freestyle" className="text-xs h-8 px-2 sm:px-3">
                <span className="hidden sm:inline">Freestyle</span>
                <span className="sm:hidden">Free</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Status:</span>
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(v) => v && setStatus(v as ContentStatus | "all")}
              className="flex-1 justify-start"
            >
              {statusFilters.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} className="text-xs h-8 px-2 sm:px-3">
                  {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Category Tabs - Horizontal scroll on mobile */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as ContentCategory | "all")}>
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="bg-charcoal border border-border inline-flex h-auto gap-1 p-1 min-w-max">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="text-xs h-8 px-2 sm:px-3 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                >
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.short}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 bg-charcoal" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-charcoal rounded-lg border border-border">
          <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No content yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {category !== "all" || mode !== "all" || status !== "all"
              ? "No content matches your filters. Try adjusting them."
              : "Generate your first batch of content ideas to get started."}
          </p>
          <Button
            onClick={() => setGeneratorOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Ideas
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <ContentCard
              key={post.id}
              post={post}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Generator Modal */}
      <ContentGeneratorModal
        open={generatorOpen}
        onOpenChange={setGeneratorOpen}
        onSave={handleSave}
      />
    </div>
  );
}
