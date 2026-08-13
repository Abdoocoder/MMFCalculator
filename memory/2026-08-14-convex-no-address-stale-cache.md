# Debug Report — 2026-08-14 (revised)

**Symptom:** "No address provided to ConvexReactClient" at index-ZaMMcaLg.js:72

**Root cause:** The AI Studio / Cloud Run applet build runs without `.env.local`,
which is gitignored and never reaches the cloud builder. `import.meta.env.VITE_CONVEX_URL`
is therefore `undefined` at build time, so the deployed bundle contains
`new ConvexReactClient()` with no address and throws at runtime.

**Evidence (this is the decisive proof):**
- `git clone` + `npm ci` + `npm run build` with NO `.env.local` produces
  `dist/assets/index-ZaMMcaLg.js` — **byte-identical hash** to the chunk the
  browser is loading that throws the error.
- The same build with `.env.local` present produces `index-CevHBZeP.js` and inlines
  `new US("https://sleek-squirrel-611.convex.cloud")`.
- The previously-served chunk `index-BSUrABle.js` and the current `index-ZaMMcaLg.js`
  have different hashes — so this was NEVER a stale browser cache. The 2026-08-14
  earlier report ("stale cached bundle") was WRONG. Every cloud re-deploy re-builds
  without the env var and re-introduces the bug.

**Fix (operational, not a code bug):** Configure `VITE_CONVEX_URL` (and
`VITE_CLERK_PUBLISHABLE_KEY`) in the AI Studio applet's environment/secrets so the
cloud build inlines them, then redeploy. Code change not required — `src/main.tsx`
already reads the var correctly.

**Regression guard (recommended):** Add a build-time guard in `vite.config.ts` or
`src/main.tsx` that fails loudly when `VITE_CONVEX_URL` is missing, so a misconfigured
deploy can never ship a silent broken bundle again.

**Related:** None in code — deployment-configuration issue. Recurring (same error
reported twice) because the underlying cause was never actually fixed.

**Status:** DONE_WITH_CONCERNS — root cause confirmed by reproduction; remediation
requires action in the AI Studio dashboard which is outside this repository.