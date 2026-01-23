import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFaithLessons } from "@/hooks/useFaithLessons";

const Faith = () => {
  const { lessons, loading } = useFaithLessons(true);
  const [currentWeek, setCurrentWeek] = useState(1);

  const currentLesson = lessons.find((l) => l.week_number === currentWeek);
  const hasContent = currentLesson && (
    currentLesson.title ||
    currentLesson.big_idea ||
    currentLesson.scripture ||
    currentLesson.teaching_content
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
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="headline-section mb-2">Mindset + Faith <span className="text-primary">Lessons</span></h1>
        <p className="text-muted-foreground mb-8">Weekly lessons on faith, discipline, and mindset.</p>

        {/* Week Selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentWeek <= 1}
            onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => {
              const lesson = lessons.find((l) => l.week_number === week);
              const isPublished = lesson?.is_published;
              return (
                <button
                  key={week}
                  onClick={() => setCurrentWeek(week)}
                  className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                    currentWeek === week
                      ? "bg-primary text-primary-foreground"
                      : isPublished
                      ? "bg-charcoal border border-border hover:border-primary/50"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  disabled={!isPublished}
                >
                  {week}
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={currentWeek >= 12}
            onClick={() => setCurrentWeek((w) => Math.min(12, w + 1))}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {!hasContent ? (
          <div className="bg-charcoal p-8 rounded-lg border border-border text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="headline-card mb-2">Week {currentWeek} Lesson Coming Soon</h3>
            <p className="text-muted-foreground">This lesson is being prepared. Check back soon!</p>
          </div>
        ) : (
          <div className="bg-card p-8 rounded-lg border border-border">
            <div className="space-y-6">
              {currentLesson.title && (
                <div>
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Week {currentWeek}</p>
                  <h2 className="headline-section">{currentLesson.title}</h2>
                </div>
              )}

              {currentLesson.big_idea && (
                <div className="p-4 bg-charcoal rounded-lg border-l-4 border-primary">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Big Idea</p>
                  <p className="text-lg font-medium">{currentLesson.big_idea}</p>
                </div>
              )}

              {currentLesson.scripture && (
                <div className="p-4 bg-charcoal rounded-lg">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Scripture</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.scripture}</p>
                </div>
              )}

              {currentLesson.teaching_content && (
                <div className="p-4 bg-charcoal rounded-lg">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Story / Teaching</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.teaching_content}</p>
                </div>
              )}

              {currentLesson.action_steps && (
                <div className="p-4 bg-charcoal rounded-lg">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Action Steps</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.action_steps}</p>
                </div>
              )}

              {currentLesson.reflection_questions && (
                <div className="p-4 bg-charcoal rounded-lg">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Reflection Questions</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{currentLesson.reflection_questions}</p>
                </div>
              )}

              {currentLesson.weekly_challenge && (
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="text-xs text-primary uppercase tracking-wider mb-1">Weekly Challenge</p>
                  <p className="font-medium">{currentLesson.weekly_challenge}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Faith;
