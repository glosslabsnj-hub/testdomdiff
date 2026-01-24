import { Link } from "react-router-dom";
import { ArrowLeft, Briefcase, PlayCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSkillLessons } from "@/hooks/useSkillLessons";
import { useAuth } from "@/contexts/AuthContext";
import UpgradePrompt from "@/components/UpgradePrompt";

const SkillBuilding = () => {
  const { subscription } = useAuth();
  const { lessons, loading } = useSkillLessons();

  // Only transformation and coaching users can access
  const planType = subscription?.plan_type;
  if (planType === "membership") {
    return <UpgradePrompt feature="Skill-Building" upgradeTo="transformation" />;
  }

  // Filter out advanced lessons for non-coaching users
  const visibleLessons = lessons.filter(
    (l) => !l.is_advanced || planType === "coaching"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Skill <span className="text-primary">Building</span>
          </h1>
          <p className="text-muted-foreground">
            Learn money-making skills to build your hustle. New lessons released weekly.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <p className="text-sm text-primary uppercase tracking-wider">Your Path to Financial Freedom</p>
          </div>
          <p className="text-muted-foreground">
            Each week you'll learn a new skill that can generate income. From side hustles to business fundamentals—
            build the knowledge to support yourself and your family.
          </p>
        </div>

        {visibleLessons.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No skill lessons available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display text-xl flex-shrink-0">
                    {lesson.week_number}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Week {lesson.week_number}
                      </p>
                      {lesson.is_advanced && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                          Advanced
                        </Badge>
                      )}
                    </div>
                    <h3 className="headline-card mb-2">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-sm text-muted-foreground mb-4">{lesson.description}</p>
                    )}

                    {lesson.video_url && (
                      <div className="mb-4 rounded-lg overflow-hidden bg-charcoal border border-border">
                        <div className="aspect-video">
                          <iframe
                            src={lesson.video_url}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {lesson.content && (
                      <div className="p-4 rounded bg-charcoal border border-border mb-4">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lesson.content}</p>
                      </div>
                    )}

                    {lesson.action_steps && (
                      <div className="p-4 rounded bg-charcoal border border-primary/20 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <p className="text-sm text-primary font-medium">Action Steps</p>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{lesson.action_steps}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SkillBuilding;
