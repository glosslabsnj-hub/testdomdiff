

# Add Google Site Verification Meta Tag

## What This Does
Adds Google's verification meta tag to your site's HTML so Google can confirm you own the domain -- no DNS changes needed.

## Changes
One small addition to `index.html`: a single meta tag in the `<head>` section.

```html
<meta name="google-site-verification" content="tZjH5lbc9TuUPa21T5HiHqAf7YYVXbTzdtr87R3JmPg" />
```

## After Approval
1. I will add the meta tag to `index.html`
2. You will need to **publish** the site (click Publish > Update) so the tag is live on your domain
3. Then go back to Google and click "Verify" -- it should pass immediately

