import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CheckIn = () => {
  const [formData, setFormData] = useState({
    weight: "",
    waist: "",
    steps: "",
    workouts: "",
    wins: "",
    struggles: "",
    changes: "",
    faithReflection: "",
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="max-w-2xl">
          <h1 className="headline-section mb-2">Weekly <span className="text-primary">Check-In</span></h1>
          <p className="text-muted-foreground mb-8">Submit your weekly accountability check-in.</p>

          <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
            <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Form</p>
            <p className="text-muted-foreground">This check-in form template can be customized by Dom.</p>
          </div>

          <div className="space-y-6 bg-card p-8 rounded-lg border border-border">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Weight (lbs)</Label><Input className="bg-charcoal" placeholder="Current weight" /></div>
              <div><Label>Waist (inches)</Label><Input className="bg-charcoal" placeholder="Waist measurement" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Avg Daily Steps</Label><Input className="bg-charcoal" placeholder="Average steps" /></div>
              <div><Label>Workouts Completed</Label><Input className="bg-charcoal" placeholder="# of workouts" /></div>
            </div>
            <div><Label>This Week's Wins</Label><Textarea className="bg-charcoal" rows={3} placeholder="What went well?" /></div>
            <div><Label>Struggles</Label><Textarea className="bg-charcoal" rows={3} placeholder="What was hard?" /></div>
            <div><Label>What Changes Next Week?</Label><Textarea className="bg-charcoal" rows={2} placeholder="Adjustments..." /></div>
            <div><Label>Faith Reflection (Optional)</Label><Textarea className="bg-charcoal" rows={2} placeholder="How did you honor God?" /></div>
            <Button variant="gold" size="lg" className="w-full gap-2"><Send className="w-4 h-4" /> Submit Check-In</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
