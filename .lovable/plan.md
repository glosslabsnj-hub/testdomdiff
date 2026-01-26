

# Free World Admin Reorganization

## Overview

This plan promotes "Free World" from a sub-tab inside the "People" hub to its own **top-level tab** in the Admin Dashboard. It creates a dedicated, premium client management experience with a streamlined layout featuring a client sidebar with sub-tabs for each client, and a completely redesigned Program tab that's more user-friendly for the admin.

---

## Part 1: New Admin Tab Structure

### Current Structure
```text
[Command Center] [People] [Commissary] [Content CMS] [Settings]
                    └── All Clients
                    └── Check-Ins
                    └── Free World (coaching)  ← MOVING
                    └── Support
```

### New Structure
```text
[Command Center] [People] [Free World] [Commissary] [Content CMS] [Settings]
                    └── All Clients          └── Client sidebar
                    └── Check-Ins                with detail panel
                    └── Support
```

The Free World tab gets its own purple-accented icon and displays the count of active coaching clients.

---

## Part 2: Free World Tab Layout

### Desktop View (Split-Pane)

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  FREE WORLD COACHING                                        [+ New Client] │
├──────────────────┬───────────────────────────────────────────────────────┤
│                  │                                                        │
│  CLIENT SIDEBAR  │   CLIENT DETAIL PANEL                                 │
│  ─────────────── │   ───────────────────                                 │
│                  │                                                        │
│  🔍 Search...    │   [Avatar] John Smith                                 │
│                  │   Free World • Started Jan 15, 2026                   │
│  ┌─────────────┐ │   📧 john@example.com  📱 (555) 123-4567             │
│  │ ● John S.   │ │                                                        │
│  │   Jan 15    │ │   ┌─────────────────────────────────────────────────┐ │
│  └─────────────┘ │   │ [Overview] [Intake] [Program] [Sessions] [...]  │ │
│  ┌─────────────┐ │   └─────────────────────────────────────────────────┘ │
│  │   Mike D.   │ │                                                        │
│  │   Dec 3     │ │   < Active Tab Content >                              │
│  └─────────────┘ │                                                        │
│  ┌─────────────┐ │                                                        │
│  │   Tom R.    │ │                                                        │
│  │   Nov 22    │ │                                                        │
│  └─────────────┘ │                                                        │
│                  │                                                        │
└──────────────────┴───────────────────────────────────────────────────────┘
```

### Client Detail Sub-Tabs

| Tab | Content |
|-----|---------|
| **Overview** | Stats, recent activity, quick actions, case notes |
| **Intake** | Full intake questionnaire answers (all 12+ fields) |
| **Program** | **REDESIGNED** - Suggested template + workout builder |
| **Sessions** | P.O. session notes, past check-ins |
| **Goals** | Goals with progress sliders, action items |
| **Messages** | Direct message thread with client |

---

## Part 3: Redesigned Program Tab

The current Program tab is cluttered with collapsibles and too many sections. The new design prioritizes usability:

### New Program Tab Layout

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  JOHN'S TRAINING PROGRAM                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  💡 SUGGESTED CATEGORY: Beginner Basics (92% Match)                 ││
│  │                                                                      ││
│  │  Based on: Beginner experience • Overweight • Sedentary • 3 days   ││
│  │                                                                      ││
│  │  [Select Category ▼: Beginner Basics]  [Select Template ▼: None]   ││
│  │                                                                      ││
│  │  [🎯 Assign Template]                                               ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════════│
│                                                                          │
│  CURRENT PROGRAM: Phase 1 - Foundation                                  │
│  ─────────────────────────────────────────                              │
│                                                                          │
│  [ Week 1 ▼]  [ Week 2 ]  [ Week 3 ]  [ Week 4 ]                        │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  MONDAY - Upper Body Push                     [Edit Day] [+ Exercise]││
│  │  ─────────────────────────────────────────────────────────────────  ││
│  │  1. Bench Press        4 x 8-10    90s rest    Main Work            ││
│  │  2. Incline DB Press   3 x 10-12   60s rest    Main Work            ││
│  │  3. Cable Flyes        3 x 12-15   45s rest    Accessory            ││
│  │  4. Tricep Pushdowns   3 x 12-15   45s rest    Accessory            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  TUESDAY - Lower Body                          [Edit Day] [+ Exercise]││
│  │  ...                                                                 ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  WEDNESDAY - Rest Day 🌙                                            ││
│  └─────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│  ═══════════════════════════════════════════════════════════════════════│
│                                                                          │
│  ADDITIONAL FILES                                           [+ Upload]  │
│  Nutrition Guide.pdf • Week 1-4 Overview.pdf                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Improvements

1. **Template Assignment at Top** - Immediately visible, not hidden in collapsible
2. **Horizontal Week Tabs** - Switch weeks without expanding/collapsing
3. **Day Cards Always Visible** - All 7 days shown (no collapsing needed)
4. **Inline Exercise Editing** - Click to edit in place
5. **Files Minimized** - Collapsed section at bottom for PDFs

---

## Part 4: File Changes

### New Files

| File | Purpose |
|------|---------|
| `src/components/admin/FreeWorldHub.tsx` | New top-level Free World tab component |
| `src/components/admin/coaching/ImprovedProgramTab.tsx` | Redesigned program management UI |

### Modified Files

| File | Changes |
|------|---------|
| `src/pages/admin/AdminDashboard.tsx` | Add "Free World" as 3rd top-level tab |
| `src/components/admin/PeopleHub.tsx` | Remove "Free World" sub-tab |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | Use new improved program tab |

---

## Part 5: Component Details

### FreeWorldHub.tsx

```text
Purpose: Self-contained Free World management hub

State:
- selectedClient: Currently selected coaching client
- searchQuery: Client search filter

Layout:
- Left sidebar: CoachingClientList (existing, reused)
- Right panel: ClientProgressPanel (existing, reused)

When no client selected:
- Show empty state with "Select a client to manage"
```

### ImprovedProgramTab.tsx

```text
Purpose: User-friendly program management for coaching clients

Sections:
1. Template Assignment (always visible at top)
   - Intake summary badges
   - Suggested category with score
   - Category dropdown + template dropdown
   - "Assign Template" button

2. Current Program (tabbed weeks)
   - Horizontal week selector tabs
   - Day cards showing workout name + exercise count
   - Expand day to see/edit exercises
   - Add exercise button per day

3. Files Section (collapsible at bottom)
   - List of uploaded PDFs/files
   - Upload button
```

### AdminDashboard.tsx Changes

```text
Add new TabsTrigger:
<TabsTrigger value="freeworld" className="text-xs sm:text-sm px-3">
  <Crown className="h-4 w-4 mr-2 text-purple-400" />
  Free World
  <Badge className="ml-2 bg-purple-500/20 text-purple-400">
    {clientAnalytics?.clientsByPlan.coaching || 0}
  </Badge>
</TabsTrigger>

Add new TabsContent:
<TabsContent value="freeworld">
  <FreeWorldHub />
</TabsContent>
```

### PeopleHub.tsx Changes

Remove the "coaching" sub-tab:
- Delete TabsTrigger for "coaching"
- Delete TabsContent for "coaching"
- Remove CoachingCommandCenter import

---

## Part 6: Visual Styling

### Free World Tab Accent

All Free World components use the **purple accent** color scheme:
- `text-purple-400` for icons and highlights
- `bg-purple-500/20` for badges and backgrounds
- `border-purple-500/30` for borders

### Program Tab Cards

Day cards use a clean, scannable design:
- White/light text for workout name
- Muted text for exercise count
- Rest days have `bg-muted/30` background
- Active/editing states have primary border

---

## Summary

| Change | Impact |
|--------|--------|
| Free World becomes top-level tab | Faster access, premium treatment |
| Removed from People sub-tabs | Cleaner People hub, less confusion |
| Redesigned Program tab | Horizontal week tabs, better exercise management |
| Template assignment always visible | No hunting in collapsibles |
| Files section minimized | Focus on workouts, not PDFs |

After implementation, Dom will have a dedicated command center for his premium coaching clients with an intuitive program builder that doesn't require excessive clicking/expanding.

