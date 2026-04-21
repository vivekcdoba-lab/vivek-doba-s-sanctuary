

## Diagnosis

The dev server is **running cleanly** at `http://localhost:8080/` with no build errors, and the published site is live at `https://vivek-doba-portal.lovable.app`. Recent logs show only successful HMR updates from the phone/pincode work — no compile failures.

The "Preview redirects to Files" and "Publish not visible" symptoms are **not caused by the codebase**. They're caused by the **editor's current view being stuck on the Files panel** (the `<current-view>` system flag confirms: *"The user is currently viewing generated files"*). When you're in Files view, the top toolbar swaps out — Preview/Publish buttons aren't rendered there.

## Fix — switch the editor view (no code change needed)

**Desktop:**
1. In the navigation bar above the panel, click the **Preview** icon (eye/monitor icon) — this exits Files view and returns to the live app preview.
2. Once back in Preview, the **Publish** button reappears in the **top-right corner** of the editor.

**Mobile:**
1. Tap the **`...` (ellipsis)** button in the bottom-right corner.
2. Tap **Preview** to exit Files view.
3. Tap `...` again → **Publish** to publish.

## Why this happened

You opened the Files view (likely to download an artifact from `/mnt/documents/`). The editor remembers that view across messages. Switching back to Preview restores the normal toolbar with Preview + Publish buttons.

## If Preview still looks blank after switching

That would indicate a runtime route issue — not the case here. The app is responding normally on both preview and published URLs. If after switching views the preview is genuinely broken, send a screenshot and I'll investigate the route/auth state. But based on logs + URLs, **no code fix is required** — just toggle the editor view.

## No files to modify

This is an editor UI state issue, not a project code issue. Once you click the Preview icon, everything will be visible as expected.

