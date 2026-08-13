# Debug Report — 2026-08-14: Convex `members:getMyProfile` not found in production

**Symptom:** `clerk.browser.js` warns "Clerk has been loaded with development keys"; then
`index-BV06Ga1Q.js:72` throws `Uncaught Error: [CONVEX Q(members:getMyProfile)] [Request
ID: 8835641b1758af39] Server Error — Could not find public function for
'members:getMyProfile'.` The app bootstraps Clerk + Convex and immediately queries the
member profile; the query fails against the deployed backend.

**Root cause:** Configuration drift — the deployed Convex backend
(`https://sleek-squirrel-611.convex.cloud`, a dev deployment) never had the `members`
(and `loanRecords`) modules pushed to it. `convex/members.ts:33` exports `getMyProfile`
as a public query and `convex/schema.ts` defines both tables, but there is **no CI or
deploy step anywhere** (`.github/workflows/` only has `test.yml`; no `convex.json`; no
`npx convex deploy` in any workflow or AI Studio build) — pushing Convex functions is a
manual step that had not been run since the migration (`9730cba`, Aug 14) landed.
Secondary: `CLERK_JWT_ISSUER_DOMAIN` was unset on the deployment, which would break
Clerk JWT auth even after the push.

**Evidence (decisive):**
- Direct POST to `https://sleek-squirrel-611.convex.cloud/api/query` with
  `{"path":"members:getMyProfile",...}` returned `Server Error: Could not find public
  function` — reproduced outside the browser, so not a client caching issue.
- The deployed backend `/version` was `20260811T222237Z` (Aug 11), predating the client
  migration commit `9730cba` (Aug 14 00:39) that wired `api.members.getMyProfile` into
  `src/hooks/useMemberData.ts` and `src/auth/AuthGate.tsx`.
- `npx convex deploy --dry-run` showed the deployment (`dev/bdllh-bwsgyr`) was missing
  `CLERK_JWT_ISSUER_DOMAIN`; `convex/auth.config.ts` reads it with a non-null assertion.
- `convex/_generated/api.d.ts` was committed in the generic `AnyApi` form, so a local
  `grep` gave no static evidence either way; only a live API call proved absence.

**Fix (operational, deployed to live dev backend):**
1. `npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://known-tahr-41.clerk.accounts.dev"`
   (derived from the `pk_test_…` publishable key in `.env.production`).
2. `npx convex deploy` — pushed `members`, `loanRecords`, `helpers`, schema + indexes
   (`loanRecords.by_referenceNo`, `loanRecords.by_userId`, `members.by_membershipNo`,
   `members.by_userId`).

**Verification (all green):**
- `members:getMyProfile` → `{"status":"success","value":null}` (null = no auth token).
- All client-called function paths resolve (no more "could not find"); mutations
  correctly reject anonymous callers with `Uncaught ConvexError: unauthenticated`
  (`convex/helpers.ts:8`), not "not found".
- `npm test` 133/133 pass; `tsc --noEmit` clean.

**Code change required by the fix:** The deploy regenerated `convex/_generated/*`
(statically typed API instead of `AnyApi`), which surfaced a latent type error: the
client passed a plain `string` to `deleteDraft`, whose args are `v.id("loanRecords")`
(branded `Id<"loanRecords">`). Fixed in `src/hooks/useMemberData.ts` with an
`id as Id<'loanRecords'>` cast at the mutation boundary (documented design: `LoanRecord.id`
is a client-only plain-string alias for `_id`).

**Regression guard (recommended, not yet done):** Add a CI step that runs
`npx convex deploy --dry-run` (fails fast on missing env vars / config drift) or a
scripted `npx convex deploy` on merge, so the backend can never drift silently from
`convex/` again.

**Status:** DONE — root cause confirmed by live API reproduction; fix applied and verified.

**Related:** 2026-08-14-convex-no-address-stale-cache.md (earlier Convex deployment
configuration drift — same theme: deployed backend/app and local code diverging).
