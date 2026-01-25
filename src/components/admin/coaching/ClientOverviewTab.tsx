import { format } from "date-fns";
import {
  Dumbbell,
  Flame,
  TrendingDown,
  TrendingUp,
  Scale,
  Ruler,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";
import type { ClientProgressData } from "@/hooks/useClientProgress";

interface ClientOverviewTabProps {
  client: ClientWithSubscription;
  progress: ClientProgressData | null;
}

export default function ClientOverviewTab({ client, progress }: ClientOverviewTabProps) {
  const stats = progress?.stats;

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-background/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Dumbbell className="w-3.5 h-3.5" />
              This Week
            </div>
            <div className="text-2xl font-bold">{stats?.currentWeekWorkouts || 0}/7</div>
            <div className="text-xs text-muted-foreground">workouts</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              Discipline
            </div>
            <div className="text-2xl font-bold">{stats?.currentStreak || 0}</div>
            <div className="text-xs text-muted-foreground">day streak</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Scale className="w-3.5 h-3.5" />
              Weight
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {stats?.latestWeight ? `${stats.latestWeight}` : "—"}
              </span>
              {stats?.weightChange !== null && stats?.weightChange !== undefined && (
                <span
                  className={`text-xs flex items-center ${
                    stats.weightChange < 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {stats.weightChange < 0 ? (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(stats.weightChange)} lbs
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">lbs</div>
          </CardContent>
        </Card>

        <Card className="bg-background/50 border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              Compliance
            </div>
            <div className="text-2xl font-bold">{stats?.avgCompliancePct || 0}%</div>
            <div className="text-xs text-muted-foreground">average</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card className="bg-background/50 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {progress?.checkIns && progress.checkIns.length > 0 ? (
            <div className="space-y-3">
              {progress.checkIns.slice(0, 3).map((checkIn: any) => (
                <div
                  key={checkIn.id}
                  className="p-3 rounded-lg bg-charcoal border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Week {checkIn.week_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(checkIn.submitted_at), "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Weight:</span>{" "}
                      <span className="font-medium">{checkIn.weight || "—"} lbs</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Workouts:</span>{" "}
                      <span className="font-medium">{checkIn.workouts_completed || 0}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Steps:</span>{" "}
                      <span className="font-medium">
                        {checkIn.steps_avg ? checkIn.steps_avg.toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>

                  {checkIn.wins && (
                    <div className="mt-2 text-xs">
                      <span className="text-green-400 font-medium">Wins: </span>
                      <span className="text-muted-foreground">{checkIn.wins}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No check-ins yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Progress Photos Preview */}
      {progress?.progressPhotos && progress.progressPhotos.length > 0 && (
        <Card className="bg-background/50 border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {progress.progressPhotos.slice(0, 4).map((photo: any) => (
                <div
                  key={photo.id}
                  className="w-20 h-20 flex-shrink-0 rounded-lg bg-charcoal border border-border overflow-hidden"
                >
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    {photo.photo_type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
