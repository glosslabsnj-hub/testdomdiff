import { format } from "date-fns";
import { X, Mail, Phone, Calendar, Target, Dumbbell, Heart, AlertTriangle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientDetailPanelProps {
  client: ClientWithSubscription | null;
  open: boolean;
  onClose: () => void;
}

const ClientDetailPanel = ({ client, open, onClose }: ClientDetailPanelProps) => {
  if (!client) return null;

  const getInitials = () => {
    const first = client.first_name?.[0] || "";
    const last = client.last_name?.[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "cancelled":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case "transformation":
        return <Badge className="bg-primary/20 text-primary border-primary/30">General Population</Badge>;
      case "membership":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Solitary Confinement</Badge>;
      case "coaching":
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Free World Coaching</Badge>;
      default:
        return <Badge variant="secondary">{planType}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle className="text-xl">
                {client.first_name || "Unknown"} {client.last_name || ""}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {client.email}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Contact Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Member since {format(new Date(client.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subscription Status */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription Status
            </h3>
            {client.activeSubscription ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPlanBadge(client.activeSubscription.plan_type)}
                  {getStatusBadge(client.activeSubscription.status)}
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Started:</span>{" "}
                    {format(new Date(client.activeSubscription.started_at), "MMM d, yyyy")}
                  </p>
                  {client.activeSubscription.expires_at && (
                    <p>
                      <span className="text-muted-foreground">Expires:</span>{" "}
                      {format(new Date(client.activeSubscription.expires_at), "MMM d, yyyy")}
                      {client.daysRemaining !== null && (
                        <span className="text-primary ml-2">({client.daysRemaining} days left)</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active subscription</p>
            )}
          </div>

          <Separator />

          {/* Intake Status */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Intake Status
            </h3>
            {client.intake_completed_at ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Completed {format(new Date(client.intake_completed_at), "MMM d, yyyy")}
              </Badge>
            ) : (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Not Completed
              </Badge>
            )}
          </div>

          {client.intake_completed_at && (
            <>
              <Separator />

              {/* Intake Responses */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Intake Responses
                </h3>
                <div className="space-y-4">
                  {/* Physical Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Age</p>
                      <p className="font-semibold">{client.age || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Height</p>
                      <p className="font-semibold">{client.height || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-semibold">{client.weight ? `${client.weight} lbs` : "—"}</p>
                    </div>
                  </div>

                  {/* Goal */}
                  {client.goal && (
                    <div className="flex items-start gap-3">
                      <Target className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Primary Goal</p>
                        <p className="font-medium">{client.goal}</p>
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {client.experience && (
                    <div className="flex items-start gap-3">
                      <Dumbbell className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Experience Level</p>
                        <p className="font-medium">{client.experience}</p>
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {client.equipment && (
                    <div className="flex items-start gap-3">
                      <Dumbbell className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Available Equipment</p>
                        <p className="font-medium">{client.equipment}</p>
                      </div>
                    </div>
                  )}

                  {/* Injuries */}
                  {client.injuries && (
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Injuries/Limitations</p>
                        <p className="font-medium">{client.injuries}</p>
                      </div>
                    </div>
                  )}

                  {/* Faith Commitment */}
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Faith Commitment</p>
                      <p className="font-medium">
                        {client.faith_commitment ? "Committed" : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Subscription History */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription History
            </h3>
            {client.subscriptions.length > 0 ? (
              <div className="space-y-3">
                {client.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-muted/50 rounded-lg p-3 text-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {getPlanBadge(sub.plan_type)}
                      {getStatusBadge(sub.status)}
                    </div>
                    <div className="text-muted-foreground space-y-1">
                      <p>Started: {format(new Date(sub.started_at), "MMM d, yyyy")}</p>
                      {sub.expires_at && (
                        <p>Expires: {format(new Date(sub.expires_at), "MMM d, yyyy")}</p>
                      )}
                      {sub.cancelled_at && (
                        <p>Cancelled: {format(new Date(sub.cancelled_at), "MMM d, yyyy")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No subscription history</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetailPanel;
