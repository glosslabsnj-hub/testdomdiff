

# Custom Program: Admin Upload & User Dashboard Integration

## Overview

This plan transforms the "Custom Program" tile from a static placeholder into a dynamic feature. Dom will be able to upload personalized program files (PDFs, videos, etc.) for each Free World coaching client directly from the admin panel. The client will then see their uploaded program materials in their Custom Program dashboard page.

---

## Database Design

### New Table: `client_custom_programs`

Stores custom program files uploaded by the admin for specific coaching clients.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID | References the client's user ID |
| `title` | TEXT | Program title (e.g., "Week 1-4 Foundation Phase") |
| `description` | TEXT | Optional notes about the program |
| `file_url` | TEXT | Storage URL for the uploaded file |
| `file_type` | TEXT | MIME type (pdf, video, image) |
| `display_order` | INTEGER | Controls display order in client dashboard |
| `is_active` | BOOLEAN | Whether to show in client dashboard |
| `created_at` | TIMESTAMP | Upload timestamp |
| `updated_at` | TIMESTAMP | Last modified |

**RLS Policies:**
- Admins can INSERT/UPDATE/DELETE any row
- Clients can only SELECT rows where `client_id` matches their user ID

---

## Storage Configuration

### New Bucket: `client-programs`

- **Public:** No (private bucket - files are client-specific)
- **RLS Policies:**
  - Admins can upload/update/delete any file
  - Clients can only download files in their own folder (path: `{client_id}/...`)

---

## Admin Panel Changes

### File: `ClientProgressPanel.tsx`

Add a new "Custom Program" tab alongside Overview, Sessions, Goals & Actions, and Messages.

**New Tab UI:**
```text
┌─────────────────────────────────────────────────────────┐
│  [Overview] [Sessions] [Goals] [Messages] [Program] ◄── NEW TAB
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 Client's Custom Program                            │
│  ─────────────────────────────────────────             │
│                                                         │
│  [+ Upload Program File]                               │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ 📄 Week 1-4 Foundation Phase           │           │
│  │    PDF • Uploaded Jan 15, 2026          │           │
│  │    [View] [Delete]                      │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
│  ┌─────────────────────────────────────────┐           │
│  │ 📄 Nutrition Guidelines                 │           │
│  │    PDF • Uploaded Jan 15, 2026          │           │
│  │    [View] [Delete]                      │           │
│  └─────────────────────────────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Upload button opens file picker (PDF, image, video supported)
- Each uploaded file shows title, type, date
- Inline editing of title/description
- Drag-to-reorder for display_order
- Delete button with confirmation

---

## New Component: `ClientProgramTab.tsx`

Located in `src/components/admin/coaching/ClientProgramTab.tsx`

**Responsibilities:**
- Fetch existing program files for selected client
- Handle file uploads to `client-programs` bucket
- Save metadata to `client_custom_programs` table
- CRUD operations for program entries

---

## New Hook: `useClientCustomPrograms.ts`

Located in `src/hooks/useClientCustomPrograms.ts`

**Functions:**
- `programs`: Array of programs for a client
- `uploadProgram(clientId, file, title, description)`: Upload file and create DB record
- `updateProgram(id, updates)`: Update title/description/order
- `deleteProgram(id)`: Remove file and DB record
- `loading`: Loading state

---

## User Dashboard Changes

### File: `CustomProgram.tsx`

Transform from static placeholder to dynamic content display.

**Logic Flow:**
```text
1. Fetch client_custom_programs where client_id = current user
2. If programs exist → Display program cards with download links
3. If no programs yet → Show "In Progress" message (softer than "Coming Soon")
```

**New UI (when programs exist):**
```text
┌─────────────────────────────────────────────────────────┐
│  Your Custom Program                                    │
│  Day 45 of Coaching                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📄 WEEK 1-4 FOUNDATION PHASE                          │
│  Your strength-building foundation program              │
│  [📥 Download PDF]                                      │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  📄 NUTRITION GUIDELINES                               │
│  Customized meal framework for your goals               │
│  [📥 Download PDF]                                      │
│                                                         │
│  ─────────────────────────────────────────             │
│                                                         │
│  💬 Questions about your program?                      │
│  [Message Dom]                                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**New UI (when no programs yet):**
```text
┌─────────────────────────────────────────────────────────┐
│  Your Custom Program                                    │
│  Day 12 of Coaching                                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⏳ YOUR PROGRAM IS BEING BUILT                        │
│                                                         │
│  Dom is reviewing your intake and designing a          │
│  personalized training plan specifically for you.       │
│                                                         │
│  What to expect:                                        │
│  • Custom workout split based on your schedule          │
│  • Exercises selected for your experience level         │
│  • Progression plan aligned with your goals             │
│                                                         │
│  While you wait, use the 12-Week Program to start       │
│  building momentum. Your custom program will appear     │
│  here once it's ready.                                  │
│                                                         │
│  [Start 12-Week Program] [Message Dom]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| Database Migration | CREATE | New `client_custom_programs` table + storage bucket |
| `src/hooks/useClientCustomPrograms.ts` | CREATE | Hook for CRUD operations |
| `src/components/admin/coaching/ClientProgramTab.tsx` | CREATE | Admin upload UI |
| `src/components/admin/coaching/ClientProgressPanel.tsx` | MODIFY | Add "Program" tab |
| `src/pages/dashboard/CustomProgram.tsx` | MODIFY | Dynamic content display |

---

## Technical Details

### Storage Upload Pattern

```typescript
// Admin uploads to: client-programs/{clientId}/{timestamp}-{filename}
const filePath = `${clientId}/${Date.now()}-${file.name}`;
await supabase.storage.from('client-programs').upload(filePath, file);

// Generate signed URL for client access (private bucket)
const { data } = await supabase.storage
  .from('client-programs')
  .createSignedUrl(filePath, 3600); // 1 hour expiry
```

### RLS Policy for Table

```sql
-- Admins full access
CREATE POLICY "Admins manage all programs"
ON client_custom_programs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Clients read their own programs
CREATE POLICY "Clients view own programs"
ON client_custom_programs FOR SELECT
USING (auth.uid() = client_id);
```

### RLS Policy for Storage

```sql
-- Admins can manage all files
CREATE POLICY "Admins manage client programs"
ON storage.objects FOR ALL
USING (bucket_id = 'client-programs' AND public.has_role(auth.uid(), 'admin'));

-- Clients can download from their folder
CREATE POLICY "Clients download own programs"
ON storage.objects FOR SELECT
USING (bucket_id = 'client-programs' 
  AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Supported File Types

- **PDF** (primary - workout plans, nutrition guides)
- **Images** (JPG, PNG - visual guides, form references)
- **Video** (MP4 - technique demonstrations)

Max file size: 50MB

---

## Summary

This feature closes the loop on the "Custom Program" experience:

1. **Dom uploads** personalized files through the admin panel (People → Free World → Select Client → Program tab)
2. **Client sees** their custom program materials in their dashboard tile
3. **No more "Coming Soon"** - the tile becomes functional and premium-feeling

The implementation follows existing patterns in the codebase (similar to walkthrough video uploads, progress photos storage) for consistency.

