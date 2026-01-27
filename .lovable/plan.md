

# Content Engine - Implementation Plan

## What We're Building

A dedicated admin section that turns Dom's lifestyle and platform into a content machine. The system will:

1. **Generate fresh content ideas** using AI, tailored to Dom's brand voice
2. **Organize content by category** matching the mission (Faith, Discipline, Training, etc.)
3. **Support two creation modes**: Done-For-You scripts and Freestyle Frameworks
4. **Store approved content** for reuse while tracking what's been posted
5. **Provide clear, actionable output** that anyone could follow

---

## User Experience Overview

### Navigation
A new "Content Engine" item will appear in the Admin Sidebar under a new "Growth" category (matching the brand's orange/fire color). Clicking it opens the full Content Engine view.

### Main Interface Layout

```text
+------------------------------------------+
|  CONTENT ENGINE                          |
|  "Your daily content playbook"           |
+------------------------------------------+
|                                          |
|  [ Generate Fresh Ideas ]    [ My Saved ]|
|                                          |
|  MODE:  [Done-For-You] [Freestyle]       |
|                                          |
+------------------------------------------+
|  CATEGORIES (pill tabs)                  |
|  [Faith] [Discipline] [Training]         |
|  [Transformations] [Authority] [Platform]|
+------------------------------------------+
|                                          |
|  CONTENT CARDS                           |
|  +------------------------------------+  |
|  | "The Comeback Mindset"             |  |
|  | Platform: IG Reels, TikTok, Shorts |  |
|  | Format: Talking to camera          |  |
|  |                                    |  |
|  | HOOK: "Most men don't fail..."     |  |
|  | [View Full Script] [Mark as Used]  |  |
|  +------------------------------------+  |
|                                          |
+------------------------------------------+
```

### Content Card Details (Expanded View)

Each card expands to show:

| Field | Description |
|-------|-------------|
| **Title** | Clear post name |
| **Platforms** | Icons: IG, TikTok, YouTube, X |
| **Format** | How to film it (talking head, workout clip, voiceover, screen walkthrough) |
| **Hook** | First 1-2 attention-grabbing lines |
| **Talking Points** | 3-5 bullet points to cover |
| **Filming Tips** | Plain-language shooting instructions |
| **CTA** | What to say at the end (links back to platform) |
| **Status** | Fresh / Used / Favorite |

---

## How Content Generation Works

### Generate Fresh Ideas Flow

1. Dom clicks **"Generate Fresh Ideas"**
2. Selects a category (or "Surprise Me")
3. Selects the mode: Done-For-You or Freestyle
4. AI generates 3-5 content ideas using the brand voice
5. Dom reviews each idea:
   - **Save** → Adds to library
   - **Regenerate** → Get a new version
   - **Skip** → Dismiss

### Brand Voice System Prompt

The AI will use a carefully crafted system prompt that captures Dom's voice:
- Masculine, disciplined, grounded
- Faith-based but not preachy
- Direct and real, no influencer gimmicks
- References prison metaphors and redemption themes
- Uses "iron sharpens iron" mentality

---

## Content Categories

| Category | Theme | Example Content |
|----------|-------|-----------------|
| **Faith & Redemption** | Who you were vs. who you're becoming | "God didn't waste your past" |
| **Discipline & Structure** | Daily routines, accountability | "5AM isn't the answer. Consistency is." |
| **Workout & Training** | Follow-along, progress over perfection | "Train with me: Prison-style push day" |
| **Transformations** | Member wins, mindset shifts | "He lost 40lbs but gained his family back" |
| **Education & Authority** | Teaching concepts, breaking down mistakes | "Why motivation is a lie" |
| **Platform-Led** | Inside the system, feature walkthroughs | "This is what Solitary members get" |

---

## Two Content Modes

### Mode 1: Done-For-You Posts
Complete, ready-to-record scripts:
- Exact hook written out
- Word-for-word talking points
- Specific filming instructions
- Ready CTA with link reference

### Mode 2: Freestyle Frameworks
Fill-in-the-blank structure:
- Hook formula: "Most men [problem]. Here's why [solution]..."
- Prompt questions to spark ideas
- Flexible talking point structure
- CTA guidance (not exact wording)

---

## Data Storage

### New Database Table: `content_engine_posts`

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| category | text | faith, discipline, training, etc. |
| mode | text | done_for_you or freestyle |
| title | text | Post title |
| platforms | text[] | Array of platform names |
| format | text | Filming format type |
| hook | text | Opening hook |
| talking_points | jsonb | Array of bullet points |
| filming_tips | text | How to shoot it |
| cta | text | Call to action |
| status | text | fresh, used, favorite |
| created_at | timestamp | When generated |
| used_at | timestamp | When marked as used |

---

## Files to Create

### 1. Admin Sidebar Update
**File:** `src/components/admin/AdminSidebar.tsx`
- Add "Content Engine" to the navigation under a new "Growth" category
- Use `Flame` or `Megaphone` icon
- Orange/fire color accent

### 2. Content Engine Hub
**File:** `src/components/admin/ContentEngineHub.tsx`
- Main container component
- Header with generate button
- Mode toggle (Done-For-You / Freestyle)
- Category tabs
- Content card grid

### 3. Content Card Component
**File:** `src/components/admin/content-engine/ContentCard.tsx`
- Collapsed: Title, platforms, hook preview
- Expanded: Full details, actions
- Status badges (Fresh, Used, Favorite)

### 4. Content Generator Modal
**File:** `src/components/admin/content-engine/ContentGeneratorModal.tsx`
- Category selector
- Mode selector
- Generated ideas display
- Save/Regenerate/Skip actions

### 5. Content Engine Hook
**File:** `src/hooks/useContentEngine.ts`
- CRUD operations for content posts
- Filter by category, mode, status
- Mark as used/favorite

### 6. AI Generation Edge Function
**File:** `supabase/functions/generate-content-ideas/index.ts`
- Receives category + mode
- Uses brand voice system prompt
- Returns 3-5 structured content ideas
- Uses Lovable AI (Gemini)

---

## Technical Details

### Edge Function: Content Generation

The function will:
1. Accept category and mode parameters
2. Use a brand-voice system prompt
3. Call Lovable AI with structured output (tool calling)
4. Return JSON with:
   - title
   - platforms array
   - format
   - hook
   - talking_points array
   - filming_tips
   - cta

### RLS Policies

- Only admins can read/write to `content_engine_posts`
- Policy: `auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')`

---

## UI Styling

Following existing admin patterns:
- **Background:** `bg-charcoal` cards with `border-border`
- **Active states:** Orange/fire color for Content Engine theme
- **Icons:** Platform-specific (Instagram, TikTok, YouTube, X)
- **Badges:** Status indicators matching existing badge styles
- **Buttons:** `variant="gold"` for primary actions

---

## Implementation Order

1. **Database:** Create `content_engine_posts` table with RLS
2. **Sidebar:** Add Content Engine navigation item
3. **Dashboard:** Wire up the new section in AdminDashboard.tsx
4. **Hub Component:** Build the main Content Engine interface
5. **Hook:** Create useContentEngine for data operations
6. **Edge Function:** Build AI content generation
7. **Generator Modal:** Create the generate flow UI
8. **Content Cards:** Build card display and interactions

---

## What This Delivers

| Pain Point | Solution |
|------------|----------|
| "What should I post?" | Category-organized ideas on demand |
| "How should I say it?" | Done-For-You scripts with exact wording |
| "Where does this lead?" | Every post has a CTA back to the platform |
| "I don't want to sound like a marketer" | Brand voice baked into AI generation |
| "I need flexibility sometimes" | Toggle to Freestyle mode for structure without scripts |

The Content Engine becomes Dom's daily content coach, removing all friction between "I should post" and actually recording.

