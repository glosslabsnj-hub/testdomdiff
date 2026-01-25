import { format } from "date-fns";
import { Search, Crown, Calendar, Dumbbell, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface CoachingClientListProps {
  clients: ClientWithSubscription[];
  selectedClient: ClientWithSubscription | null;
  onSelectClient: (client: ClientWithSubscription) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading?: boolean;
}

export default function CoachingClientList({
  clients,
  selectedClient,
  onSelectClient,
  searchQuery,
  onSearchChange,
  loading,
}: CoachingClientListProps) {
  return (
    <div className="h-full flex flex-col bg-charcoal rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-sm">Free World Clients</h3>
          <Badge variant="secondary" className="text-xs">
            {clients.length}
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 bg-background/50 border-border text-sm"
          />
        </div>
      </div>

      {/* Client List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {clients.map((client) => {
            const fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Client";
            const initials = fullName.slice(0, 2).toUpperCase();
            const isSelected = selectedClient?.id === client.id;
            const startDate = client.activeSubscription?.started_at
              ? format(new Date(client.activeSubscription.started_at), "MMM d")
              : "—";

            return (
              <button
                key={client.id}
                onClick={() => onSelectClient(client)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors",
                  isSelected
                    ? "bg-purple-500/20 border border-purple-500/40"
                    : "hover:bg-background/50 border border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={client.avatar_url || undefined} />
                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{fullName}</p>
                    
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {startDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
                        {Math.floor(Math.random() * 5) + 3}/7
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-400" />
                        {Math.floor(Math.random() * 14) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

          {clients.length === 0 && searchQuery && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No clients match "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
