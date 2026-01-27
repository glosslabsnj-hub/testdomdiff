

# Fix Safari Icon Display Using Existing Assets

## Overview

The branded icons (gold cross on charcoal) already exist in the project. Safari is showing a generic globe because the HTML meta tags aren't fully configured to tell Safari where to find them.

## Existing Icon Files

| File | Size | Status |
|------|------|--------|
| `public/favicon.ico` | Multi-size | Already exists |
| `public/apple-touch-icon.png` | 180x180 | Already exists |
| `public/icon-192.png` | 192x192 | Already exists |
| `public/icon-512.png` | 512x512 | Already exists |

## What Needs to Change

### Update `index.html` Meta Tags

Add explicit size declarations and cache-bust the existing references:

```html
<!-- Current -->
<link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />

<!-- Enhanced for Safari -->
<link rel="icon" type="image/x-icon" href="/favicon.ico?v=3" />
<link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png?v=3" />
<link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png?v=3" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
```

### Create Safari Pinned Tab SVG

For macOS Safari pinned tabs, create a monochrome SVG version of the cross:

**File:** `public/safari-pinned-tab.svg`

A simple gold cross shape as a single-color vector that Safari can use for pinned tabs.

## Files to Change

| File | Action | Purpose |
|------|--------|---------|
| `index.html` | MODIFY | Add explicit icon size declarations + cache bust |
| `public/safari-pinned-tab.svg` | CREATE | Monochrome cross SVG for Safari pinned tabs |
| `public/manifest.json` | MODIFY | Update icon references with cache-bust v3 |

## Technical Details

- Version parameter bumped from `?v=2` to `?v=3` forces Safari to reload icons
- Adding `sizes` attribute helps Safari choose the right icon
- The SVG uses a simple cross path with `color="#C9A54D"` (your gold accent)

## Expected Result

After publishing:
- Safari search suggestions will show the gold cross icon
- Safari bookmarks will display the branded icon  
- macOS Safari pinned tabs will show the cross silhouette
- No new image files needed - using existing assets

