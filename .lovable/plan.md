

# Change PWA Home Screen Name to "LOCKED IN"

## Overview

When users add the app to their iPhone home screen from Safari, the name displayed under the icon is controlled by the `short_name` field in the web app manifest. Currently set to "Redeemed", you want it to display "LOCKED IN" (all caps).

## Change Required

**File:** `public/manifest.json`

| Property | Current Value | New Value |
|----------|---------------|-----------|
| `short_name` | `"Redeemed"` | `"LOCKED IN"` |

## Technical Details

- Line 3 of `manifest.json` will be updated
- The `name` property ("Redeemed Strength") remains unchanged - this is used for app listings and install prompts
- The `short_name` is specifically what iOS uses for the home screen label
- No other files need to change

## Note

Users who have already added the app to their home screen will keep the old name. Only new installations will show "LOCKED IN". Existing users would need to remove and re-add the app to see the updated name.

