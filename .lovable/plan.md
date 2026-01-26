
# COMPLETE APP AUDIT + IMPLEMENTATION FIX PLAN
## Redeemed Strength / Dom Different Fitness Platform

---

# PART 1: FULL APP MAP

## User Side

### Landing/Marketing Pages
| Route | Page Name | Component |
|-------|-----------|-----------|
| `/` | Homepage | `Index.tsx` |
| `/about` | About Dom | `About.tsx` |
| `/programs` | Programs Overview | `Programs.tsx` |
| `/programs/membership` | Solitary Confinement | `Membership.tsx` |
| `/programs/transformation` | General Population | `Transformation.tsx` |
| `/programs/coaching` | Free World Coaching | `Coaching.tsx` |
| `/book-call` | Book a Call | `BookCall.tsx` |

### Authentication
| Route | Page Name | Component |
|-------|-----------|-----------|
| `/login` | Login/Signup | `Login.tsx` |
| `/forgot-password` | Password Recovery | `ForgotPassword.tsx` |
| `/reset-password` | Password Reset | `ResetPassword.tsx` |
| `/access-expired` | Expired Access | `AccessExpired.tsx` |

### Checkout/Onboarding
| Route | Page Name | Component |
|-------|-----------|-----------|
| `/checkout` | Plan Checkout | `Checkout.tsx` |
| `/intake` | Intake Form | `Intake.tsx` |
| `/intake-complete` | Intake Complete | `IntakeComplete.tsx` |
| `/onboarding` | Video Orientation Gate | `Onboarding.tsx` |

### Dashboard Pages (20 pages)
| Route | Page Name | Tile Label | Tier Access |
|-------|-----------|------------|-------------|
| `/dashboard` | Dashboard | Cell Block | All |
| `/dashboard/start-here` | Start Here | Intake Processing / Welcome Home | All |
| `/dashboard/program` | The Sentence | 12-Week Program | Gen Pop, Coaching |
| `/dashboard/workouts` | Yard Time | Training Templates | All |
| `/dashboard/workouts/:templateId` | Workout Template | — | All |
| `/dashboard/discipline` | Lights On/Out | Discipline Routines | All |
| `/dashboard/nutrition` | Chow Hall | Nutrition | All |
| `/dashboard/faith` | Chapel | Faith Lessons | Gen Pop, Coaching |
| `/dashboard/check-in` | Roll Call | Weekly Check-In | All |
| `/dashboard/progress` | Time Served | Progress Tracker | All |
| `/dashboard/photos` | Mugshots | Photo Gallery | All |
| `/dashboard/skills` | Work Release | Skill-Building | Gen Pop, Coaching |
| `/dashboard/advanced-skills` | Entrepreneur Track | Advanced Business | Coaching |
| `/dashboard/community` | The Yard | Community | Gen Pop, Coaching |
| `/dashboard/messages` | Direct Line | DM with Dom | Coaching |
| `/dashboard/coaching` | Coaching Portal | 1:1 Access | Coaching |
| `/dashboard/custom-program` | Custom Program | Personalized Plan | Coaching |
| `/dashboard/book-po-checkin` | Book Check-In | Schedule Call | Coaching |
| `/dashboard/settings` | Settings | Profile/Password | All |
| `/dashboard/help` | CO Desk | Support/FAQ | All |

### Shop Pages
| Route | Page Name | Component |
|-------|-----------|-----------|
| `/shop` | Commissary | `Shop.tsx` |
| `/shop/:productId` | Product Detail | `ProductDetail.tsx` |
| `/shop/checkout` | Shop Checkout | `shop/Checkout.tsx` |
| `/shop/confirmation` | Order Confirmation | `OrderConfirmation.tsx` |

### Legal Pages
| Route | Page Name |
|-------|-----------|
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/refund` | Refund Policy |
| `/disclaimer` | Disclaimer |

## Admin Side

### Admin Pages
| Route | Page Name | Tabs/Sections |
|-------|-----------|---------------|
| `/admin` | Admin Dashboard | Command Center, People, Commissary, Content CMS, Settings |
| `/admin/audit` | Audit Report | Production Readiness Checklist |

### Admin Components/Managers
- **Command Center**: RevenueAnalytics, ClientHealthAlertsPanel, AdminQuickActions, LeadAnalytics
- **People Hub**: PeopleHub, CheckInReviewManager, CoachingClientsManager, ClientDetailPanel
- **Commissary Hub**: ProductManager, OrdersManager
- **Content CMS**: WorkoutContentManager, FaithLessonsManager, NutritionManager, MealPlanManager, DisciplineManager, SkillLessonsManager, WelcomeVideosManager, TierOnboardingManager, ProgramBuilder
- **Settings**: SiteSettingsManager, AuditSitemap

## Backend / Data

### Database Tables (58 tables)
**Core User Tables**: `profiles`, `subscriptions`, `user_roles`

**Content Tables**: `workout_templates`, `workout_exercises`, `program_weeks`, `program_day_workouts`, `program_day_exercises`, `program_tracks`, `faith_lessons`, `skill_lessons`, `discipline_routines`, `discipline_templates`, `meal_plan_templates`, `meal_plan_days`, `meal_plan_meals`, `nutrition_guidelines`

**User Progress Tables**: `check_ins`, `workout_completions`, `day_completions`, `habit_logs`, `progress_entries`, `progress_photos`, `user_milestones`

**Community Tables**: `community_channels`, `community_messages`, `community_wins`, `community_wins_likes`, `community_wins_comments`, `direct_messages`

**Coaching Tables**: `coaching_sessions`, `coaching_goals`, `coaching_action_items`, `coaching_spots`, `coaching_waitlist`

**E-commerce Tables**: `products`, `orders`, `order_items`

**System Tables**: `chat_leads`, `site_settings`, `program_welcome_videos`, `tier_onboarding_videos`, `warden_conversations`, `warden_messages`

### Subscription Tiers
| Tier | Plan Type | Price | Duration | Key Features |
|------|-----------|-------|----------|--------------|
| Solitary Confinement | `membership` | $49.99/mo | Recurring | Bodyweight workouts, discipline, basic nutrition |
| General Population | `transformation` | $379.99 | 98 days | 12-week program, faith, skills, community |
| Free World | `coaching` | $999.99/mo | Recurring | 1:1 coaching, custom program, direct messages |

### Edge Functions (13)
- `create-admin-user`, `daily-devotional`, `email-subscribe`
- `generate-onboarding-audio`, `generate-onboarding-script`
- `populate-meal-plans`, `populate-workouts`
- `sales-chat`, `send-notifications`
- `tier-onboarding-generate`
- `warden-brief`, `warden-chat`, `warden-tts`

### Third-Party Integrations
- **Stripe**: Placeholder (not integrated)
- **Supabase Storage**: avatars, products, program-videos, progress-photos, community-wins, onboarding-assets, tier-walkthroughs
- **ElevenLabs**: AI voice generation for Warden TTS

---

# PART 2: AUDIT FINDINGS

## A) CRITICAL BLOCKERS (Must Fix Before Launch)

### BLOCKER-001: Stripe Payment Not Integrated
- **Where**: `/checkout` (Checkout.tsx), `/shop/checkout` (shop/Checkout.tsx)
- **Steps to reproduce**: Click any "Join" CTA, attempt checkout
- **Expected**: Real payment processing
- **Actual**: Simulated 1.5s delay, subscription created without payment
- **Severity**: BLOCKER
- **Why it matters**: Zero revenue collection; anyone can get free access
- **Fix**: Integrate Stripe Checkout using Lovable's Stripe integration
- **Mobile Impact**: Yes - checkout must work on all devices
- **Effort**: L (1-2 days)

### BLOCKER-002: Admin Route Not Protected Server-Side
- **Where**: `/admin` route in AnimatedRoutes.tsx (lines 279-285)
- **Steps to reproduce**: Any authenticated user can visit `/admin`
- **Expected**: Server-side redirect for non-admins
- **Actual**: Client-side check in `AdminDashboard.tsx`, data still fetched before redirect
- **Severity**: BLOCKER
- **Why it matters**: Admin data briefly exposed; potential data leakage
- **Fix**: Add admin check to ProtectedRoute with separate `requireAdmin` prop; block at route level
- **Mobile Impact**: No
- **Effort**: S (1-2 hours)

### BLOCKER-003: RLS Policy Always True (INSERT/UPDATE)
- **Where**: Database - 2 policies flagged by linter
- **Steps to reproduce**: Run Supabase linter
- **Expected**: All policies scoped to user
- **Actual**: Some policies use `USING (true)` or `WITH CHECK (true)` for non-SELECT operations
- **Severity**: BLOCKER
- **Why it matters**: Unauthorized users could insert/update data
- **Fix**: Identify affected tables and add proper `auth.uid()` checks
- **Effort**: M (half day)

### BLOCKER-004: No Email Verification Enforcement
- **Where**: Signup flow in Login.tsx
- **Steps to reproduce**: Sign up with fake email
- **Expected**: Email must be verified before access
- **Actual**: Auto-confirm enabled, immediate access
- **Severity**: BLOCKER (for production)
- **Why it matters**: Spam accounts, abuse, no way to contact users
- **Fix**: Disable auto-confirm in production; add email verification flow
- **Note**: Currently intentional for dev, but must change before launch
- **Effort**: M (half day)

---

## B) HIGH PRIORITY IMPROVEMENTS (Major UX/Revenue Impact)

### HIGH-001: No Trial/Demo Mode
- **Where**: Checkout flow
- **Steps to reproduce**: New visitor cannot preview dashboard
- **Expected**: Trial or demo to reduce purchase friction
- **Actual**: Paywall-only access
- **Why it matters**: High drop-off at checkout without value preview
- **Fix**: Add 7-day trial with limited access or public demo video walkthrough
- **Effort**: L (1-2 days)

### HIGH-002: Checkout Abandonment Not Tracked
- **Where**: `/checkout`
- **Steps to reproduce**: Start checkout, leave page
- **Expected**: Abandonment saved, remarketing email
- **Actual**: Lost lead
- **Why it matters**: Revenue loss from 60-80% who abandon
- **Fix**: Save email early; trigger edge function for abandoned cart email
- **Effort**: M (half day)

### HIGH-003: Missing Webhook Handling for Stripe Events
- **Where**: Backend
- **Steps to reproduce**: Payment renewal, failure, refund
- **Expected**: DB sync with Stripe state
- **Actual**: No webhook receiver exists
- **Why it matters**: Paid users could lose access; unpaid could retain
- **Fix**: Create `stripe-webhook` edge function to handle all subscription events
- **Effort**: L (1-2 days)

### HIGH-004: No "Sync Subscription" Recovery Button
- **Where**: Settings or AccessExpired page
- **Steps to reproduce**: Subscription state mismatch
- **Expected**: User can manually trigger refresh
- **Actual**: Must wait for next login or contact support
- **Fix**: Add "Refresh My Access" button that re-fetches subscription
- **Effort**: XS (<30 min)

### HIGH-005: Dashboard First Load is Confusing
- **Where**: `/dashboard`
- **Steps to reproduce**: First login after intake
- **Expected**: Clear "Start Here" guidance, single CTA
- **Actual**: 12+ tiles visible, no clear path
- **Why it matters**: New user overwhelm leads to churn
- **Fix**: Highlight "Start Here" with animation; collapse other tiles until checklist complete
- **Mobile Impact**: Yes - especially overwhelming on small screens
- **Effort**: S (1-2 hours)

### HIGH-006: React Ref Warning in Console
- **Where**: WardenChat drawer component
- **Steps to reproduce**: Open Warden Chat
- **Expected**: No console warnings
- **Actual**: "Function components cannot be given refs" warning
- **Why it matters**: Degrades developer experience; potential hydration issues
- **Fix**: Add `forwardRef` to Drawer primitive or upgrade vaul library
- **Effort**: S (1-2 hours)

---

## C) MEDIUM PRIORITY IMPROVEMENTS

### MED-001: Workouts Page Empty State Not Actionable
- **Where**: `/dashboard/workouts` (Workouts.tsx line 55-62)
- **Steps to reproduce**: No templates configured
- **Expected**: Admin prompt or coming soon message
- **Actual**: "View 12-Week Program" CTA (may be locked for Solitary users)
- **Fix**: Tier-aware empty state; Solitary should link to templates being added
- **Effort**: XS (<30 min)

### MED-002: Week Builder UI is Non-Functional Placeholder
- **Where**: `/dashboard/workouts` (lines 112-135)
- **Steps to reproduce**: View "Your Weekly Schedule" section
- **Expected**: Interactive drag-drop week planner
- **Actual**: Static placeholder with empty boxes
- **Fix**: Either implement or remove; placeholders confuse users
- **Effort**: L (1-2 days) to implement; XS to remove

### MED-003: Photo Upload Missing Camera Access Prompt
- **Where**: Intake step 4, Progress photos
- **Steps to reproduce**: Upload photo on mobile
- **Expected**: Option to take photo with camera
- **Actual**: Only file picker
- **Mobile Impact**: Yes - major friction
- **Fix**: Add `capture="environment"` attribute to input; offer camera option
- **Effort**: XS (<30 min)

### MED-004: Check-In Page Has No Preview of Previous Submissions
- **Where**: `/dashboard/check-in`
- **Steps to reproduce**: User wants to see last week's check-in
- **Expected**: History view
- **Actual**: Only new submission form
- **Fix**: Add "Previous Check-Ins" accordion or tab
- **Effort**: S (1-2 hours)

### MED-005: No Cancel Subscription Flow
- **Where**: Settings page, Help page
- **Steps to reproduce**: User wants to cancel
- **Expected**: Self-service cancel button with confirmation
- **Actual**: "Contact support"
- **Why it matters**: Legal requirement in many jurisdictions; friction creates refund requests
- **Fix**: Add cancel button with retention offer
- **Effort**: M (half day)

### MED-006: Discipline Template Not Selected by Default
- **Where**: `/dashboard/discipline`
- **Steps to reproduce**: New user visits Discipline page
- **Expected**: Default template pre-selected
- **Actual**: "No Routines Set" message
- **Fix**: Auto-assign default template on signup or show recommended
- **Effort**: S (1-2 hours)

---

## D) LOW PRIORITY POLISH

### LOW-001: Footer Year is Static
- **Where**: Footer.tsx
- **Steps to reproduce**: View footer
- **Expected**: `© 2026` (dynamic)
- **Actual**: May be hardcoded
- **Fix**: Use `new Date().getFullYear()`
- **Effort**: XS (<30 min)

### LOW-002: No Loading Skeleton on Program Page
- **Where**: `/dashboard/program`
- **Steps to reproduce**: Load page with slow connection
- **Expected**: Skeleton placeholders
- **Actual**: Single spinner
- **Fix**: Add skeleton grid matching workout cards
- **Effort**: XS (<30 min)

### LOW-003: "Add to Calendar" Button Defaults to 6 AM
- **Where**: Workouts.tsx (lines 81-89)
- **Steps to reproduce**: Click calendar button
- **Expected**: Prompt for time selection
- **Actual**: Hardcoded 6:00 AM
- **Fix**: Add time picker modal before generating calendar event
- **Effort**: S (1-2 hours)

### LOW-004: Missing Favicon Animation for New Notifications
- **Where**: Browser tab
- **Steps to reproduce**: Receive notification while on different tab
- **Expected**: Badge on favicon
- **Actual**: No indicator
- **Fix**: Add badge or tab title update
- **Effort**: S (1-2 hours)

### LOW-005: No Transition Animation Between Dashboard Tiles
- **Where**: Dashboard
- **Steps to reproduce**: Click tile
- **Expected**: Smooth route transition
- **Actual**: Works but could be smoother
- **Fix**: Already using Framer Motion PageTransition - verify all routes wrapped
- **Effort**: XS (<30 min)

---

## E) MOBILE-FIRST ISSUES + FIXES

### MOB-001: Homepage Hero CTA "Join General Population" Truncated
- **Where**: `/` hero section
- **Device**: iPhone SE (320px width)
- **Expected**: Full button text visible
- **Actual**: Text wraps awkwardly or overflows
- **Fix**: Already has `hidden sm:inline` for long text; verify works at 320px
- **Effort**: XS (<30 min)

### MOB-002: Intake Form Step Icons Clipping on Small Screens
- **Where**: `/intake` step indicator
- **Device**: iPhone SE, older Android
- **Expected**: Icons fully visible
- **Actual**: Icons clip beneath hero banner
- **Fix**: Already has `pt-4 sm:pt-0` - verify adequate spacing
- **Effort**: XS (<30 min)

### MOB-003: Dashboard Tiles Grid Too Dense
- **Where**: `/dashboard`
- **Device**: Any mobile
- **Expected**: Stacked tiles with clear tap targets
- **Actual**: 2-column grid cramped on narrow phones
- **Fix**: Switch to single column under 400px; increase vertical gap
- **Effort**: S (1-2 hours)

### MOB-004: Bottom Navigation Z-Index Conflict with FABs
- **Where**: Dashboard pages with Warden FAB
- **Device**: All mobile
- **Steps to reproduce**: Scroll, FAB overlaps nav
- **Expected**: FABs stack above bottom nav
- **Actual**: Already positioned at `bottom-20` - verify on all pages
- **Fix**: Audit all FAB components for consistent positioning
- **Effort**: XS (<30 min)

### MOB-005: Settings Page Scroll Too Long
- **Where**: `/dashboard/settings`
- **Device**: Mobile
- **Steps to reproduce**: Scroll to see all sections
- **Expected**: Collapsible sections or tabs
- **Actual**: Long single scroll
- **Fix**: Add accordion sections or tab navigation for mobile
- **Effort**: S (1-2 hours)

### MOB-006: Input Zoom on iOS Not Prevented Everywhere
- **Where**: Various forms
- **Device**: iPhone
- **Steps to reproduce**: Tap input field with font-size < 16px
- **Expected**: No zoom
- **Actual**: iOS auto-zooms to read small text
- **Fix**: Ensure all inputs have `text-base` or larger font
- **Effort**: S (1-2 hours)

### MOB-007: Mobile Header Menu Cart Icon Placement
- **Where**: Header mobile menu
- **Device**: Mobile
- **Expected**: Cart visible without opening menu
- **Actual**: Cart inside menu - requires extra tap
- **Fix**: Move cart icon to main header bar (left of hamburger)
- **Effort**: S (1-2 hours)

### MOB-008: Swipe Gestures Not Implemented
- **Where**: Workout cards, photo gallery
- **Device**: Mobile
- **Expected**: Swipe to complete, swipe to navigate
- **Actual**: Tap only
- **Fix**: Add swipe-to-complete on workout items using framer-motion gestures
- **Effort**: M (half day)

### MOB-009: Pull-to-Refresh Not Implemented
- **Where**: Dashboard, Program, Check-In
- **Device**: Mobile (PWA)
- **Expected**: Pull-to-refresh like native app
- **Actual**: Must use browser refresh
- **Fix**: Implement pull-to-refresh hook with visual indicator
- **Effort**: M (half day)

### MOB-010: Keyboard Covers Submit Button on Forms
- **Where**: Check-In, Contact forms
- **Device**: iOS
- **Steps to reproduce**: Fill form, keyboard open
- **Expected**: Submit button visible
- **Actual**: Covered by keyboard
- **Fix**: Add padding-bottom when keyboard active; use `visualViewport` API
- **Effort**: S (1-2 hours)

---

## F) ADMIN OPS ISSUES + FIXES

### ADM-001: No Bulk User Export
- **Where**: Admin > People
- **Steps to reproduce**: Try to export user list
- **Expected**: CSV download button
- **Actual**: No export functionality
- **Fix**: Add "Export CSV" button with email, tier, signup date
- **Effort**: S (1-2 hours)

### ADM-002: Check-In Review Has No Bulk Actions
- **Where**: Admin > People > Check-Ins tab
- **Steps to reproduce**: Review multiple check-ins
- **Expected**: Select all, mark reviewed
- **Actual**: One-by-one only
- **Fix**: Add checkboxes and bulk "Mark Reviewed" button
- **Effort**: S (1-2 hours)

### ADM-003: Content CMS Lacks Version History
- **Where**: Admin > Content > any manager
- **Steps to reproduce**: Edit workout, want to undo
- **Expected**: Previous versions visible
- **Actual**: No history
- **Fix**: Add `_history` shadow tables or use soft-delete with `updated_at` log
- **Effort**: L (1-2 days)

### ADM-004: No Real-Time Notifications for Admin
- **Where**: Admin dashboard
- **Steps to reproduce**: New user signs up
- **Expected**: Toast or badge update
- **Actual**: Must refresh to see new data
- **Fix**: Subscribe to Supabase realtime for key tables
- **Effort**: M (half day)

### ADM-005: Revenue Analytics Missing Key Metrics
- **Where**: Admin > Command Center
- **Steps to reproduce**: View RevenueAnalytics
- **Expected**: MRR, churn rate, LTV
- **Actual**: Basic totals only (placeholder)
- **Fix**: Calculate and display MRR, churn %, avg subscription length
- **Effort**: M (half day)

### ADM-006: Video Upload Progress Not Shown
- **Where**: Admin > Content > Welcome Videos
- **Steps to reproduce**: Upload 100MB+ video
- **Expected**: Upload progress bar
- **Actual**: Only spinning loader
- **Fix**: Use Supabase's upload with progress callback; display percentage
- **Effort**: S (1-2 hours)

---

## G) SECURITY + ACCESS CONTROL FINDINGS

### SEC-001: Sales Chat Has No Rate Limiting
- **Where**: `sales-chat` edge function
- **Risk Level**: WARN
- **Issue**: Anonymous access to AI chat without rate limits could lead to abuse
- **Fix**: Add IP-based rate limiting or session throttling
- **Effort**: M (half day)

### SEC-002: Public Storage Buckets Contain Potentially Sensitive Content
- **Where**: `community-wins`, `program-videos` buckets
- **Risk Level**: INFO
- **Issue**: User transformation photos and program content publicly accessible if URL known
- **Fix**: Consider signed URLs for community-wins; evaluate if program-videos need auth
- **Effort**: M (half day)

### SEC-003: Leaked Password Protection Disabled
- **Where**: Supabase Auth settings
- **Risk Level**: WARN
- **Issue**: Supabase can check passwords against breach databases but it's off
- **Fix**: Enable leaked password protection in Supabase dashboard
- **Effort**: XS (<30 min)

### SEC-004: Extension Installed in Public Schema
- **Where**: Database
- **Risk Level**: WARN
- **Issue**: Some extensions in public schema could be security risk
- **Fix**: Move extensions to separate schema per Supabase recommendations
- **Effort**: S (1-2 hours)

### SEC-005: Admin Preview Mode Could Be Exploited
- **Where**: AdminPreviewContext
- **Risk Level**: LOW
- **Issue**: Admin can preview any tier, but UI properly restricts this to admins only
- **Current Status**: Properly gated - no action needed

---

## H) PERFORMANCE + SPEED FINDINGS

### PERF-001: Program Page Fetches All 12 Weeks on Load
- **Where**: `/dashboard/program`
- **Steps to reproduce**: Load program page
- **Expected**: Load current week, lazy-load others
- **Actual**: Fetches all weeks, all workouts, all exercises upfront
- **Fix**: Paginate by week; load week details on expand
- **Effort**: M (half day)

### PERF-002: Large Images Not Optimized
- **Where**: Homepage hero, product images
- **Steps to reproduce**: Lighthouse audit
- **Expected**: WebP, lazy-loading, srcset
- **Actual**: JPGs at full resolution
- **Fix**: Convert to WebP; add responsive srcset; ensure lazy-loading
- **Effort**: S (1-2 hours)

### PERF-003: No Service Worker Cache Strategy
- **Where**: `public/sw.js`
- **Steps to reproduce**: Check PWA cache behavior
- **Expected**: Cache-first for static assets
- **Actual**: Basic service worker - verify caching strategy
- **Fix**: Implement cache-first for assets, network-first for API
- **Effort**: M (half day)

### PERF-004: Auth Context Fetches Profile + Subscription in Parallel (Good)
- **Where**: AuthContext.tsx
- **Status**: Already optimized with `Promise.all`
- **No action needed**

### PERF-005: Dashboard Has Multiple Data Fetching Hooks
- **Where**: Dashboard.tsx and child components
- **Issue**: Multiple hooks fetch overlapping data
- **Fix**: Consider consolidating into single `useDashboardData` hook
- **Effort**: M (half day)

---

## I) COPYWRITING + CONVERSION IMPROVEMENTS

### COPY-001: Homepage Hero H1 Should Be Benefit-First
- **Current**: "From Locked Up to Locked In."
- **Issue**: Clever but doesn't immediately convey value
- **Suggested**: Keep tagline but add clear subhead: "Build the Body. Discipline. Faith. Brotherhood — in 12 Weeks."
- **Effort**: XS (<30 min)

### COPY-002: Pricing Cards Need Stronger Differentiation
- **Where**: Homepage programs section
- **Issue**: Features lists look similar; value difference unclear
- **Fix**: Add "Best for..." line to each: "Best for: Men starting their fitness journey", "Best for: Men ready for complete transformation"
- **Effort**: XS (<30 min)

### COPY-003: Checkout Page Missing Urgency
- **Where**: `/checkout`
- **Issue**: No scarcity or urgency elements
- **Fix**: Add "Limited Spots" for coaching; countdown timer for special pricing
- **Effort**: S (1-2 hours)

### COPY-004: Dashboard Empty States Need Motivation
- **Where**: Various empty states (workouts, check-ins)
- **Current**: "No workout templates available"
- **Fix**: "Your iron is being forged. Check back soon or start with The Sentence."
- **Effort**: XS (<30 min)

### COPY-005: Error Messages Too Technical
- **Where**: Various toast messages
- **Current**: "Failed to save profile. Please try again."
- **Fix**: "Something went wrong. Let's try that again. If this keeps happening, contact your CO."
- **Effort**: XS (<30 min)

### COPY-006: Access Expired Page Copy Is Perfect
- **Where**: `/access-expired`
- **Status**: On-brand with "Sentence Complete" messaging - no changes needed

### COPY-007: CTA Button Text Should Be More Specific
- **Where**: Various pages
- **Current**: "Get Started"
- **Fix**: "Start Your Sentence" / "Enter Solitary" / "Book Your Spot"
- **Note**: Already done on most CTAs - verify consistency
- **Effort**: XS (<30 min)

---

# PART 3: IMPLEMENTATION FIX PLAN (Ordered Checklist)

## Phase 1: Launch Blockers (Before Go-Live)

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 1 | Integrate Stripe payment for subscriptions | BLOCKER | L | TODO |
| 2 | Create Stripe webhook edge function | BLOCKER | L | TODO |
| 3 | Add server-side admin protection to routes | BLOCKER | S | TODO |
| 4 | Fix RLS policies flagged by linter | BLOCKER | M | TODO |
| 5 | Enable leaked password protection | BLOCKER | XS | TODO |
| 6 | Add email verification flow (production only) | BLOCKER | M | TODO |

## Phase 2: Revenue & Retention (Week 1 Post-Launch)

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 7 | Add abandoned checkout email trigger | HIGH | M | TODO |
| 8 | Build self-service cancel subscription flow | MED | M | TODO |
| 9 | Add "Refresh My Access" recovery button | HIGH | XS | TODO |
| 10 | Implement trial or demo mode | HIGH | L | TODO |
| 11 | Add upgrade prompts with scarcity messaging | MED | S | TODO |

## Phase 3: Mobile Excellence (Week 2)

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 12 | Switch dashboard to single-column on narrow screens | HIGH | S | TODO |
| 13 | Fix input zoom on iOS across all forms | MED | S | TODO |
| 14 | Move cart icon outside mobile menu | MED | S | TODO |
| 15 | Add camera capture option for photo uploads | MED | XS | TODO |
| 16 | Implement pull-to-refresh for PWA | LOW | M | TODO |
| 17 | Add swipe gestures for workout completion | LOW | M | TODO |
| 18 | Fix keyboard covering submit buttons | MED | S | TODO |

## Phase 4: Admin & Operations (Week 3)

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 19 | Add CSV export for user list | HIGH | S | TODO |
| 20 | Add bulk actions for check-in review | MED | S | TODO |
| 21 | Show upload progress for videos | MED | S | TODO |
| 22 | Add real-time notifications for admin | LOW | M | TODO |
| 23 | Add MRR/churn metrics to analytics | MED | M | TODO |

## Phase 5: Polish & Performance (Week 4)

| # | Task | Priority | Effort | Status |
|---|------|----------|--------|--------|
| 24 | Fix React ref warning in WardenChat | HIGH | S | TODO |
| 25 | Lazy-load program weeks on expand | MED | M | TODO |
| 26 | Optimize images to WebP with srcset | MED | S | TODO |
| 27 | Implement proper service worker caching | LOW | M | TODO |
| 28 | Add skeleton loaders to all major pages | LOW | S | TODO |
| 29 | Update all copywriting per recommendations | LOW | S | TODO |

---

# PART 4: REGRESSION TEST CHECKLIST

## User Flows

### Signup & Onboarding
- [ ] Visit homepage on iPhone SE
- [ ] Click "Join General Population" - verify button not clipped
- [ ] Complete checkout with test Stripe card
- [ ] Verify subscription created in database
- [ ] Complete intake form (all 4 steps)
- [ ] Verify photos upload successfully
- [ ] Watch onboarding video to completion
- [ ] Verify redirected to dashboard
- [ ] Confirm "Start Here" tile highlighted

### Tier Access Control
- [ ] Login as `solitary@test.com` (password: test1234)
- [ ] Verify "The Sentence" tile shows locked
- [ ] Click locked tile - verify upgrade modal appears
- [ ] Try direct URL `/dashboard/program` - verify redirect or upgrade prompt
- [ ] Login as `genpop@test.com` (password: test1234)
- [ ] Verify full access to program, faith, skills, community
- [ ] Verify "Direct Line" and "Coaching Portal" show locked
- [ ] Login as `freeworld@test.com` (password: test1234)
- [ ] Verify full access to all features including coaching

### Payment & Subscription
- [ ] Simulate successful payment webhook
- [ ] Verify subscription status updates
- [ ] Simulate failed renewal webhook
- [ ] Verify user redirected to AccessExpired
- [ ] Use "Refresh My Access" button - verify works
- [ ] Test cancel subscription flow
- [ ] Test reactivation flow

### Dashboard Tiles (Test Each)
- [ ] Start Here - loads, checklist works
- [ ] The Sentence - weeks expand, exercises load
- [ ] Yard Time - templates load, can start workout
- [ ] Lights On/Out - routines toggle, streak updates
- [ ] Chow Hall - meal plan loads
- [ ] Chapel - faith lessons load
- [ ] Roll Call - check-in form submits
- [ ] Time Served - progress displays
- [ ] Mugshots - photos gallery loads
- [ ] Work Release - skills load
- [ ] The Yard - community messages load
- [ ] Coaching Portal (Free World) - sessions display
- [ ] Direct Line (Free World) - messages send

### Admin Functions
- [ ] Login as admin
- [ ] Command Center - analytics load
- [ ] People Hub - user list loads, can search
- [ ] Click user - detail panel opens
- [ ] Check-Ins tab - pending count accurate
- [ ] Review a check-in - mark as reviewed
- [ ] Commissary - products display
- [ ] Content CMS - can edit workout
- [ ] Welcome Videos - can upload video
- [ ] Settings - Calendly URL saves

### Mobile Specific
- [ ] Test on iPhone SE (320px)
- [ ] Test on iPhone 14 Pro (390px)
- [ ] Test on Pixel 7 (412px)
- [ ] Verify bottom nav doesn't overlap FABs
- [ ] Verify no horizontal scroll on any page
- [ ] Verify all forms submittable with keyboard open
- [ ] Test PWA install prompt appears
- [ ] Test offline indicator appears when disconnected

### Performance
- [ ] Lighthouse mobile score > 70
- [ ] First Contentful Paint < 2s
- [ ] No console errors (except expected dev warnings)
- [ ] No network 5xx errors

---

# SUMMARY

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Blockers | 4 | - | - | - | 4 |
| UX/Revenue | - | 6 | 6 | 5 | 17 |
| Mobile | - | 2 | 5 | 3 | 10 |
| Admin | - | 1 | 3 | 2 | 6 |
| Security | - | 1 | 2 | 1 | 4 |
| Performance | - | - | 4 | 1 | 5 |
| Copywriting | - | - | 3 | 4 | 7 |
| **TOTAL** | **4** | **10** | **23** | **16** | **53** |

**Estimated Total Effort**: ~15-20 developer days to address all findings

**Recommended Launch Approach**:
1. Fix 4 blockers (3-4 days)
2. Soft launch with close monitoring
3. Address high-priority items in first 2 weeks
4. Continuous improvement for medium/low items
