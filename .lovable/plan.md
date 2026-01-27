

# Add Branded Icon for Safari Search Results & Tabs

## The Problem

When you search for your website in Safari, it shows a generic globe icon instead of Dom's branded logo. This happens because Safari uses specific icon types that aren't fully configured yet.

## What's Already Set Up

The project has these icon files:
- `favicon.ico` - Works for browser tabs (Chrome, Firefox, etc.)
- `apple-touch-icon.png` - Works for iOS home screen
- `icon-192.png` and `icon-512.png` - Works for Android PWA

## What's Missing

Safari needs additional icon declarations to properly display your brand in:
- Safari search suggestions
- Safari bookmarks
- Safari pinned tabs (macOS)

## Solution

### Step 1: You Provide a Logo Image

I need you to upload or provide Dom's logo. Ideally:
- A simple, recognizable version of the logo
- Works well at small sizes (16x16 to 180x180)
- Gold cross on dark background would match your branding

**For Safari pinned tabs specifically**: Apple requires a monochrome (single-color) SVG version. If you don't have an SVG, I can help create one once you provide the logo.

### Step 2: Add Additional Icon Meta Tags

Once I have the logo, I'll update `index.html` to include:

```html
<!-- Enhanced Safari/iOS icon support -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=3" />
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#C9A54D" />
```

### Step 3: Generate Required Icon Sizes

From your logo, I'll create:
| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | 16x16, 32x32, 48x48 | Browser tabs |
| `favicon-16x16.png` | 16x16 | Small browser icons |
| `favicon-32x32.png` | 32x32 | Standard browser tabs |
| `apple-touch-icon.png` | 180x180 | iOS home screen & Safari |
| `safari-pinned-tab.svg` | Vector | Safari pinned tabs (macOS) |

## What You Need To Do

**Please upload or provide a link to Dom's logo** - preferably the gold cross icon you want to use. Once I have that, I can:

1. Generate all the required sizes
2. Create the Safari pinned tab SVG version
3. Update the HTML with proper meta tags
4. Add cache-busting to force Safari to refresh the icons

## Expected Result

After implementation:
- Safari search suggestions will show Dom's logo instead of the globe
- Bookmarks in Safari will display the branded icon
- Pinned tabs on macOS Safari will show the gold cross
- The branded experience will match Instagram, Facebook, and other major sites

