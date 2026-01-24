import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  showBreadcrumb?: boolean;
}

// Route to display name mapping
const routeLabels: Record<string, string> = {
  dashboard: "Cell Block",
  "start-here": "Start Here",
  program: "The Sentence",
  workouts: "Yard Time",
  discipline: "Lights On/Out",
  nutrition: "Chow Hall",
  faith: "Chapel",
  "check-in": "Roll Call",
  progress: "Time Served",
  photos: "Photo Gallery",
  skills: "Work Release",
  community: "The Yard",
  "advanced-skills": "Entrepreneur Track",
  messages: "Direct Line",
  coaching: "Coaching Portal",
  settings: "Settings",
  "book-po-checkin": "Book Check-In",
};

// Coaching-tier labels
const coachingLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "start-here": "Orientation",
  program: "Your Program",
  workouts: "Training",
  discipline: "Daily Structure",
  nutrition: "Meal Planning",
  faith: "Faith & Mindset",
  "check-in": "Weekly Report",
  progress: "Progress",
  photos: "Photo Gallery",
  skills: "Career Building",
  community: "The Network",
  "advanced-skills": "Entrepreneur Track",
  messages: "Direct Line",
  coaching: "Coaching Portal",
  settings: "Settings",
};

export function DashboardLayout({ children, showBreadcrumb = true }: DashboardLayoutProps) {
  const location = useLocation();
  const { subscription } = useAuth();
  const isMobile = useIsMobile();
  const isCoaching = subscription?.plan_type === "coaching";
  
  // Parse current path into breadcrumb segments
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  // Get appropriate labels based on subscription
  const getLabel = (segment: string) => {
    if (isCoaching && coachingLabels[segment]) {
      return coachingLabels[segment];
    }
    return routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  // Build breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const label = getLabel(segment);
    
    return { path, label, isLast };
  });

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with sidebar trigger */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="flex items-center gap-4 px-4 py-2">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              
              {/* Breadcrumb */}
              {showBreadcrumb && breadcrumbItems.length > 1 && (
                <Breadcrumb className="hidden sm:flex">
                  <BreadcrumbList>
                    {breadcrumbItems.map((item, index) => (
                      <BreadcrumbItem key={item.path}>
                        {item.isLast ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <>
                            <BreadcrumbLink asChild>
                              <Link to={item.path} className="hover:text-primary transition-colors">
                                {item.label}
                              </Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                          </>
                        )}
                      </BreadcrumbItem>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
              
              {/* Spacer */}
              <div className="flex-1" />
            </div>
            
            {/* Original dashboard header content */}
            <DashboardHeader />
          </header>
          
          {/* Main content */}
          <main className={cn("flex-1", isMobile && "pb-20")}>
            {children}
          </main>
          
          <Footer />
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
