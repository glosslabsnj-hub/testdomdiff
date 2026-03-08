import { useState } from "react";
import { Menu, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { navGroups, sectionTitles, type AdminSection, type BadgeCounts } from "./adminNavConfig";

interface AdminMobileDrawerProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  badges: BadgeCounts;
}

export default function AdminMobileDrawer({
  activeSection,
  onSectionChange,
  badges,
}: AdminMobileDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (section: AdminSection) => {
    onSectionChange(section);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 bg-charcoal">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left text-base">Admin Panel</SheetTitle>
              <p className="text-xs text-muted-foreground text-left">
                {sectionTitles[activeSection]}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Quick Stats Banner */}
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Check-Ins</p>
              <p className={cn(
                "text-lg font-bold",
                badges.pendingCheckIns > 0 ? "text-destructive" : "text-foreground"
              )}>
                {badges.pendingCheckIns}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Coaching</p>
              <p className="text-lg font-bold text-purple-400">{badges.coachingClients}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Support</p>
              <p className={cn(
                "text-lg font-bold",
                badges.pendingSupportTickets > 0 ? "text-yellow-400" : "text-foreground"
              )}>
                {badges.pendingSupportTickets}
              </p>
            </div>
          </div>
        </div>

        {/* Flat scrollable nav */}
        <div className="overflow-y-auto h-[calc(100dvh-180px)] py-2">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-1">
              {/* Group label as divider */}
              <p className={cn("text-xs font-semibold uppercase tracking-wider px-4 pt-3 pb-1.5", group.color)}>
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                      "min-h-[52px]",
                      isActive
                        ? cn("bg-muted/50", group.color)
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", group.color)} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {badgeCount > 0 && (
                      <Badge className={cn("text-xs h-6 min-w-6 px-2", item.badgeColor)}>
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
