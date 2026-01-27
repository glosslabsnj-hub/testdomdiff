import { useState } from "react";
import { Flame, Sparkles, Library, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useContentEngine, type ContentCategory, type ContentMode, type ContentStatus, type ContentPostInput } from "@/hooks/useContentEngine";
import ContentCard from "./content-engine/ContentCard";
import ContentGeneratorModal from "./content-engine/ContentGeneratorModal";

const categories: { value: ContentCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "faith", label: "Faith" },
  { value: "discipline", label: "Discipline" },
  { value: "training", label: "Training" },
  { value: "transformations", label: "Transformations" },
  { value: "authority", label: "Authority" },
  { value: "platform", label: "Platform" },
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
            Content Engine
          </h2>
          <p className="text-sm text-muted-foreground">
            Your daily content playbook. Generate ideas, save scripts, track what you've posted.
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

      {/* Filters */}
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Mode:</span>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(v) => v && setMode(v as ContentMode | "all")}
            className="justify-start"
          >
            <ToggleGroupItem value="all" className="text-xs">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="done_for_you" className="text-xs">
              Done-For-You
            </ToggleGroupItem>
            <ToggleGroupItem value="freestyle" className="text-xs">
              Freestyle
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="sm:ml-auto">
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(v) => v && setStatus(v as ContentStatus | "all")}
              className="justify-start"
            >
              {statusFilters.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} className="text-xs">
                  {s.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={category} onValueChange={(v) => setCategory(v as ContentCategory | "all")}>
          <TabsList className="bg-charcoal border border-border flex-wrap h-auto gap-1 p-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
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
