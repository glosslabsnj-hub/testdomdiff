
## Objective (what “fixed” means)
Inside **Admin → Free World → select client → Program tab**:
1) The page should **not** scroll the entire browser window to reach program/template content.
2) The **Program tab** should have a **reliable internal scroll area** so you can view:
   - all templates in the recommended category
   - the full 4-week preview
   - the “Assign Template” button (fully visible and clickable)
3) No “bottom-right floating UI” (Warden/Quick Action) should cover critical admin controls.

---

## What I found (audit summary)
### A) Admin page is designed like a marketing page (Header + big Footer)
- `AdminDashboard` uses the **public Header** (fixed) + **public Footer** (tall).  
- That alone creates “whole screen scroll” behavior and makes the Free World hub feel cramped because you’re fighting page scroll + internal scroll.

### B) FreeWorldHub height math is fighting its own header
- `FreeWorldHub` currently renders a header block **above** a grid that has a viewport height (`h-[calc(100vh-220px)]`).  
- Header height + grid height often exceeds the visible area, so the browser window scrolls.

### C) Client tabs use `absolute inset-0` panels (high risk for scroll bugs)
- In `ClientProgressPanel`, all `TabsContent` are `absolute inset-0 overflow-y-auto`.  
- This is fragile when nested in fixed-height containers and tends to create “tiny scroll windows” or clipped bottoms (exactly what you’re seeing).

### D) Fixed-position overlays can cover the “Assign” button
- Logged-in users see `WardenChat` / `GlobalQuickAction` from `FloatingActionStack` (fixed positions).  
- On admin screens, these are not needed and can sit on top of the bottom of the Program tab, hiding the final button.

---

## Implementation plan (what I will change)

### 1) Make AdminDashboard an “app shell” (stop whole-window scrolling on admin)
**File:** `src/pages/admin/AdminDashboard.tsx`

**Changes:**
- Convert the admin page wrapper from “document scroll” to “contained scroll”:
  - set the root wrapper to something like: `h-screen overflow-hidden flex flex-col`
  - keep the fixed `Header` (already fixed)
  - make `<main>` a flex column with `min-h-0` so it can host scroll containers correctly.
- Remove or suppress the big public `<Footer />` for `/admin` (recommended).
  - Admin should feel like a dashboard, not a marketing page.
  - This alone removes a huge portion of accidental page scrolling.

**Result:** Admin route behaves like a real dashboard; the Free World hub can own its scroll behavior.

---

### 2) Make the Admin tabs layout height-aware (each tab scrolls where appropriate)
**File:** `src/pages/admin/AdminDashboard.tsx`

**Changes:**
- Turn the Tabs container into a vertical layout:
  - Tabs root: `className="flex-1 flex flex-col min-h-0"`
- Give each top-level `TabsContent` one of these patterns:
  - For long “report-like” tabs (Command Center, Content CMS): `flex-1 min-h-0 overflow-y-auto`
  - For Free World: `flex-1 min-h-0 overflow-hidden` (because we want split-pane internal scrolling, not page scrolling)

**Result:** Scrolling is predictable: you scroll inside the active admin tab content, not the whole page.

---

### 3) Fix FreeWorldHub split-pane to use “fill parent” instead of viewport math
**File:** `src/components/admin/FreeWorldHub.tsx`

**Changes:**
- Replace the current “header + fixed-height grid” approach with:
  - `div className="h-full flex flex-col min-h-0"` wrapper
  - header becomes `flex-none`
  - split-pane grid becomes `flex-1 min-h-0 overflow-hidden`
- Remove `h-[calc(100vh-220px)]` entirely and use `h-full`/flex sizing.

**Result:** Free World hub never forces page scroll; it fills whatever space the Admin tabs give it.

---

### 4) Rebuild ClientProgressPanel tabs to use flex scrolling (remove absolute panels)
**File:** `src/components/admin/coaching/ClientProgressPanel.tsx`

**Changes:**
- Remove the `relative` + `absolute inset-0` tab panel strategy.
- Use the stable pattern:
  - Tabs root: `flex-1 flex flex-col min-h-0`
  - After TabsList: a wrapper `div className="flex-1 min-h-0 overflow-y-auto"`
  - Inside wrapper, keep `TabsContent` in normal flow (`m-0 p-4` etc)
- Add consistent bottom padding to the scroll area: `pb-28` (or similar) so even if any overlay exists, your last button is still reachable.

**Result:** Program tab scroll works reliably; no clipped bottoms.

---

### 5) Make the “Assign Template” action unmissable (sticky action bar)
**File:** `src/components/admin/coaching/TemplateAssignment.tsx`

**Changes:**
- Wrap the Assign button area in a `sticky bottom-0` container with a subtle background and border.
- Keep the preview scrollable above it.
- This guarantees the CTA is always visible even with long 4-week previews.

**Result:** You never “lose” the assign button at the bottom of the preview.

---

### 6) Disable floating Warden/Quick Action UI on /admin routes
**File:** `src/components/FloatingActionStack.tsx` (primary)
- Add a route guard: if `location.pathname.startsWith("/admin")`, return `null`.

(Optionally also guard inside `WardenChat` if needed, but best is stopping it at the stack.)

**Result:** Admin tools are not obstructed by coaching/user UX overlays.

---

## Validation checklist (how we’ll confirm it’s fixed)
1) Go to `/admin` → Free World tab: page should **not** show long window scrolling just to use Free World tools.
2) Select a client → Program tab:
   - Scroll through template list: scroll stays inside the panel.
   - Select a template → preview expands:
     - You can scroll the preview fully.
     - “Assign Template” is always reachable (preferably sticky).
3) Test at multiple viewport sizes:
   - Desktop (1366×768)
   - Smaller laptop height (e.g., 768×700-ish)
   - Mobile width (390×844) if you use admin on phone.
4) Confirm no overlapping:
   - Warden/QuickAction does not appear on admin pages.
   - No bottom content is hidden.

---

## Scope control / non-goals (to keep this fast and correct)
- This plan focuses on **layout + scroll containment + button visibility** for Free World admin.
- It does not change the program assignment logic (your 4-week template assignment system remains as-is).

---

## Files expected to change
- `src/pages/admin/AdminDashboard.tsx`
- `src/components/admin/FreeWorldHub.tsx`
- `src/components/admin/coaching/ClientProgressPanel.tsx`
- `src/components/admin/coaching/TemplateAssignment.tsx`
- `src/components/FloatingActionStack.tsx`
