

# Admin Dashboard Redesign: Complete Audit & Optimization Plan

## Executive Summary

This plan delivers a complete restructuring of the admin dashboard based on a thorough audit of the current implementation. The redesign transforms a tab-heavy, feature-dense interface into a clear, purpose-driven admin experience with distinct navigation zones, reduced cognitive load, and safety-first destructive action handling.

---

## Part 1: Current State Analysis

### What Exists Today

The admin dashboard currently uses a **6-tab horizontal layout**:
1. **Command Center** - Revenue, clients, leads, health alerts, quick actions
2. **People** - Sub-tabs: All Clients, Check-Ins, Support
3. **Free World** - Sub-tabs: Clients, Workout Templates, Nutrition Templates
4. **Commissary** - Sub-tabs: Products, Orders
5. **Content CMS** - 11 content sections via sidebar navigation
6. **Settings** - Analytics pixels, Calendly, support email

### Identified Issues

| Problem | Impact | Location |
|---------|--------|----------|
| **Tab overflow** | Horizontal tabs wrap on mobile, creating confusion | Main navigation |
| **Duplicated user views** | "People" and "Free World" both show client management | Tabs 2 & 3 |
| **Hidden content** | 11 content types buried in sidebar; hard to locate | Content CMS |
| **No tier visibility** | Must click through to understand tier access rules | Missing entirely |
| **Revenue not actionable** | MRR card shows data but no drill-down to payments | Command Center |
| **No admin logs** | No record of who changed what | Missing entirely |
| **Destructive actions exposed** | Cancel subscription visible without read-only mode | Client Detail Panel |
| **Intake scattered** | Check-Ins and Free World Intake in different places | People & Free World |
| **No section descriptions** | Pages lack context for what they control | All sections |

---

## Part 2: New Navigation Architecture

### Primary Navigation (Left Sidebar)

Replace horizontal tabs with a **persistent left sidebar** containing 9 clear sections:

```
┌─────────────────────────────────────┐
│  ADMIN DASHBOARD                    │
├─────────────────────────────────────┤
│  ⬡ Command Center                   │  ← Overview + Alerts
├─────────────────────────────────────┤
│  👥 Users                           │  ← All user management
│  📋 Check-Ins                       │  ← Weekly submissions
│  💬 Support                         │  ← Help requests
├─────────────────────────────────────┤
│  📚 Programs & Content              │  ← All content types
│  🏷️ Tiers & Access                  │  ← Access rules matrix
├─────────────────────────────────────┤
│  💳 Payments & Revenue              │  ← MRR, transactions
│  📥 Intake & Forms                  │  ← Tier 3 intake data
├─────────────────────────────────────┤
│  📊 Analytics                       │  ← Retention, engagement
│  ⚙️ System Settings                 │  ← Config, integrations
│  📜 Logs & Safety                   │  ← Audit trail
└─────────────────────────────────────┘
```

### Navigation Rules
- Each section has a **single, clear purpose**
- No sub-tabs deeper than 2 levels
- Active section highlighted with gold accent
- Badge counts for pending items (Check-Ins, Support, Orders)
- Mobile: Collapsible sidebar with hamburger toggle

---

## Part 3: Section-by-Section Redesign

### 3.1 Command Center (Admin Home)

**Purpose**: First screen seen on login. Quick pulse check on business health.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  COMMAND CENTER                                             │
│  Your business at a glance. Click any card to dive deeper. │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Total    │  │ Active   │  │ Est. MRR │  │ Pending  │    │
│  │ Users    │  │ (30 day) │  │ $X,XXX   │  │ Alerts   │    │
│  │   47     │  │   32     │  │          │  │   3      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│  USERS BY TIER                                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────┐ │
│  │ Solitary (Tier 1)│ │ Gen Pop (Tier 2) │ │ Free World  │ │
│  │      12          │ │       28         │ │     7       │ │
│  │   $599/mo MRR    │ │   $3,546 spread  │ │  $6,999/mo  │ │
│  └──────────────────┘ └──────────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ALERTS (Requires Attention)                                │
│  ⚠️ 3 clients expiring in <7 days                          │
│  ⚠️ 2 failed payment retries                                │
│  ⚠️ 5 pending check-ins awaiting review                     │
│  → View All Alerts                                          │
├─────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                              │
│  [Review Check-Ins] [View Users] [Add Product] [Send Push] │
└─────────────────────────────────────────────────────────────┘
```

**Clickable Cards**:
- Total Users → navigates to Users section
- Est. MRR → navigates to Payments & Revenue
- Pending Alerts → expands inline or navigates to Logs & Safety
- Tier cards → navigates to Tiers & Access with that tier highlighted

**What's Removed**:
- Lead Analytics (move to dedicated Analytics section)
- Detailed revenue breakdown (move to Payments & Revenue)

---

### 3.2 Users Section

**Purpose**: Single source of truth for all user management.

**Header**:
> **Users**
> Manage all members across all tiers. Search, filter, and take action.

**Features**:
- Search by name, email, phone
- Filter by: Tier, Status (Active/Cancelled/Expired), Intake Complete
- Table columns: Name, Email, Tier, Status, Joined, Last Active
- Bulk actions: Select multiple → Upgrade/Downgrade, Export, Send Email
- Click row to open **User Detail Panel** (slide-over sheet)

**User Detail Panel Contents**:
```
┌─────────────────────────────────────────────┐
│  John Doe                        [CLOSE]   │
│  john@example.com                           │
├─────────────────────────────────────────────┤
│  CONTACT                                    │
│  Email: john@example.com                    │
│  Phone: (555) 123-4567                      │
│  Joined: Jan 15, 2026                       │
│  Last Active: 2 days ago                    │
├─────────────────────────────────────────────┤
│  SUBSCRIPTION                               │
│  Plan: General Population (12-Week)         │
│  Status: Active                             │
│  Started: Jan 15, 2026                      │
│  Expires: Apr 15, 2026 (68 days left)       │
├─────────────────────────────────────────────┤
│  INTAKE STATUS                              │
│  ✅ Completed Jan 15, 2026                  │
│  [View Full Intake]                         │
├─────────────────────────────────────────────┤
│  ONBOARDING PROGRESS                        │
│  ✅ Welcome video watched                   │
│  ✅ First workout completed                 │
│  ⬜ First check-in submitted                │
├─────────────────────────────────────────────┤
│  PAYMENT HISTORY                            │
│  Jan 15 - $379.99 - Gen Pop - ✅ Paid       │
├─────────────────────────────────────────────┤
│  ACTIONS                   [Read-only mode] │
│  [Edit] ← Reveals action buttons            │
│                                             │
│  When Edit mode active:                     │
│  [Upgrade/Downgrade Tier]                   │
│  [Grant Comp Access]                        │
│  [Resend Onboarding Email]                  │
│  [Reset Progress] ← Confirmation required   │
│  [Deactivate User] ← Confirmation required  │
└─────────────────────────────────────────────┘
```

**Safety Features**:
- Default to read-only mode
- "Edit" button reveals action buttons
- Destructive actions (Reset Progress, Deactivate, Cancel Subscription) require confirmation modal
- Confirmation modal includes impact statement: "This will remove access immediately"

---

### 3.3 Check-Ins Section

**Purpose**: Review weekly member submissions.

**Header**:
> **Check-Ins**
> Review weekly progress submissions from members. Mark as reviewed to track your coaching.

**Current Implementation**: `CheckInReviewManager.tsx` - This is well-designed. Keep as-is but move to dedicated navigation item.

**Enhancements**:
- Add "Days since submitted" column
- Highlight overdue reviews (>3 days) in warning color
- Add quick-reply templates for common feedback

---

### 3.4 Support Section

**Purpose**: Centralized help request inbox.

**Header**:
> **Support Inbox**
> Member questions and help requests. Respond directly or flag for follow-up.

**Current Implementation**: `SupportInbox.tsx` - Move from People sub-tab to standalone section.

---

### 3.5 Programs & Content Section

**Purpose**: Single location for all content management.

**Header**:
> **Programs & Content**
> Create, edit, and organize all training and lifestyle content. Content is organized by type.

**Layout**: Replace sidebar navigation with card-based grid:

```
┌─────────────────────────────────────────────────────────────┐
│  TRAINING                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 12-Week     │  │ Workout     │  │ Free World  │         │
│  │ Program     │  │ Templates   │  │ Templates   │         │
│  │ 12 weeks    │  │ 45 workouts │  │ 8 programs  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  LIFESTYLE                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Nutrition   │  │ Meal Plans  │  │ Discipline  │         │
│  │ Content     │  │ 140 plans   │  │ Routines    │         │
│  │ 12 guides   │  │             │  │ 24 routines │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  GROWTH                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Faith       │  │ Skill       │  │ Welcome     │         │
│  │ Lessons     │  │ Lessons     │  │ Videos      │         │
│  │ 8 lessons   │  │ 15 lessons  │  │ 3 tiers     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

**Click any card** → Opens that content manager full-screen with back button

**Content Manager Features**:
- "Tier Access" column showing which tiers can see each piece
- Enable/Disable toggle per content item
- "Preview as User" button → Opens content in user view mode
- "Core" vs "Optional" badge per item

---

### 3.6 Tiers & Access Control Section (NEW)

**Purpose**: Visualize and manage what each tier can access.

**Header**:
> **Tiers & Access**
> Define pricing, access rules, and content permissions for each tier.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  TIER CONFIGURATION                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  TIER 1: Solitary Confinement                           │
│  │  Price: $49.99/month (recurring)                        │
│  │  Billing: Monthly subscription                          │
│  │                                                         │
│  │  ACCESS INCLUDES:                                       │
│  │  ✅ Yard Time Workouts (bodyweight only)                │
│  │  ✅ Discipline Routines                                 │
│  │  ✅ Basic Nutrition Guidance                            │
│  │  ❌ 12-Week Sentence Program                            │
│  │  ❌ Faith Lessons                                       │
│  │  ❌ 1:1 Coaching                                        │
│  │                                                         │
│  │  Upgrade Path: → General Population                     │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  TIER 2: General Population                             │
│  │  Price: $379.99 one-time                                │
│  │  Billing: Single payment, 98-day access                 │
│  │                                                         │
│  │  ACCESS INCLUDES:                                       │
│  │  ✅ Everything in Tier 1                                │
│  │  ✅ 12-Week Sentence Program                            │
│  │  ✅ Meal Swap System                                    │
│  │  ✅ Faith Lessons                                       │
│  │  ✅ Progress Photos                                     │
│  │  ❌ 1:1 Coaching                                        │
│  │                                                         │
│  │  Upgrade Path: → Free World                             │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  TIER 3: Free World                                     │
│  │  Price: $999.99/month (recurring)                       │
│  │  Billing: Monthly subscription                          │
│  │                                                         │
│  │  ACCESS INCLUDES:                                       │
│  │  ✅ Everything in Tier 1 & 2                            │
│  │  ✅ Custom Workout Programs                             │
│  │  ✅ Custom Nutrition Plans                              │
│  │  ✅ Direct Messaging with Coach                         │
│  │  ✅ Weekly 1:1 Sessions                                 │
│  │  ✅ Advanced Skills Lessons                             │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ACCESS MATRIX                                              │
│  ┌──────────────────┬─────────┬─────────┬─────────┐        │
│  │ Feature          │ Tier 1  │ Tier 2  │ Tier 3  │        │
│  ├──────────────────┼─────────┼─────────┼─────────┤        │
│  │ Workouts         │   ✅    │   ✅    │   ✅    │        │
│  │ Discipline       │   ✅    │   ✅    │   ✅    │        │
│  │ 12-Week Program  │   ❌    │   ✅    │   ✅    │        │
│  │ Faith Lessons    │   ❌    │   ✅    │   ✅    │        │
│  │ Custom Programs  │   ❌    │   ❌    │   ✅    │        │
│  │ 1:1 Coaching     │   ❌    │   ❌    │   ✅    │        │
│  │ Direct Messaging │   ❌    │   ❌    │   ✅    │        │
│  └──────────────────┴─────────┴─────────┴─────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Warning System**:
- When changing tier access rules, show warning: "X active users will be affected"
- Require confirmation before saving access changes

---

### 3.7 Payments & Revenue Section

**Purpose**: All financial data in one place.

**Header**:
> **Payments & Revenue**
> Track monthly recurring revenue, payment history, and billing status.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  REVENUE OVERVIEW                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Est. MRR │  │ One-Time │  │ Refunds  │  │ Failed   │    │
│  │ $7,598   │  │ (30 day) │  │ (30 day) │  │ Payments │    │
│  │          │  │ $1,519   │  │ $0       │  │    2     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│  REVENUE BY TIER (expandable from Est. MRR)                │
│  Solitary: 12 × $49.99 = $599.88/mo                        │
│  Gen Pop: 28 × ($379.99/3) = $3,546/mo spread              │
│  Free World: 7 × $999.99 = $6,999/mo                       │
├─────────────────────────────────────────────────────────────┤
│  UPCOMING RENEWALS (next 7 days)                           │
│  • John Doe - Free World - Jan 30 - $999.99                │
│  • Jane Smith - Solitary - Feb 1 - $49.99                  │
├─────────────────────────────────────────────────────────────┤
│  RECENT TRANSACTIONS                                        │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Date    │ User       │ Amount  │ Type    │ Status     ││
│  ├─────────┼────────────┼─────────┼─────────┼────────────┤│
│  │ Jan 27  │ Mike T.    │ $49.99  │ Renewal │ ✅ Paid    ││
│  │ Jan 26  │ Sarah K.   │ $379.99 │ New     │ ✅ Paid    ││
│  │ Jan 25  │ Chris L.   │ $49.99  │ Renewal │ ❌ Failed  ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [Export CSV] [Sync with Stripe]                           │
└─────────────────────────────────────────────────────────────┘
```

**Features**:
- Click any transaction → Opens user detail panel
- Failed payments highlighted in red with "Retry" action
- CSV export for accounting

---

### 3.8 Intake & Forms Section (NEW)

**Purpose**: Review and manage Tier 3 intake submissions.

**Header**:
> **Intake & Forms**
> Review Free World coaching applications and intake data. Add notes and flag for follow-up.

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  INTAKE SUBMISSIONS                                         │
│  Filter: [All] [Completed] [In Progress] [Reviewed]         │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐│
│  │ John Doe              │ Completed Jan 25 │ Reviewed ✅ ││
│  │ Mike Smith            │ Completed Jan 24 │ Pending ⏳  ││
│  │ Sarah Jones           │ In Progress      │ —          ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Intake Detail View (click to expand)**:
```
┌─────────────────────────────────────────────────────────────┐
│  JOHN DOE - Free World Intake                               │
├─────────────────────────────────────────────────────────────┤
│  PHYSICAL STATS                                             │
│  Age: 34  │  Height: 5'10"  │  Weight: 195 lbs              │
│  Body Fat: ~22%  │  Target: 180 lbs                         │
├─────────────────────────────────────────────────────────────┤
│  GOALS                                                      │
│  Primary: Lose fat, build muscle                            │
│  Details: Want to get back to college athlete shape...      │
├─────────────────────────────────────────────────────────────┤
│  INJURIES & LIMITATIONS                                     │
│  Lower back injury from 2019. Avoid heavy deadlifts.        │
├─────────────────────────────────────────────────────────────┤
│  SCHEDULE                                                   │
│  Available: 5 days/week  │  Session length: 45-60 min       │
│  Equipment: Full gym access                                 │
├─────────────────────────────────────────────────────────────┤
│  NUTRITION PREFERENCES                                      │
│  Restrictions: Gluten-free                                  │
│  Prep style: Batch cooking 2-3 times/week                   │
│  Dislikes: Seafood                                          │
├─────────────────────────────────────────────────────────────┤
│  FAITH                                                      │
│  Commitment: Committed believer, wants faith integration    │
├─────────────────────────────────────────────────────────────┤
│  ADMIN NOTES                                                │
│  [Add private note...]                                      │
│                                                             │
│  [Mark as Reviewed] [Flag for Follow-Up]                    │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.9 Analytics Section

**Purpose**: Key business metrics that inform decisions.

**Header**:
> **Analytics**
> Understand how your business is performing. Each chart answers a specific question.

**Charts (Only What Matters)**:

| Chart | Question It Answers |
|-------|---------------------|
| User Retention | How many users stay month-over-month? |
| Tier Conversion | How many upgrade from Tier 1 → 2 → 3? |
| Content Engagement | Which workouts/lessons are most viewed? |
| Drop-off Points | Where do users stop engaging? |
| Intake Completion | What % of Tier 3 leads complete intake? |
| Check-In Rate | What % submit weekly check-ins? |

**Design Rules**:
- No vanity metrics
- Every chart has a clear title and one-sentence explanation
- Hover states show exact numbers
- Time range selector: 7 days / 30 days / 90 days / All time

---

### 3.10 System Settings Section

**Purpose**: Platform configuration and integrations.

**Header**:
> **System Settings**
> Configure platform settings, integrations, and administrative preferences.

**Sub-sections (Tabs within Settings)**:

**Integrations Tab**:
- Analytics Pixels (Meta, GA4, TikTok)
- Calendly URL
- Stripe connection status
- ElevenLabs API status

**Email Templates Tab**:
- Welcome email (per tier)
- Check-in reminder
- Expiration warning
- Password reset

**Feature Toggles Tab**:
- Enable/disable community
- Enable/disable shop
- Maintenance mode toggle

**Admin Users Tab**:
- List of admin users with roles
- Add/remove admin access

---

### 3.11 Logs & Safety Section (NEW)

**Purpose**: Audit trail and safety controls.

**Header**:
> **Logs & Safety**
> Track admin actions and manage safety controls. All changes are logged.

**Admin Action Log**:
```
┌─────────────────────────────────────────────────────────────┐
│  RECENT ADMIN ACTIONS                                       │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Time         │ Admin  │ Action                        ││
│  ├──────────────┼────────┼───────────────────────────────┤│
│  │ Jan 27 10:32 │ Dom    │ Upgraded John Doe to Tier 2   ││
│  │ Jan 27 09:15 │ Dom    │ Added product "Redeemed Tee"  ││
│  │ Jan 26 16:45 │ Dom    │ Reviewed check-in (Mike S.)   ││
│  │ Jan 26 14:20 │ Dom    │ Changed Calendly URL          ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [Export Log] [Filter by Action Type]                       │
└─────────────────────────────────────────────────────────────┘
```

**Safety Controls**:
- All destructive actions require confirmation modal
- Confirmation modal shows: Action, Impact, "Type CONFIRM to proceed"
- Undo/rollback where possible (soft deletes)

---

## Part 4: Technical Implementation

### Database Changes

Add new table for admin audit logging:

```sql
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT, -- 'user', 'content', 'setting', etc.
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/AdminSidebar.tsx` | New left sidebar navigation |
| `src/components/admin/TiersAccessManager.tsx` | Tiers & Access section |
| `src/components/admin/PaymentsHub.tsx` | Payments & Revenue section |
| `src/components/admin/IntakeManager.tsx` | Intake & Forms section |
| `src/components/admin/AnalyticsHub.tsx` | Analytics section |
| `src/components/admin/AdminAuditLog.tsx` | Logs & Safety section |
| `src/components/admin/ConfirmationModal.tsx` | Reusable destructive action modal |
| `src/hooks/useAdminAuditLog.ts` | Hook for logging admin actions |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminDashboard.tsx` | Replace tab layout with sidebar + outlet routing |
| `src/components/admin/PeopleHub.tsx` | Extract Check-Ins and Support to standalone components |
| `src/components/admin/ClientDetailPanel.tsx` | Add read-only mode, edit toggle, confirmation modals |
| `src/components/admin/SubscriptionManager.tsx` | Add confirmation modals, audit logging |
| `src/components/admin/ContentNavigation.tsx` | Convert to card grid layout |

### Component Architecture

```
AdminDashboard.tsx
├── AdminSidebar.tsx (left navigation)
└── Outlet (content area)
    ├── CommandCenter (default)
    ├── UsersSection
    ├── CheckInsSection
    ├── SupportSection
    ├── ContentSection
    ├── TiersSection
    ├── PaymentsSection
    ├── IntakeSection
    ├── AnalyticsSection
    ├── SettingsSection
    └── LogsSection
```

---

## Part 5: UX Rules Enforcement

### Plain English Labels

| Current | Improved |
|---------|----------|
| "MRR" | "Est. Monthly Revenue" |
| "Retention Rate" | "Users Who Stay Active" |
| "Transformation" | "12-Week Program" or "General Population" |
| "Membership" | "Monthly Membership" or "Solitary Confinement" |
| "Coaching" | "1:1 Coaching" or "Free World" |

### Every Page Has Context

Each section includes a header with:
```
Title (large)
Description (1 sentence explaining what this section controls)
```

### No Hidden Actions

- All actions visible (no dropdown menus hiding critical functions)
- Primary actions use gold buttons
- Destructive actions use red buttons with clear labels

### Confirmation Modal Template

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Confirm Action                                          │
├─────────────────────────────────────────────────────────────┤
│  You are about to: Cancel John Doe's subscription           │
│                                                             │
│  Impact:                                                    │
│  • User will lose access immediately                        │
│  • This cannot be undone                                    │
│  • User will be notified by email                           │
│                                                             │
│  Type "CONFIRM" to proceed:                                 │
│  [__________________]                                       │
│                                                             │
│  [Cancel]                      [Confirm] (disabled until    │
│                                          CONFIRM typed)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 6: Execution Order

1. **Database migration** - Add admin_audit_log table
2. **Create AdminSidebar** - New navigation component
3. **Refactor AdminDashboard** - Replace tabs with sidebar + routing
4. **Create ConfirmationModal** - Reusable safety component
5. **Extract sections** - Move PeopleHub sub-tabs to standalone components
6. **Create TiersAccessManager** - New Tiers & Access section
7. **Create PaymentsHub** - New Payments & Revenue section
8. **Create IntakeManager** - New Intake & Forms section
9. **Create AnalyticsHub** - New Analytics section
10. **Create AdminAuditLog** - New Logs & Safety section
11. **Update existing components** - Add read-only mode, confirmation modals
12. **Add audit logging** - Hook into all admin actions
13. **Polish section descriptions** - Add headers to all sections

---

## Part 7: Deliverables Summary

### Admin Navigation Map
```
/admin
├── /admin (Command Center - default)
├── /admin/users
├── /admin/check-ins
├── /admin/support
├── /admin/content
│   └── /admin/content/:type (workouts, faith, nutrition, etc.)
├── /admin/tiers
├── /admin/payments
├── /admin/intake
├── /admin/analytics
├── /admin/settings
└── /admin/logs
```

### Improvements Made
1. Replaced horizontal tabs with left sidebar (9 clear sections)
2. Added Tiers & Access section for visibility into access rules
3. Added Payments & Revenue section for financial clarity
4. Added Intake & Forms section for Tier 3 management
5. Added Logs & Safety section for audit trail
6. Added read-only mode with explicit Edit toggle for user management
7. Added confirmation modals for all destructive actions
8. Added section descriptions to every page
9. Removed duplicate user views (People + Free World consolidated)
10. Converted Content CMS sidebar to card grid

### Remaining Limitations
- Stripe webhook status is informational only (cannot fix failed payments from admin)
- Email templates are placeholder (requires actual email service integration)
- Undo/rollback limited to soft deletes (cannot truly reverse some actions)

### Recommended Future Upgrades
1. **Push notification center** - View sent notifications, schedule future sends
2. **A/B testing for content** - Test different workout variations
3. **Admin mobile app** - Native iOS/Android for quick check-in reviews
4. **Automated reporting** - Weekly email digest of key metrics
5. **Role-based admin access** - Different permissions for assistant admins

