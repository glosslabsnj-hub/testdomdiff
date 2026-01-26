import { format } from "date-fns";
import {
  User,
  Phone,
  Mail,
  Target,
  Dumbbell,
  Calendar,
  AlertTriangle,
  Heart,
  Moon,
  Brain,
  Utensils,
  Mountain,
  Clock,
  Activity,
  Scale,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ClientWithSubscription } from "@/hooks/useClientAnalytics";

interface ClientIntakeTabProps {
  client: ClientWithSubscription;
}

export default function ClientIntakeTab({ client }: ClientIntakeTabProps) {
  const intakeDate = client.intake_completed_at
    ? format(new Date(client.intake_completed_at), "MMMM d, yyyy")
    : "Not completed";

  const fullName = `${client.first_name || ""} ${client.last_name || ""}`.trim() || "—";

  // Helper to render a field with icon
  const Field = ({
    icon: Icon,
    label,
    value,
    highlight = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: string | number | null | undefined;
    highlight?: boolean;
  }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className={`text-sm ${highlight ? "text-primary font-medium" : ""}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Intake Completion Status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="w-4 h-4" />
        <span>Intake completed: {intakeDate}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Information */}
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Field icon={User} label="Full Name" value={fullName} />
            <Field icon={Mail} label="Email" value={client.email} />
            <Field icon={Phone} label="Phone" value={client.phone} />
            <Field icon={Calendar} label="Age" value={client.age ? `${client.age} years old` : null} />
            <Field icon={Scale} label="Height" value={client.height} />
            <Field icon={Scale} label="Weight" value={client.weight} />
          </CardContent>
        </Card>

        {/* Body Assessment */}
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Body Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Field 
              icon={Scale} 
              label="Body Composition" 
              value={client.body_fat_estimate} 
              highlight 
            />
            <Field 
              icon={Activity} 
              label="Activity Level" 
              value={client.activity_level?.replace("_", " ")} 
              highlight 
            />
            <Field icon={Dumbbell} label="Equipment Access" value={client.equipment} />
          </CardContent>
        </Card>

        {/* Training Readiness */}
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Training Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Field 
              icon={Calendar} 
              label="Training Days/Week" 
              value={client.training_days_per_week ? `${client.training_days_per_week} days` : null}
              highlight
            />
            <Field icon={Clock} label="Experience Level" value={client.experience} highlight />
            <Field icon={Dumbbell} label="Previous Training" value={client.previous_training} />
            {client.injuries && (
              <div className="flex items-start gap-3 py-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Injuries/Limitations
                  </p>
                  <p className="text-sm text-warning">{client.injuries}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health & Lifestyle */}
        <Card className="bg-background/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Health & Lifestyle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Field icon={Moon} label="Sleep Quality" value={client.sleep_quality} />
            <Field icon={Brain} label="Stress Level" value={client.stress_level} />
            <Field icon={Utensils} label="Nutrition Style" value={client.nutrition_style} />
            {client.medical_conditions && (
              <div className="flex items-start gap-3 py-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Medical Conditions
                  </p>
                  <p className="text-sm text-destructive">{client.medical_conditions}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals & Mindset */}
        <Card className="bg-background/50 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goals & Mindset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Field icon={Target} label="Primary Goal" value={client.goal} highlight />
                <Field icon={Flame} label="Short-Term Goals (4 weeks)" value={client.short_term_goals} />
                <Field icon={Mountain} label="Long-Term Goals (3-6 months)" value={client.long_term_goals} />
              </div>
              <div className="space-y-1">
                <Field icon={AlertTriangle} label="Biggest Obstacle" value={client.biggest_obstacle} />
                <Field icon={Heart} label="Motivation" value={client.motivation} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Faith Commitment */}
        <Card className="bg-background/50 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              ✝️ Faith Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={client.faith_commitment ? "default" : "secondary"}
              className={client.faith_commitment ? "bg-primary/20 text-primary" : ""}
            >
              {client.faith_commitment ? "Committed to faith-based training" : "Not specified"}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
