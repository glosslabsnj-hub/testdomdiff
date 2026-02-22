import { Instagram, Twitter, Youtube, Zap, Check, Clock, Film, Send, SkipForward, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { CalendarSlot, CalendarSlotStatus } from "@/hooks/useContentCalendar";

const platformConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  instagram: { icon: Instagram, color: "text-pink-400", bg: "bg-pink-500/20 border-pink-500/30" },
  tiktok: { icon: Zap, color: "text-cyan-400", bg: "bg-cyan-500/20 border-cyan-500/30" },
  youtube: { icon: Youtube, color: "text-red-400", bg: "bg-red-500/20 border-red-500/30" },
  twitter: { icon: Twitter, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30" },
};

const statusConfig: Record<CalendarSlotStatus, { label: string; color: string; icon: React.ElementType }> = {
  planned: { label: "Planned", color: "text-muted-foreground", icon: Clock },
  drafted: { label: "Drafted", color: "text-amber-400", icon: Film },
  recorded: { label: "Recorded", color: "text-blue-400", icon: Film },
  posted: { label: "Posted", color: "text-green-400", icon: Check },
  skipped: { label: "Skipped", color: "text-muted-foreground/50", icon: SkipForward },
};

interface Props {
  slot: CalendarSlot;
  onUpdateStatus: (id: string, status: CalendarSlotStatus) => void;
  onDelete: (id: string) => void;
  onClick?: (slot: CalendarSlot) => void;
}

export default function ContentCalendarSlot({ slot, onUpdateStatus, onDelete, onClick }: Props) {
  const pConfig = platformConfig[slot.platform] || platformConfig.instagram;
  const sConfig = statusConfig[slot.status] || statusConfig.planned;
  const PlatformIcon = pConfig.icon;
  const StatusIcon = sConfig.icon;

  return (
    <div
      className={cn(
        "rounded-md border p-2 text-xs space-y-1 transition-all cursor-pointer hover:ring-1 hover:ring-orange-500/50",
        pConfig.bg,
        slot.status === "posted" && "opacity-60",
        slot.status === "skipped" && "opacity-40"
      )}
      onClick={() => onClick?.(slot)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <PlatformIcon className={cn("h-3 w-3", pConfig.color)} />
          <span className={cn("font-medium", pConfig.color)}>{slot.platform}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5">
              <StatusIcon className={cn("h-3 w-3", sConfig.color)} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(["planned", "drafted", "recorded", "posted", "skipped"] as CalendarSlotStatus[]).map((s) => {
              const sc = statusConfig[s];
              return (
                <DropdownMenuItem key={s} onClick={() => onUpdateStatus(slot.id, s)}>
                  <sc.icon className={cn("h-3 w-3 mr-2", sc.color)} />
                  {sc.label}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(slot.id)}>
              <Trash2 className="h-3 w-3 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="font-medium text-foreground line-clamp-2 leading-tight">{slot.title}</p>
      {slot.content_type && (
        <Badge variant="secondary" className="text-[9px] h-4">{slot.content_type}</Badge>
      )}
    </div>
  );
}
