import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface DashboardSkeletonProps {
  variant?: "cards" | "list" | "grid" | "detail" | "workout" | "table";
  count?: number;
}

// Card skeleton with header and content
function CardSkeleton() {
  return (
    <Card className="bg-charcoal border-border">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 bg-muted" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 bg-muted mb-2" />
        <Skeleton className="h-3 w-20 bg-muted" />
      </CardContent>
    </Card>
  );
}

// List item skeleton
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-charcoal rounded-lg border border-border">
      <Skeleton className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4 bg-muted" />
        <Skeleton className="h-3 w-1/2 bg-muted" />
      </div>
      <Skeleton className="h-8 w-20 bg-muted rounded-md" />
    </div>
  );
}

// Grid item skeleton (for workouts, lessons)
function GridItemSkeleton() {
  return (
    <Card className="bg-charcoal border-border overflow-hidden">
      <Skeleton className="h-32 w-full bg-muted" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4 bg-muted" />
        <Skeleton className="h-3 w-full bg-muted" />
        <Skeleton className="h-3 w-2/3 bg-muted" />
        <div className="pt-2">
          <Skeleton className="h-8 w-full bg-muted rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}

// Detail page skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 bg-muted" />
          <Skeleton className="h-4 w-32 bg-muted" />
        </div>
      </div>
      <Card className="bg-charcoal border-border">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-full bg-muted" />
          <Skeleton className="h-4 w-3/4 bg-muted" />
          <Skeleton className="h-32 w-full bg-muted rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

// Workout skeleton with exercises
function WorkoutSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 bg-muted" />
              <Skeleton className="h-3 w-24 bg-muted" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg">
              <Skeleton className="h-8 w-8 rounded bg-muted" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-3 w-20 bg-muted" />
              </div>
              <Skeleton className="h-6 w-16 bg-muted rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Table skeleton
function TableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-charcoal rounded-lg border border-border overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-1/4 bg-muted" />
          <Skeleton className="h-4 w-1/4 bg-muted" />
        </div>
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-border last:border-0 p-4">
          <div className="flex gap-4 items-center">
            <Skeleton className="h-4 w-1/4 bg-muted" />
            <Skeleton className="h-4 w-1/4 bg-muted" />
            <Skeleton className="h-6 w-16 bg-muted rounded-full" />
            <Skeleton className="h-6 w-16 bg-muted rounded-full" />
          </div>
        </div>
      ))}
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
    default:
      return (
        <div className="flex items-center justify-center py-12">
          <Skeleton className="h-8 w-8 rounded-full bg-muted" />
        </div>
      );
  }
}

// Export individual skeletons for custom use
export { CardSkeleton, ListItemSkeleton, GridItemSkeleton, DetailSkeleton, WorkoutSkeleton, TableSkeleton };
