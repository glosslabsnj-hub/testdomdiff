import { Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { generateGoogleCalendarUrl, downloadICSFile, CalendarEvent } from "@/lib/calendarUtils";
import { useToast } from "@/hooks/use-toast";

interface AddToCalendarButtonProps {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const AddToCalendarButton = ({
  title,
  description,
  startTime,
  endTime,
  location,
  variant = "outline",
  size = "sm",
  className,
}: AddToCalendarButtonProps) => {
  const { toast } = useToast();
  
  const event: CalendarEvent = { 
    title, 
    description, 
    startTime, 
    endTime, 
    location 
  };

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "Opening Google Calendar",
      description: "Add the event to your calendar in the new tab.",
    });
  };

  const handleDownloadICS = () => {
    downloadICSFile(event);
    toast({
      title: "Download Started",
      description: "Open the .ics file to add to Apple Calendar or Outlook.",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <Calendar className="w-4 h-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Download .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendarButton;
