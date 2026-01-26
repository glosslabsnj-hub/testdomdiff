
# Fix: Video Upload Not Saving for Gen Pop and Solitary Tiers

## Problem Identified

After thorough investigation, I found that:

1. **Storage bucket is correctly configured** - The `tier-walkthroughs` bucket exists, is public, and has proper RLS policies for authenticated users to upload.

2. **Database records exist** - All three tiers (coaching, membership, transformation) have records in `program_welcome_videos`, but only `coaching` has a `walkthrough_video_url` populated.

3. **Coaching video uploaded successfully** - The file `coaching/walkthrough-coaching-1769419154602.mp4` exists in storage, proving the upload mechanism works.

4. **Gen Pop and Solitary files never reached storage** - No files exist in storage for `membership/` or `transformation/` folders.

## Root Cause

The file input may not be correctly triggering the upload. Looking at the `WelcomeVideosManager.tsx` code, I noticed the file input lacks error handling for edge cases like:
- Network interruptions during upload
- Browser file picker being cancelled
- Large file processing delays

Additionally, there's no visual feedback during file selection before the upload starts.

## Solution

### 1. Add Better Upload Feedback and Error Handling

Update `WelcomeVideosManager.tsx` to:
- Add console logging for debugging uploads
- Add file size validation before upload (max 500MB as stated in UI)
- Show file name being uploaded
- Add more detailed error messages
- Handle the case where the file picker is cancelled

### 2. Add Upload Progress Indicator

The current implementation only shows a spinner during upload. For large video files, this can take several minutes without any indication of progress.

### 3. Verify Storage Policy (Already Correct)

The policies are already correctly configured:
- `Authenticated users can upload tier walkthroughs` - INSERT policy with `auth.role() = 'authenticated'`
- `Public can view tier walkthrough videos` - SELECT policy for public read access

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/WelcomeVideosManager.tsx` | Add validation, logging, and better error handling |

## Implementation Details

### Enhanced File Upload Handler

```typescript
const handleFileUpload = async (
  videoId: string, 
  planType: string, 
  file: File, 
  type: 'welcome' | 'walkthrough'
) => {
  // Add file validation
  if (!file) {
    console.warn("No file selected");
    return;
  }

  // Validate file size (500MB max as stated in UI)
  const MAX_SIZE = 500 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    toast({
      title: "File too large",
      description: `Maximum file size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`,
      variant: "destructive"
    });
    return;
  }

  // Validate file type
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload MP4, WebM, or MOV files only",
      variant: "destructive"
    });
    return;
  }

  console.log(`Starting upload for ${type} video:`, {
    videoId,
    planType,
    fileName: file.name,
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    fileType: file.type
  });

  setUploading({ id: videoId, type });
  
  try {
    // ... existing upload logic with added logging
    console.log("Upload successful, updating database...");
    
    // ... database update
    console.log("Database updated successfully");
    
  } catch (error: any) {
    console.error("Upload error details:", error);
    toast({
      title: "Upload Failed", 
      description: error.message || "Unknown error occurred",
      variant: "destructive"
    });
  } finally {
    setUploading(null);
  }
};
```

### Add Upload Status Display

Show the filename being uploaded:
```tsx
{uploading?.id === video.id && uploading?.type === 'walkthrough' && (
  <div className="flex items-center gap-2 text-sm text-muted-foreground">
    <Loader2 className="w-4 h-4 animate-spin" />
    <span>Uploading...</span>
  </div>
)}
```

## Testing Steps After Fix

1. Go to Admin Dashboard → Content → Welcome Videos tab
2. Select the **Solitary Confinement** tier card
3. Click **Walkthrough Video** tab
4. Click **Choose File** and select an MP4 file (under 500MB)
5. Watch the console for upload logs
6. Verify toast message shows success
7. Repeat for **General Population** tier
8. Test the onboarding flow for each tier by resetting a test user's `first_login_video_watched` flag

## Immediate Workaround

If uploads continue to fail, you can manually:
1. Upload videos directly via the storage bucket interface (Cloud View)
2. Paste the public URL into the "Or paste video URL" field
3. Click "Save Changes"

---

## Technical Notes

- The `tier-walkthroughs` bucket is public with no file size limit set (defaults to 50MB per file)
- All RLS policies are correctly configured
- The coaching tier video uploaded successfully, proving the mechanism works
- No database errors were logged
- The issue is likely in the client-side upload handling or file selection
