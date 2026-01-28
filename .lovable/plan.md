
# Redeemed Strength ("Dom Different") Comprehensive Audit Report

## Executive Summary

### Top 10 Issues by Severity + Effort

| # | Severity | Issue | Effort | Impact |
|---|----------|-------|--------|--------|
| 1 | **P0 Critical** | Auth/Profile fetch timeout errors (8s timeout reached) | M | Blocks user access, users stuck on loading screen |
| 2 | **P1 High** | RLS Policies with USING(true) on UPDATE/DELETE operations | M | Security vulnerability - users could modify others' data |
| 3 | **P1 High** | Leaked password protection disabled | S | Accounts vulnerable to credential stuffing attacks |
| 4 | **P1 High** | Admin Program Library exercises not displaying when days expanded | S | Admins cannot view/edit workout content |
| 5 | **P2 Medium** | Extension installed in public schema | S | Security best practice violation |
| 6 | **P2 Medium** | MobileBottomNav lacks DashboardLayout wrapper on several pages | M | Inconsistent mobile navigation experience |
| 7 | **P2 Medium** | Workouts page lacks DashboardLayout wrapper | S | Missing sidebar, breadcrumbs, bottom nav |
| 8 | **P2 Medium** | CheckIn form has no input validation before submit | S | Users can submit empty/invalid data |
| 9 | **P3 Low** | Intake form Step 1 height field lacks unit helper text | S | Confusion about format (5'10" vs 70 inches) |
| 10 | **P3 Low** | Weekly schedule builder on Workouts page is non-functional placeholder | M | Confusing for users - shows drag zones that don't work |

---

## Section 1: Complete App Inventory (Site Map + Feature List)

### Public Routes (No Auth Required)
```text
/                      → Homepage (Index)
/about                 → About page
/programs              → Programs overview
/programs/membership   → Solitary Confinement tier info
/programs/transformation → General Population tier info
/programs/coaching     → Free World tier info
/checkout              → Payment checkout (excluded from audit)
/book-call             → Calendly booking page
/login                 → Login/Signup form
/forgot-password       → Password reset request
/reset-password        → Password reset completion
/access-expired        → Subscription expired gate
/shop                  → Commissary (product listing)
/shop/:productId       → Product detail page
/shop/checkout         → Shop checkout (excluded)
/shop/confirmation     → Order confirmation
/terms, /privacy, /refund, /disclaimer → Legal pages
```

### Protected Routes (Auth Required)
```text
/intake               → User intake form (4 steps)
/intake-complete      → Intake confirmation
/onboarding           → Video orientation (tier-specific)
/freeworld-intake     → Extended coaching intake

/dashboard            → Main cell block (tier-aware tiles)
/dashboard/start-here → Orientation/checklist
/dashboard/workouts   → Iron Pile (bodyweight templates)
/dashboard/workouts/:templateId → Template detail
/dashboard/program    → The Sentence (12-week program)
/dashboard/discipline → Lights On/Lights Out (routines)
/dashboard/nutrition  → Chow Hall (meal plans)
/dashboard/check-in   → Roll Call (weekly report)
/dashboard/faith      → Chapel (faith lessons)
/dashboard/progress   → Time Served (progress tracker)
/dashboard/photos     → Mugshots (photo gallery)
/dashboard/community  → The Yard (community feed)
/dashboard/coaching   → Coaching Portal (Free World only)
/dashboard/book-po-checkin → Book coaching call
/dashboard/skills     → Work Release (career skills)
/dashboard/advanced-skills → Entrepreneur Track
/dashboard/messages   → Direct Line (DM with coach)
/dashboard/custom-program → Custom Program (coaching)
/dashboard/settings   → Account settings
/dashboard/help       → Help & FAQ
```

### Admin Routes (Admin Role Required)
```text
/admin                → Admin Command Center
/admin/audit          → Audit Report (sitemap/blueprint)
```

### Admin Sections (within /admin)
- Command Center (collapsed dashboard with metrics)
- Users (PeopleHub - member management)
- Check-Ins (CheckInReviewManager)
- Support (SupportInbox)
- Content CMS (Program Builder, Workouts, Faith, Nutrition, Meals, Discipline, Skills, Welcome Videos, Tier Onboarding, Templates)
- Free World Coaching (Clients, Program Library, Nutrition Library)
- Tiers Access
- Payments Hub
- Intake Manager
- Commissary (Products, Orders)
- Analytics Hub
- Content Engine
- Site Settings
- Audit Logs

### Database Tables (75 total)
Key tables: profiles, subscriptions, user_roles, check_ins, progress_photos, workout_templates, workout_exercises, program_weeks, program_day_workouts, program_day_exercises, meal_plan_templates, faith_lessons, skill_lessons, community_channels, community_messages, direct_messages, warden_messages, etc.

---

## Section 2: User Experience Audit (Mobile-First)

### Navigation & Information Architecture

| Area | Status | Notes |
|------|--------|-------|
| Bottom Navigation | PASS | MobileBottomNav has 5 items in thumb zone |
| Tier-aware labels | PASS | Dynamically switches terminology (Warden vs PO, Iron Pile vs Training) |
| Breadcrumbs | PASS | DashboardLayout provides breadcrumb navigation on desktop |
| Dashboard tiles | PASS | Consistent sizing, tier-based ordering |
| Touch targets | PASS | Input height 48px (h-12), buttons appropriately sized |
| Primary CTA clarity | PASS | DashboardWelcomeCard has clear tier-aware CTA |
| Back navigation | PASS | MobileBackButton + breadcrumbs on most pages |

### Issues Found

| ID | Severity | Issue | Location | Reproduction |
|----|----------|-------|----------|--------------|
| UX-1 | P2 | Workouts page lacks DashboardLayout | /dashboard/workouts | Page renders without sidebar, breadcrumbs, or bottom nav on mobile |
| UX-2 | P2 | CheckIn page lacks DashboardLayout | /dashboard/check-in | Same as above - inconsistent navigation |
| UX-3 | P3 | Weekly schedule builder is non-functional | /dashboard/workouts | Shows drag zones with "+" icons that don't respond to interaction |
| UX-4 | P3 | Height input has no format helper | /intake (Step 1) | User unsure if they should enter "5'10" or "70" |
| UX-5 | P3 | Intake Step 2 injuries field has no character limit indicator | /intake | Long text could cause display issues |

### Mobile-Specific Testing

| Viewport | Issue | Severity |
|----------|-------|----------|
| iPhone (390x844) | Horizontal scroll on Nutrition day tabs if >7 days | P3 |
| Small Android (360x800) | Admin TabsList clips on FreeWorldHub | P3 |
| Tablet (768px) | Bottom nav shows on tablet when it shouldn't | P3 |

---

## Section 3: Admin Experience Audit

### Admin Dashboard Structure
- Uses sheet-based drawer on mobile (AdminMobileDrawer) ✓
- Desktop sidebar with all sections ✓
- Real-time notifications available ✓
- Audit log tracks admin actions ✓

### Issues Found

| ID | Severity | Issue | Location | Reproduction |
|----|----------|-------|----------|--------------|
| ADMIN-1 | P1 | Program Library exercises not showing when day expanded | /admin → Free World → Program Library | Expand category → template → week → day - exercises list is empty despite data existing |
| ADMIN-2 | P2 | "Add Client" button in FreeWorldHub has no functionality | /admin → Free World | Button visible but clicking does nothing |
| ADMIN-3 | P2 | No confirmation before bulk-reviewing check-ins | /admin → Check-Ins | Bulk action executes immediately without "Are you sure?" |
| ADMIN-4 | P3 | ContentNavigation doesn't highlight active section clearly | /admin → Content | Hard to tell which content section is selected |
| ADMIN-5 | P3 | TierOnboardingManager regenerate button lacks loading state feedback | /admin → Content → Tier Onboarding | No visual indication while regenerating audio |

### Admin CMS Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| Create/edit workouts | PASS | WorkoutContentManager functional |
| Create/edit faith lessons | PASS | FaithLessonsManager functional |
| Create/edit nutrition | PASS | NutritionManager + MealPlanManager functional |
| Assign programs to clients | PARTIAL | TemplateAssignment exists but Program Library broken |
| Preview as user tier | PASS | AdminPreviewContext allows tier simulation |
| User management | PASS | PeopleHub with search, filter, tier view |
| Danger button safety | PASS | Delete actions have confirmation modals |

---

## Section 4: Functional QA Matrix

| Feature | Route/Component | Roles | Expected | Actual | Severity | Fix |
|---------|-----------------|-------|----------|--------|----------|-----|
| Login | /login | All | Email/password auth works | PASS | - | - |
| Signup | /login?mode=signup | All | Creates account + subscription | PASS | - | - |
| Intake Form | /intake | All tiers | 4-step form saves to profile | PASS | - | - |
| Onboarding Video | /onboarding | All tiers | Plays tier-specific video | PASS | - | - |
| Dashboard tiles | /dashboard | All tiers | Shows tier-appropriate tiles | PASS | - | - |
| Locked feature modal | /dashboard | Solitary | Shows upgrade prompt | PASS | - | - |
| Workout templates | /dashboard/workouts | All | Lists bodyweight templates | PASS | - | - |
| 12-Week Program | /dashboard/program | Trans/Coach | Shows weeks, days, exercises | PASS | - | - |
| Day completion | /dashboard/program | Trans/Coach | Toggle marks day complete | PASS | - | - |
| Discipline routines | /dashboard/discipline | All | Shows morning/evening routines | PASS | - | - |
| Nutrition (Solitary) | /dashboard/nutrition | Solitary | Shows BasicNutritionPlan | PASS | - | - |
| Nutrition (Trans/Coach) | /dashboard/nutrition | Trans/Coach | Shows assigned meal plan | PASS | - | - |
| Check-in submit | /dashboard/check-in | All | Saves weekly report | PARTIAL | No validation | P2 |
| Faith lessons | /dashboard/faith | Trans/Coach | Displays lessons | PASS | - | - |
| Progress photos | /dashboard/progress | All | Upload/view photos | PASS | - | - |
| Warden Chat | FloatingActionStack | All auth | AI chat opens, responds | PASS | - | - |
| Admin: Program Library | /admin → Free World | Admin | Shows exercises in days | **FAIL** | P1 | Fix query |
| Admin: Check-in Review | /admin → Check-Ins | Admin | Review and add notes | PASS | - | - |
| Admin: User management | /admin → Users | Admin | Search, filter, view users | PASS | - | - |
| Admin: Content Engine | /admin → Content Engine | Admin | Generate content ideas | PASS | - | - |

---

## Section 5: Data Integrity & Permissions Audit

### RLS Policy Review

| Table | Policy Status | Issue |
|-------|---------------|-------|
| profiles | Has RLS | ✓ Proper user_id check |
| subscriptions | Has RLS | ✓ Proper user_id check |
| check_ins | Has RLS | ✓ Proper user_id check |
| products | Has RLS | ✓ Public read for active products |
| orders | Has RLS | ✓ User can only view own orders |
| user_roles | Has RLS | ✓ Admins only |
| **Unknown table(s)** | Has RLS | **WARNING: USING(true) on UPDATE/DELETE** |

### Security Issues

| ID | Severity | Issue | Impact |
|----|----------|-------|--------|
| SEC-1 | P1 | RLS policies with USING(true) on UPDATE/DELETE | Users could potentially modify others' data |
| SEC-2 | P1 | Leaked password protection disabled | Accounts vulnerable to credential stuffing |
| SEC-3 | P2 | Extension in public schema | Best practice violation |

### Tier Gating Verification

| Tier | Feature | Expected | Actual |
|------|---------|----------|--------|
| Solitary | Access to 12-Week Program | LOCKED | PASS - UpgradePrompt shows |
| Solitary | Access to Chapel | LOCKED | PASS - Locked tile |
| Transformation | Access to Entrepreneur Track | LOCKED | PASS - Locked tile |
| Transformation | Access to Direct Line | LOCKED | PASS - Locked tile |
| Coaching | Access to Custom Program | AVAILABLE | PASS |
| Coaching | Access to Coaching Portal | AVAILABLE | PASS |
| Expired | Access to dashboard | BLOCKED | PASS - Redirects to /access-expired |

---

## Section 6: Performance & Reliability Audit

### Critical Issue Discovered

**P0: Auth/Profile Fetch Timeout**

```text
Console Error:
"fetchProfile timed out after 8000ms" at AuthContext.tsx:44
```

**Impact:** Users get stuck on loading screen, cannot access dashboard.

**Cause:** The `withTimeout` wrapper in AuthContext is racing against slow Supabase queries. Under slow network conditions or high server load, profile fetch exceeds 8s.

**Fix:** 
1. Increase timeout to 15s
2. Add retry logic with exponential backoff
3. Show graceful error with "Retry" button instead of silent failure

### Other Performance Observations

| Area | Status | Notes |
|------|--------|-------|
| Code splitting | PARTIAL | Uses lazy imports but could optimize more |
| Image optimization | PARTIAL | Some images lack width/height (CLS issues) |
| Query caching | PASS | TanStack Query with proper staleTime |
| Error boundaries | PASS | ErrorBoundary wraps App |
| Loading skeletons | PASS | DashboardSkeleton used throughout |

---

## Section 7: Accessibility & Content Clarity Audit

### Accessibility Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| Minimum 16px font | PASS | Input uses text-base |
| Color contrast | PASS | Gold on dark background passes |
| Touch targets 44x44 | PASS | Buttons use h-12 (48px) |
| Focus states | PASS | Ring offset visible |
| Form labels | PASS | All inputs have labels |
| Error messages | PARTIAL | Some forms lack inline validation |
| Screen reader support | PARTIAL | Missing aria-labels on some icons |

### Content Clarity Issues

| ID | Location | Issue | Fix |
|----|----------|-------|-----|
| CC-1 | /intake Step 1 | Height field lacks format example | Add placeholder "e.g., 5'10" or 70 inches" |
| CC-2 | /dashboard/check-in | Submit button says "Report In" - unclear | Change to "Submit Weekly Check-In" |
| CC-3 | /dashboard/discipline | "Lights On / Lights Out" confusing for new users | Add tooltip or explanatory text |

---

## Section 8: Security & Abuse Prevention Audit (Non-Payment)

### Authentication Security

| Check | Status | Notes |
|-------|--------|-------|
| Password minimum 8 chars | PASS | Validated in Login.tsx |
| Password confirmation | PASS | Signup requires confirm |
| Rate limiting on auth | PARTIAL | Supabase default, no custom limits |
| Secure session handling | PASS | Supabase handles tokens |
| **Leaked password protection** | **FAIL** | Disabled in auth settings |

### Authorization

| Check | Status | Notes |
|-------|--------|-------|
| Admin route protection | PASS | requireAdmin prop checks user_roles |
| Tier content gating | PASS | UpgradePrompt and locked tiles |
| RLS on all user data | PASS | Most tables have RLS |
| **Permissive RLS policies** | **FAIL** | Some policies use USING(true) |

### Input Validation

| Form | Validation | Issues |
|------|------------|--------|
| Intake form | Zod schemas | PASS |
| Settings form | Zod schemas | PASS |
| Check-in form | None | **FAIL** - submits without validation |
| Community messages | Character limit | PARTIAL - no profanity filter |

---

## Section 9: Recommendations Roadmap

### Quick Wins (Under 1 Hour Each)

| # | Fix | Value | Effort |
|---|-----|-------|--------|
| 1 | Enable leaked password protection in Supabase auth settings | High | 5 min |
| 2 | Add height format helper text on intake | Medium | 10 min |
| 3 | Add Zod validation to CheckIn form | High | 30 min |
| 4 | Wrap Workouts page in DashboardLayout | Medium | 15 min |
| 5 | Wrap CheckIn page in DashboardLayout | Medium | 15 min |
| 6 | Add confirmation dialog to bulk check-in review | Medium | 20 min |
| 7 | Add loading state to TierOnboardingManager regenerate | Low | 15 min |

### Medium Fixes (Half-Day to 2 Days)

| # | Fix | Value | Effort |
|---|-----|-------|--------|
| 1 | Fix AuthContext timeout/retry logic | Critical | 4 hours |
| 2 | Audit and fix permissive RLS policies | Critical | 4 hours |
| 3 | Fix Program Library exercise display in admin | High | 2 hours |
| 4 | Implement "Add Client" flow in FreeWorldHub | Medium | 4 hours |
| 5 | Add aria-labels to icon buttons throughout | Medium | 3 hours |
| 6 | Remove or implement weekly schedule builder | Medium | 4 hours |

### Big Lifts (Multi-Day)

| # | Fix | Value | Effort |
|---|-----|-------|--------|
| 1 | Comprehensive E2E test suite | High | 3-5 days |
| 2 | Automated tier gating tests | High | 2-3 days |
| 3 | Content moderation system for community | Medium | 3-5 days |
| 4 | Rate limiting on sensitive endpoints | Medium | 2 days |

---

## Section 10: Implementation Patch List (Immediate Fixes)

### Fix 1: AuthContext Timeout/Retry Enhancement
**File:** `src/contexts/AuthContext.tsx`
- Increase timeout from 8000ms to 15000ms
- Add retry logic with 3 attempts
- Show user-friendly error with retry button

### Fix 2: Wrap Workouts Page in DashboardLayout
**File:** `src/pages/dashboard/Workouts.tsx`
- Import DashboardLayout
- Wrap content in DashboardLayout component

### Fix 3: Wrap CheckIn Page in DashboardLayout
**File:** `src/pages/dashboard/CheckIn.tsx`
- Already has import but not using it
- Wrap content in DashboardLayout component

### Fix 4: Add CheckIn Form Validation
**File:** `src/pages/dashboard/CheckIn.tsx`
- Add Zod schema for numeric fields
- Show inline validation errors

### Fix 5: Fix Program Library Exercise Query
**File:** `src/components/admin/coaching/ProgramLibrary.tsx`
- Debug `useTemplateDetails` hook
- Ensure exercises are fetched with correct day_id joins

### Fix 6: Height Field Helper Text
**File:** `src/pages/Intake.tsx`
- Add placeholder or helper text: "e.g., 5'10" or 70 inches"

---

## Section 11: Regression Test Plan

After implementing fixes, verify:

### Critical Path Tests
1. **Auth Flow:** Login → Dashboard → Logout (should not timeout)
2. **Signup Flow:** Create account → Intake → Onboarding → Dashboard
3. **Tier Gating:** Solitary user cannot access /dashboard/program (redirect to upgrade)
4. **Admin Access:** Non-admin cannot access /admin (redirect to dashboard)

### Feature Tests
1. **Check-in Submit:** Enter data → Submit → Shows success toast → Data in history
2. **Workout Template:** Navigate to template → View exercises → Calendar button works
3. **Program Day Completion:** Expand day → Complete → Shows "SERVED" stamp
4. **Admin Program Library:** Expand category → template → week → day → exercises visible

### Mobile Tests
1. Bottom nav visible on dashboard pages
2. Warden FAB accessible on all pages
3. Forms don't zoom on iOS (16px font)
4. No horizontal scroll on any page

### Security Tests
1. Verify RLS policies block cross-user data access
2. Verify admin routes return 403 for non-admins
3. Verify tier content properly locked

---

## Summary

This audit identified **10 priority issues** with 2 critical (P0/P1) security and reliability problems that should be addressed before production launch:

1. **Auth timeout errors** causing users to get stuck
2. **Permissive RLS policies** creating potential security vulnerabilities
3. **Disabled password protection** leaving accounts vulnerable

The mobile UX is generally well-optimized with proper touch targets and tier-aware navigation. The admin experience is comprehensive but has a critical bug in the Program Library exercise display.

**Recommended immediate actions:**
1. Enable leaked password protection (5 minutes)
2. Fix auth timeout handling (4 hours)  
3. Audit and fix RLS policies (4 hours)
4. Fix Program Library exercise display (2 hours)
