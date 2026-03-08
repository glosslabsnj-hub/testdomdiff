import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  variant?: "cards" | "list" | "grid" | "detail" | "workout" | "table" | "page";
  count?: number;
}

// Card skeleton with header and content — steel-plate styling
function CardSkeleton() {
  return (
    <div className="cell-block p-0">
      <div className="p-4 pb-2">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="px-4 pb-4">
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// List item skeleton
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 cell-block">
      <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

// Grid item skeleton (for workouts, lessons)
function GridItemSkeleton() {
  return (
    <div className="cell-block overflow-hidden">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="pt-2">
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

// Detail page skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="cell-block p-6 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    </div>
  );
}

// Workout skeleton with exercises
function WorkoutSkeleton() {
  return (
    <div className="space-y-4">
      <div className="cell-block">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Table skeleton
function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="cell-block overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 p-4">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Full page skeleton — header bar + card grid (used by Suspense fallback)
function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header bar skeleton */}
      <div className="border-b border-border bg-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Content area skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4 sm:space-y-6">
        {/* Page title */}
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-8 w-40 sm:w-48" />
          <Skeleton className="h-4 w-52 sm:w-64" />
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Content list */}
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardSkeleton({ variant = "cards", count = 4 }: DashboardSkeletonProps) {
  switch (variant) {
    case "cards":
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );
    case "list":
      return (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      );
    case "grid":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <GridItemSkeleton key={i} />
          ))}
        </div>
      );
    case "detail":
      return <DetailSkeleton />;
    case "workout":
      return <WorkoutSkeleton />;
    case "table":
      return <TableSkeleton count={count} />;
    case "page":
      return <PageSkeleton />;
    default:
      return (
        <div className="flex items-center justify-center py-12">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      );
  }
}

// Export individual skeletons for custom use
export { CardSkeleton, ListItemSkeleton, GridItemSkeleton, DetailSkeleton, WorkoutSkeleton, TableSkeleton, PageSkeleton };
