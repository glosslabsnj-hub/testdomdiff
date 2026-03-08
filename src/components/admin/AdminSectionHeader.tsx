import { cn } from "@/lib/utils";

interface AdminSectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor?: string;
  action?: React.ReactNode;
}

export default function AdminSectionHeader({
  icon: Icon,
  title,
  description,
  iconColor = "text-primary",
  action,
}: AdminSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0",
            iconColor
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground leading-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
