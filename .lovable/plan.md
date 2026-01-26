

# Rename "Yard Time" → "Iron Pile" Across Entire App

## Overview

Replace all instances of "Yard Time" with "Iron Pile" throughout the codebase. This resolves confusion between the workout templates ("Iron Pile") and the community feature ("The Yard").

---

## Files to Update

### Frontend Components & Pages

| File | Changes |
|------|---------|
| `src/pages/dashboard/Dashboard.tsx` | Tooltip, tile title, and comments |
| `src/components/DashboardSidebar.tsx` | Navigation item title for Solitary users |
| `src/components/MobileBottomNav.tsx` | Bottom nav label for Solitary users |
| `src/pages/dashboard/Workouts.tsx` | Page headline |
| `src/pages/dashboard/StartHere.tsx` | CTA label ("Start Iron Pile") |
| `src/components/OrientationModal.tsx` | Feature list items for Solitary + Gen Pop |
| `src/hooks/useOnboardingTooltips.ts` | Tooltip descriptions |
| `src/components/OnboardingVideoWithVisuals.tsx` | Screenshot labels |
| `src/components/dashboard/TodayFocusCard.tsx` | Pill label |
| `src/components/TodaysFocus.tsx` | Task list label |
| `src/components/dashboard/RollCallToday.tsx` | Task title |
| `src/components/discipline/QuickActionFAB.tsx` | Completion message |
| `src/components/GlobalQuickAction.tsx` | Completion message |
| `src/components/WeeklyProgressCard.tsx` | Workout label function |
| `src/components/dashboard/WeekSentenceCard.tsx` | Card title for Solitary |
| `src/components/admin/PrisonJourneyBlueprint.tsx` | Journey step description |
| `src/components/admin/AuditSitemap.tsx` | Route name in sitemap |

### Backend Edge Functions

| File | Changes |
|------|---------|
| `supabase/functions/warden-chat/index.ts` | Navigation object, tier guidance text |
| `supabase/functions/warden-brief/index.ts` | workouts label, forbiddenTerms array, sanitization regex |
| `supabase/functions/generate-onboarding-script/index.ts` | Solitary tier terminology in script generation |

---

## Specific Changes

### Dashboard Tile (Dashboard.tsx)
```
Before: "Yard Time" → After: "Iron Pile"
Before: "Your workout library — train like you mean it"
After:  "Your workout library — hit the Iron Pile"
```

### Sidebar Navigation (DashboardSidebar.tsx)
```
Before: isMembership ? "Yard Time" : "Workout Library"
After:  isMembership ? "Iron Pile" : "Workout Library"
```

### Mobile Bottom Nav (MobileBottomNav.tsx)
```
Before: label: "Yard Time"
After:  label: "Iron Pile"
```

### Workouts Page Header (Workouts.tsx)
```
Before: "Yard Time" — Training Templates
After:  "Iron Pile" — Training Templates
```

### Start Here CTA (StartHere.tsx)
```
Before: "Start Yard Time"
After:  "Start Iron Pile"
```

### Orientation Modal (OrientationModal.tsx)
```
Before: "Yard Time", description: "4 bodyweight workout templates"
After:  "Iron Pile", description: "4 bodyweight workout templates"
```

### Completion Messages
```
Before: "Yard time earned."
After:  "Iron Pile complete." (or "Iron earned." for brevity)
```

### Week Sentence Card (WeekSentenceCard.tsx)
```
Before: "This Week's Yard Time"
After:  "This Week's Iron Pile"
```

### Warden AI (warden-chat/index.ts)
```
Before: workouts: "Yard Time", program: "Yard Time"
After:  workouts: "Iron Pile", program: "Iron Pile"
Before: primaryAction: "[Yard Time](/dashboard/workouts)"
After:  primaryAction: "[Iron Pile](/dashboard/workouts)"
```

### Warden Brief (warden-brief/index.ts)
```
Before: forbiddenTerms: ["yard time"]
After:  forbiddenTerms: ["iron pile"]
Before: Sanitization replaces "yard time" → "The Sentence"
After:  Sanitization replaces "iron pile" → "The Sentence" (for Gen Pop users)
```

### Onboarding Script Generator (generate-onboarding-script/index.ts)
```
Before: "Yard Time (4 bodyweight workouts)"
After:  "Iron Pile (4 bodyweight workouts)"
```

---

## Summary

**Total files to update: 19**
- 16 frontend files (components, pages, hooks)
- 3 backend edge functions

All instances of "Yard Time" will become "Iron Pile" while maintaining proper tier logic (Iron Pile for Solitary/membership, The Sentence for Gen Pop, Training for Coaching).

