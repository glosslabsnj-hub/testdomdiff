import { Hash, Trophy, Heart, Dumbbell, Utensils, Shield, Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommunityChannel } from "@/hooks/useCommunity";

const ICON_MAP: Record<string, any> = {
  hash: Hash,
  users: Users,
  trophy: Trophy,
  heart: Heart,
  dumbbell: Dumbbell,
  utensils: Utensils,
  shield: Shield,
  crown: Crown,
};

interface ChannelSidebarProps {
  channels: CommunityChannel[];
  selectedChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelSidebar({
  channels,
  selectedChannelId,
  onSelectChannel,
}: ChannelSidebarProps) {
  // Group channels by category
  const grouped = channels.reduce((acc, channel) => {
    if (!acc[channel.category]) acc[channel.category] = [];
    acc[channel.category].push(channel);
    return acc;
  }, {} as Record<string, CommunityChannel[]>);

  return (
    <div className="w-full h-full bg-charcoal border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-lg text-primary">Channels</h2>
        <p className="text-xs text-muted-foreground">Connect with the community</p>
      </div>

      <div className="p-2 space-y-4">
        {Object.entries(grouped).map(([category, categoryChannels]) => (
          <div key={category}>
            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {category}
            </p>
            <div className="space-y-0.5">
              {categoryChannels.map((channel) => {
                const Icon = ICON_MAP[channel.icon] || Hash;
                const isSelected = selectedChannelId === channel.id;
                const isPremium = channel.min_tier === "coaching";

                return (
                  <button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-colors text-left",
                      isSelected
                        ? "bg-primary/20 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isPremium && "text-purple-400"
                    )} />
                    <span className="text-sm truncate">
                      {channel.name.replace(/-/g, " ")}
                    </span>
                    {isPremium && (
                      <Crown className="w-3 h-3 text-purple-400 ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
