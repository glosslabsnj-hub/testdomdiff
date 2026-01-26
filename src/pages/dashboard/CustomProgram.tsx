import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Dumbbell, 
  Clock, 
  ArrowRight, 
  Sparkles,
  MessageCircle,
  Calendar,
  FileText,
  Image,
  Video,
  Download,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardBackLink from "@/components/DashboardBackLink";
import { useEffectiveSubscription } from "@/hooks/useEffectiveSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { useClientCustomPrograms, ClientCustomProgram } from "@/hooks/useClientCustomPrograms";

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  return FileText;
};

const getFileTypeLabel = (fileType: string) => {
  if (fileType === "application/pdf") return "PDF";
  if (fileType.startsWith("image/")) return "Image";
  if (fileType.startsWith("video/")) return "Video";
  return "File";
};

const CustomProgram = () => {
  const { isCoaching, subscription } = useEffectiveSubscription();
  const { user } = useAuth();
  const { programs, loading, getSignedUrl } = useClientCustomPrograms(user?.id || null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Calculate days since signup
  const daysSinceSignup = subscription?.started_at
    ? Math.floor((Date.now() - new Date(subscription.started_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleDownload = async (program: ClientCustomProgram) => {
    setDownloadingId(program.id);
    const url = await getSignedUrl(program.file_url);
    setDownloadingId(null);
    
    if (url) {
      window.open(url, "_blank");
    }
  };

  // Filter only active programs
  const activePrograms = programs.filter(p => p.is_active);
  const hasPrograms = activePrograms.length > 0;
  
  return (
    <DashboardLayout>
      <div className="section-container py-8">
        <DashboardBackLink />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="headline-section">
              Your Custom <span className="text-primary">Program</span>
            </h1>
            {hasPrograms && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isCoaching 
              ? hasPrograms 
                ? "Your personalized training program designed by Dom, specifically for your goals."
                : "Your custom program is being built—check back soon."
              : "This section is exclusive to Free World coaching clients."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasPrograms ? (
          <>
            {/* Program Files */}
            <div className="space-y-4 mb-8">
              {activePrograms.map((program) => {
                const FileIcon = getFileIcon(program.file_type);
                const isDownloading = downloadingId === program.id;
                
                return (
                  <Card key={program.id} className="border-primary/20 hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <FileIcon className="w-7 h-7 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {program.title}
                          </h3>
                          {program.description && (
                            <p className="text-muted-foreground mb-3">
                              {program.description}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getFileTypeLabel(program.file_type)}
                          </Badge>
                        </div>

                        <Button
                          variant="gold"
                          onClick={() => handleDownload(program)}
                          disabled={isDownloading}
                          className="flex-shrink-0"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Questions CTA */}
            <Card className="bg-charcoal border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-6 h-6 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground">Questions about your program?</h4>
                      <p className="text-sm text-muted-foreground">Send Dom a message anytime</p>
                    </div>
                  </div>
                  <Button variant="goldOutline" asChild>
                    <Link to="/dashboard/messages">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message Dom
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* In Progress Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Clock className="w-3 h-3 mr-1" />
                    In Progress
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    Day {daysSinceSignup} of Coaching
                  </Badge>
                </div>
                <CardTitle className="text-2xl mt-4">
                  Your Program is Being Built
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  Dom is reviewing your intake and designing a personalized training plan 
                  specifically for you. This isn't a template—it's a fully customized 
                  program built around your goals, schedule, and experience level.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-charcoal border border-border">
                    <Dumbbell className="w-8 h-8 text-primary mb-2" />
                    <h4 className="font-semibold text-foreground mb-1">Custom Workouts</h4>
                    <p className="text-sm text-muted-foreground">
                      Tailored exercises and progressions for your body and goals
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-charcoal border border-border">
                    <Sparkles className="w-8 h-8 text-primary mb-2" />
                    <h4 className="font-semibold text-foreground mb-1">Weekly Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Program adjusts based on your weekly check-ins and progress
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-charcoal border border-border">
                    <Calendar className="w-8 h-8 text-primary mb-2" />
                    <h4 className="font-semibold text-foreground mb-1">Periodized Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      Strategic phases designed for long-term transformation
                    </p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    What to Do Now
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    While your custom program is being built, you have full access to the 12-week 
                    transformation program. Start training there and Dom will transition you to 
                    your custom plan once it's ready.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="gold" asChild>
                      <Link to="/dashboard/program">
                        <Calendar className="w-4 h-4 mr-2" />
                        Start 12-Week Program
                      </Link>
                    </Button>
                    <Button variant="goldOutline" asChild>
                      <Link to="/dashboard/messages">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message Dom
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/dashboard/program"
                className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Your Program
                    </h4>
                    <p className="text-sm text-muted-foreground">12-week transformation</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
              
              <Link
                to="/dashboard/coaching"
                className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      Coaching Portal
                    </h4>
                    <p className="text-sm text-muted-foreground">Your 1:1 access with Dom</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomProgram;
