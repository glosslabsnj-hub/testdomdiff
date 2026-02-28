import { useState } from "react";
import { Library, Sparkles, Instagram, Twitter, Youtube, Zap, CalendarPlus, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useContentEngine,
  type ContentCategory,
  type ContentMode,
  type ContentStatus,
  type ContentPostInput,
} from "@/hooks/useContentEngine";
import ContentCard from "@/components/admin/content-engine/ContentCard";
import { downloadCSV } from "@/lib/exportUtils";

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

const PLATFORMS_FILTER = [
  { value: "all", label: "All", icon: null },
  { value: "Instagram", label: "IG", icon: Instagram },
  { value: "TikTok", label: "TT", icon: Zap },
  { value: "YouTube", label: "YT", icon: Youtube },
  { value: "Twitter", label: "X", icon: Twitter },
];

interface Props {
  onNavigateToGenerator?: () => void;
}

export default function ContentLibrary({ onNavigateToGenerator }: Props) {
  const [category, setCategory] = useState<ContentCategory | "all">("all");
  const [mode, setMode] = useState<ContentMode | "all">("all");
  const [status, setStatus] = useState<ContentStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { posts, isLoading, updateStatus, deletePost } = useContentEngine({
    category,
    mode,
    status,
  });

  const filteredPosts = (platformFilter === "all"
    ? posts
    : posts.filter((p) =>
        p.platforms.some((plat) => plat.toLowerCase() === platformFilter.toLowerCase())
      )
  ).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.hook?.toLowerCase().includes(q) ||
      p.talking_points?.some((tp) => tp.toLowerCase().includes(q))
    );
  });

  const handleUpdateStatus = (id: string, newStatus: ContentStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, hook, or talking points..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-charcoal border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-orange-500/50"
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Platform Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground shrink-0">Platform:</span>
          <ToggleGroup
            type="single"
            value={platformFilter}
            onValueChange={(v) => v && setPlatformFilter(v)}
            className="flex-1 justify-start"
          >
            {PLATFORMS_FILTER.map((p) => {
              const Icon = p.icon;
              return (
                <ToggleGroupItem key={p.value} value={p.value} className="text-xs h-8 px-2 sm:px-3 gap-1">
                  {Icon && <Icon className="h-3 w-3" />}
                  {p.label}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>

        {/* Mode & Status */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Mode:</span>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => v && setMode(v as ContentMode | "all")}
            >
              <ToggleGroupItem value="all" className="text-xs h-8 px-2">All</ToggleGroupItem>
              <ToggleGroupItem value="done_for_you" className="text-xs h-8 px-2">
                <span className="hidden sm:inline">Done-For-You</span>
                <span className="sm:hidden">DFY</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="freestyle" className="text-xs h-8 px-2">Free</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0">Status:</span>
            <ToggleGroup
              type="single"
              value={status}
              onValueChange={(v) => v && setStatus(v as ContentStatus | "all")}
            >
              {statusFilters.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} className="text-xs h-8 px-2">{s.label}</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Category Tabs */}
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

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 bg-charcoal" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 bg-charcoal rounded-lg border border-border">
          <Library className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No content found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {category !== "all" || mode !== "all" || status !== "all" || platformFilter !== "all"
              ? "No content matches your filters. Try adjusting them."
              : "Generate your first batch of content ideas."}
          </p>
          {onNavigateToGenerator && (
            <Button
              onClick={onNavigateToGenerator}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Content
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{filteredPosts.length} items</p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1 h-7"
              onClick={() => {
                downloadCSV(
                  filteredPosts.map((p) => ({
                    title: p.title || "",
                    hook: p.hook || "",
                    category: p.category || "",
                    mode: p.mode || "",
                    status: p.status || "",
                    platforms: p.platforms?.join(", ") || "",
                    talking_points: p.talking_points?.join("; ") || "",
                  })),
                  `content-library-${new Date().toISOString().split("T")[0]}.csv`,
                  [
                    { key: "title", label: "Title" },
                    { key: "hook", label: "Hook" },
                    { key: "category", label: "Category" },
                    { key: "mode", label: "Mode" },
                    { key: "status", label: "Status" },
                    { key: "platforms", label: "Platforms" },
                    { key: "talking_points", label: "Talking Points" },
                  ]
                );
              }}
            >
              <Download className="h-3 w-3" /> Export CSV
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPosts.map((post) => (
              <ContentCard
                key={post.id}
                post={post}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
