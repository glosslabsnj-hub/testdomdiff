

# Optimized Free World Tab & Programs Flow

## Overview

This plan optimizes the Free World admin tab to make the Program assignment flow more intuitive. The key improvements are:

1. **Streamlined category selection** - Clear "Continue with Recommended" or "Select Different" buttons
2. **Live template preview** - When a template is selected, show a preview of the weekly structure
3. **One-click assignment** - Single "Assign & Save" button that updates the client's program
4. **Instant client dashboard reflection** - The Custom Program tile on the client's dashboard immediately shows their assigned program

---

## Part 1: Problem Analysis

### Current Issues

1. **Template Assignment UI is confusing** - The flow requires expanding a collapsible to change categories, then selecting a template, then clicking "Assign"
2. **No preview before assignment** - Admin can't see what the template looks like before assigning
3. **Feedback is unclear** - After assigning, it's not obvious the client's program was updated
4. **No "Continue with Recommended" button** - Admin must manually select even when the suggestion is correct
5. **Template assignment doesn't refresh the program view** - The week tabs below don't update after assigning

---

## Part 2: Optimized Program Tab Design

### New Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  💡 RECOMMENDED CATEGORY: Beginner Basics (92% Match)                   │
│  ───────────────────────────────────────────────────────────────────── │
│  Based on: Beginner experience • Overweight • Sedentary • 3 days       │
│                                                                         │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐│
│  │ ✓ Continue with Recommended │  │ ↓ Select Different Category     ││
│  │     Beginner Basics          │  │                                  ││
│  └──────────────────────────────┘  └──────────────────────────────────┘│
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════════│
│                                                                         │
│  SELECT TEMPLATE FROM BEGINNER BASICS                                   │
│  ───────────────────────────────────────────────────────────────────── │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ● Total Body Foundations (3 days)                                   ││
│  │   Perfect for beginners learning movement patterns                  ││
│  │   Equipment: Bodyweight, Dumbbells                                  ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │ ○ Fat Loss Fundamentals (4 days)                                    ││
│  │   Cardio-focused with strength foundations                          ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  (more templates...)                                                    │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════════│
│                                                                         │
│  📋 TEMPLATE PREVIEW                                                    │
│  ───────────────────────────────────────────────────────────────────── │
│  Week 1: Foundation Phase                                               │
│  ├── Monday: Full Body A (5 exercises)                                 │
│  ├── Tuesday: Rest Day                                                 │
│  ├── Wednesday: Full Body B (5 exercises)                              │
│  ├── Thursday: Rest Day                                                │
│  ├── Friday: Full Body C (5 exercises)                                 │
│  ├── Saturday: Active Recovery                                         │
│  └── Sunday: Rest Day                                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │            🎯 ASSIGN TEMPLATE TO JOHN                               ││
│  │  This will replace any existing program and sync to their dashboard ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════════│
│                                                                         │
│  CURRENT ASSIGNED PROGRAM (if exists)                                   │
│  Shows the week tabs with exercises (existing UI)                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Key User Flows

### Flow 1: Accept Recommended Category

1. Admin opens client's Program tab
2. Sees recommended category (e.g., "Beginner Basics - 92% Match")
3. Clicks **"Continue with Recommended"** button
4. Templates from that category appear
5. Admin selects a template (radio button)
6. Template preview appears showing week/day structure
7. Admin clicks **"Assign Template to [Client Name]"**
8. Template is copied to client's program, UI refreshes to show the assigned weeks

### Flow 2: Select Different Category

1. Admin opens client's Program tab
2. Sees recommended category but wants something different
3. Clicks **"Select Different Category"** dropdown
4. Category selector expands showing all 5 categories with match scores
5. Admin clicks a different category
6. Templates from selected category appear
7. Rest of flow same as above

### Flow 3: After Assignment

1. After clicking "Assign Template", a success toast appears
2. The "Template Preview" section collapses
3. The "Current Assigned Program" section expands automatically
4. Week tabs show the newly assigned program with all exercises
5. Client can now see their program on their dashboard

---

## Part 4: Component Changes

### Modified: ImprovedProgramTab.tsx

Major changes:
- Move TemplateAssignment inline (not as a separate card)
- Add "Continue with Recommended" and "Select Different" buttons
- Add template preview section that shows when a template is selected
- Add callback to refresh program weeks after assignment
- Show "Currently Assigned" section that auto-expands after assignment

### Modified: TemplateAssignment.tsx

Changes:
- Add `useTemplateDetails` hook to fetch template preview data
- Add preview rendering when a template is selected
- Split UI into two clear actions: "Continue with Recommended" vs "Select Different"
- Add confirmation text showing what will happen
- Call `refetch` on the parent's `useClientProgram` after successful assignment

### Hook Changes: useProgramTemplates.ts

Changes:
- Update `useAssignTemplate` to invalidate `["client-program"]` query (already does this)
- Ensure query keys are consistent so React Query properly refreshes

---

## Part 5: Implementation Details

### New State in TemplateAssignment

```typescript
const [mode, setMode] = useState<"initial" | "selecting" | "preview">("initial");
const [continueWithRecommended, setContinueWithRecommended] = useState(false);
```

### Template Preview Component

```typescript
function TemplatePreview({ templateId }: { templateId: string }) {
  const { data, isLoading } = useTemplateDetails(templateId);
  
  if (isLoading) return <Skeleton />;
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {data.weeks.map((week) => (
        <div key={week.id}>
          <h4>Week {week.week_number}: {week.title}</h4>
          <ul>
            {data.days
              .filter((d) => d.week_id === week.id)
              .map((day) => (
                <li key={day.id}>
                  {day.day_of_week}: {day.is_rest_day ? "Rest Day" : day.workout_name}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Assignment Button Logic

```typescript
const handleAssign = async () => {
  await assignTemplate.mutateAsync({
    clientId: client.user_id,
    templateId: selectedTemplateId,
    suggestedCategoryId: recommendedCategory?.category.id,
    matchScore: recommendedCategory?.score,
  });
  
  // Trigger parent refetch so weeks update
  onAssigned();
  
  // Reset state
  setMode("initial");
  setSelectedTemplateId(null);
};
```

---

## Part 6: Client Dashboard Update

The client's Custom Program tile (`src/pages/dashboard/CustomProgram.tsx`) already uses `useClientProgram(user?.id)` which fetches from `client_program_weeks`, `client_program_days`, and `client_program_exercises`. When the admin assigns a template:

1. `useAssignTemplate` deletes existing weeks and copies template to client tables
2. The query invalidation refreshes data
3. Next time client views their dashboard, they see the new program

No changes needed to `CustomProgram.tsx` - it will automatically reflect the assigned program.

---

## Part 7: Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/coaching/ImprovedProgramTab.tsx` | Simplify layout, add onAssigned callback, auto-refresh weeks |
| `src/components/admin/coaching/TemplateAssignment.tsx` | Complete redesign with new flow, template preview, clear actions |
| `src/hooks/useProgramTemplates.ts` | Add `useTemplateDetails` to export list if not already (it exists) |

---

## Part 8: UI Text Updates

### Before Assignment
- "Continue with Recommended" button → green, prominent
- "Select Different Category" → outline, secondary
- Template selection: "Select a template to preview"
- Preview section: "Preview: [Template Name]"

### Assignment Button
- Primary: "Assign [Template Name] to [Client First Name]"
- Subtext: "This will replace any existing program"

### After Assignment
- Toast: "✓ [Template Name] assigned to [Client Name]"
- Section header: "[Client Name]'s Current Program"

---

## Summary

| Feature | Implementation |
|---------|----------------|
| Continue with Recommended | Button that auto-selects category |
| Select Different Category | Dropdown that shows all 5 with scores |
| Template Preview | Shows week/day structure before assigning |
| Single Assign Button | Clear action with client name |
| Auto-refresh after assignment | Calls refetch on useClientProgram |
| Client dashboard sync | Automatic via same database tables |

After this optimization, Dom can:
1. See the AI recommendation at a glance
2. Accept it with one click OR choose differently
3. Preview any template before assigning
4. Assign with confidence knowing client will see it immediately

