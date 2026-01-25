import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { Badge } from "@/components/ui/badge";

export function CommandPalette() {
  const { open, setOpen, search, setSearch, items, handleSelect } = useCommandPalette();

  // Group items by category
  const navigationItems = items.filter((item) => item.category === "navigation");
  const quickActionItems = items.filter((item) => item.category === "quick-action");
  const settingsItems = items.filter((item) => item.category === "settings");

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search navigation..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        {quickActionItems.length > 0 && (
          <CommandGroup heading="Quick Actions">
            {quickActionItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-primary/10">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  Action
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {quickActionItems.length > 0 && navigationItems.length > 0 && <CommandSeparator />}

        {/* Navigation */}
        {navigationItems.length > 0 && (
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-muted">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {settingsItems.length > 0 && (navigationItems.length > 0 || quickActionItems.length > 0) && (
          <CommandSeparator />
        )}

        {/* Settings */}
        {settingsItems.length > 0 && (
          <CommandGroup heading="Settings">
            {settingsItems.map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(item)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="p-1.5 rounded-md bg-muted">
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.label}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>

      {/* Keyboard hint */}
      <div className="border-t border-border px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Type to search...</span>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">
            ↵
          </kbd>
          <span>to select</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono ml-2">
            esc
          </kbd>
          <span>to close</span>
        </div>
      </div>
    </CommandDialog>
  );
}
