# Debug Report — 2026-08-14

**Symptom:** "No address provided to ConvexReactClient" at index-BSUrABle.js
**Root cause:** Stale cached production bundle from before `.env.local` had VITE_CONVEX_URL (Aug 9 00:58-01:25 window). Not a code bug.
**Fix:** Hard refresh / clear browser cache. Current dist + dev server inject the URL correctly.
**Evidence:** chunk absent from dist/ and dev server; URL inlined in current build.
**Status:** DONE_WITH_CONCERNS
