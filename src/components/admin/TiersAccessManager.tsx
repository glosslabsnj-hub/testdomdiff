import { Check, X, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useClientAnalytics } from "@/hooks/useClientAnalytics";

interface TierConfig {
  id: string;
  name: string;
  displayName: string;
  price: string;
  billing: string;
  color: string;
  borderColor: string;
  features: string[];
  excludedFeatures: string[];
  upgradePath: string | null;
}

const TIERS: TierConfig[] = [
  {
    id: "membership",
    name: "Solitary Confinement",
    displayName: "Tier 1",
    price: "$49.99/month",
    billing: "Monthly subscription",
    color: "from-blue-500/10 to-blue-500/5",
    borderColor: "border-blue-500/30",
    features: [
      "Yard Time Workouts (bodyweight)",
      "Discipline Routines",
      "Basic Nutrition Guidance",
      "Warden Daily Tips",
    ],
    excludedFeatures: [
      "12-Week Sentence Program",
      "Faith Lessons",
      "Meal Plan System",
      "Progress Photos",
      "Custom Programs",
      "1:1 Coaching",
      "Direct Messaging",
    ],
    upgradePath: "General Population",
  },
  {
    id: "transformation",
    name: "General Population",
    displayName: "Tier 2",
    price: "$379.99 one-time",
    billing: "Single payment, 98-day access",
    color: "from-primary/10 to-primary/5",
    borderColor: "border-primary/30",
    features: [
      "Everything in Tier 1",
      "12-Week Sentence Program",
      "Meal Swap System",
      "Faith Lessons",
      "Progress Photos",
      "Weekly Check-Ins",
      "Community Access",
    ],
    excludedFeatures: [
      "Custom Workout Programs",
      "Custom Nutrition Plans",
      "1:1 Coaching",
      "Direct Messaging",
    ],
    upgradePath: "Free World",
  },
  {
    id: "coaching",
    name: "Free World",
    displayName: "Tier 3",
    price: "$999.99/month",
    billing: "Monthly subscription",
    color: "from-purple-500/10 to-purple-500/5",
    borderColor: "border-purple-500/30",
    features: [
      "Everything in Tier 1 & 2",
      "Custom Workout Programs",
      "Custom Nutrition Plans",
      "Direct Messaging with Coach",
      "Weekly 1:1 Sessions",
      "Advanced Skills Lessons",
      "Priority Support",
    ],
    excludedFeatures: [],
    upgradePath: null,
  },
];

const ACCESS_MATRIX = [
  { feature: "Workouts", membership: true, transformation: true, coaching: true },
  { feature: "Discipline Routines", membership: true, transformation: true, coaching: true },
  { feature: "Warden Tips", membership: true, transformation: true, coaching: true },
  { feature: "12-Week Program", membership: false, transformation: true, coaching: true },
  { feature: "Faith Lessons", membership: false, transformation: true, coaching: true },
  { feature: "Meal Plans", membership: false, transformation: true, coaching: true },
  { feature: "Progress Photos", membership: false, transformation: true, coaching: true },
  { feature: "Community", membership: false, transformation: true, coaching: true },
  { feature: "Custom Programs", membership: false, transformation: false, coaching: true },
  { feature: "1:1 Coaching", membership: false, transformation: false, coaching: true },
  { feature: "Direct Messaging", membership: false, transformation: false, coaching: true },
  { feature: "Advanced Skills", membership: false, transformation: false, coaching: true },
];

export default function TiersAccessManager() {
  const { analytics, loading } = useClientAnalytics({});

  const getMemberCount = (planType: string): number => {
    if (!analytics) return 0;
    switch (planType) {
      case "membership":
        return analytics.clientsByPlan.membership || 0;
      case "transformation":
        return analytics.clientsByPlan.transformation || 0;
      case "coaching":
        return analytics.clientsByPlan.coaching || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Tiers & Access</h2>
        <p className="text-sm text-muted-foreground mt-1">
          View pricing, access rules, and content permissions for each tier.
        </p>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => (
          <Card key={tier.id} className={`bg-gradient-to-br ${tier.color} ${tier.borderColor}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {tier.displayName}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {loading ? "..." : getMemberCount(tier.id)} active
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{tier.name}</CardTitle>
              <CardDescription>
                <span className="text-foreground font-semibold">{tier.price}</span>
                <span className="block text-xs mt-0.5">{tier.billing}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Access Includes
                </p>
                <ul className="space-y-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {tier.excludedFeatures.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Not Included
                  </p>
                  <ul className="space-y-1">
                    {tier.excludedFeatures.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <X className="h-3.5 w-3.5 text-red-400/50 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {tier.excludedFeatures.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-5">
                        +{tier.excludedFeatures.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {tier.upgradePath && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Upgrade Path: <span className="text-foreground">→ {tier.upgradePath}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Access Matrix */}
      <Card className="bg-charcoal border-border">
        <CardHeader>
          <CardTitle className="text-base">Access Matrix</CardTitle>
          <CardDescription>
            Complete breakdown of feature access by tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead className="text-center">
                    <span className="text-blue-400">Tier 1</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-primary">Tier 2</span>
                  </TableHead>
                  <TableHead className="text-center">
                    <span className="text-purple-400">Tier 3</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ACCESS_MATRIX.map((row) => (
                  <TableRow key={row.feature} className="border-border">
                    <TableCell className="font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center">
                      {row.membership ? (
                        <Unlock className="h-4 w-4 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.transformation ? (
                        <Unlock className="h-4 w-4 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.coaching ? (
                        <Unlock className="h-4 w-4 text-green-400 mx-auto" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
