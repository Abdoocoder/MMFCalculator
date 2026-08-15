# DEBUG REPORT — Clerk production Frontend API unreachable; fixed via Vercel proxy

**Date:** 2026-08-14
**Reporter:** opencode
**Severity:** Production outage (auth unavailable to all users)
**Status:** RESOLVED — code fix committed (`4805143`), external config applied, verified live. `https://mmf-calculator.vercel.app/__clerk/` returns HTTP 200 (application/json) from the Clerk Frontend API; app is 200. **2026-08-15 follow-up:** Convex JWT auth fully fixed & verified end-to-end (see below).

---

## Symptom

The live app (`https://mmf-calculator.vercel.app`) failed to load Clerk JS with `failed_to_load_clerk_js`. The browser loaded `https://clerk.mmf-calculator.vercel.app/npm/...`, which was unreachable.

## Investigation (Systematic Debugging skill)

1. **TLS probe** of `clerk.mmf-calculator.vercel.app:443` → `unexpected eof while reading` / TLS alert decode error. No server speaks TLS on that host.
2. **DNS**:
   - `clerk.mmf-calculator.vercel.app` → A records `64.29.17.3`, `216.198.79.3` (Vercel edge range — note: *different* IPs from the main domain's `*.vercel.app` range).
   - No CNAME record (Clerk's real frontend API hosts use a CNAME chain to `worker.clerkprod-cloudflare.net` → Cloudflare `104.18.34.146` / `172.64.153.110`).
3. **Comparison**:
   - Dev instance `known-tahr-41.clerk.accounts.dev` → TLS 1.3, `CN=clerk.accounts.dev`, fully working.
   - Main domain `mmf-calculator.vercel.app` → HTTP 200, cert `CN=*.vercel.app` (Google Trust Services).
4. **Root cause**: `clerk.mmf-calculator.vercel.app` is a **Vercel-reserved `*.vercel.app` wildcard subdomain**. Vercel owns that zone, so it can never be CNAME'd to Clerk, and nothing serves TLS for that host. A Clerk Frontend API domain cannot live on a `*.vercel.app` name. **Not a code bug** — a Clerk dashboard/DNS configuration error.

## Decision (user choice)

User selected **"Proxy Clerk via Vercel"** (options also offered: real custom domain, revert to dev instance, report only).

Clerk supports frontend API proxying: the app loads Clerk JS and makes all Frontend API calls through `https://mmf-calculator.vercel.app/__clerk/*`, and `middleware.ts` forwards those to `https://frontend-api.clerk.dev/*` with the required headers. Works for **production** instances only.

## Fix (implemented)

1. **`middleware.ts`** (new, project root — Vercel Edge Middleware for any framework):
   - Matcher: `/__clerk/:path*`
   - Rewrites path to `https://frontend-api.clerk.dev/{path}{search}` (bare `/__clerk` → `/`).
   - Injects headers: `Clerk-Proxy-Url` (origin + `/__clerk`, overridable via `CLERK_PROXY_URL`), `Clerk-Secret-Key` (from `CLERK_SECRET_KEY`), `X-Forwarded-For` (from `x-vercel-forwarded-for` with `x-forwarded-for` fallback).
   - Removes `host` header (upstream must see its own host).
   - Forwards method + streaming body for non-GET/HEAD; `redirect: 'manual'` so upstream 3xx passes through.
2. **`src/main.tsx`**: added `proxyUrl={import.meta.env.VITE_CLERK_PROXY_URL}` to `<ClerkProvider>`.
3. **`.env.production`** (tracked, public): added `VITE_CLERK_PROXY_URL="https://mmf-calculator.vercel.app/__clerk"`.
4. **`.env.example`**: documented the new var.
5. **`middleware.test.ts`** (new): 10 tests covering path rewrite, query preservation, bare-path mapping, header injection, IP fallbacks, URL defaulting, method/body/redirect forwarding.

## Verification

- `npm test` → 143 passed (incl. 10 new middleware tests).
- `npm run lint` (tsc --noEmit) → clean.
- `npm run build` → succeeds; `dist/assets/index-2s_Ykdb_.js` contains the `__clerk` proxy URL; **0 occurrences of `sk_live`** in the bundle (secret only used server-side by middleware).
- Key facts: live key `pk_live_Y2xlcmsubW1mLWNhbGN1bGF0b3IudmVyY2VsLmFwcCQ` stays unchanged; Vercel `rewrites` cannot inject the required request headers, hence middleware.

## REQUIRED — external config (not doable from repo)

1. **Clerk dashboard** → Production instance → Domains: enable proxying and set proxy URL to `https://mmf-calculator.vercel.app/__clerk`.
2. **Vercel project env**: add `CLERK_SECRET_KEY` (= `sk_live_...`, currently only in gitignored `.env.local`). Middleware reads it at runtime.
3. Redeploy to Vercel.

## Post-fix checklist

- Load `https://mmf-calculator.vercel.app` → Clerk JS loads via `/__clerk`, sign-in/sign-up work.
- Verify Convex JWT auth: production instance's Convex integration + JWT template (`convex/auth.config.ts` reads `CLERK_JWT_ISSUER_DOMAIN`) accepts tokens.
- Verify preview deploys still work (`CLERK_PROXY_URL`/`CLERK_SECRET_KEY` may need to be set for preview env too, or middleware falls back to `origin + /__clerk`).

## 2026-08-15 follow-up: Convex JWT auth fixed (deferred post-fix checklist item)

The post-fix checklist item "Verify Convex JWT auth" was found broken in production: sign-in succeeded but Convex returned `unauthenticated` from `members:createOnSignup` because the browser's `/__clerk/v1/client/sessions/{sid}/tokens/convex` call 404'd.

Root causes fixed (all external config + Convex deploy, **no code changes**):

1. **No `convex` JWT template existed** in the production Clerk instance (`GET /v1/jwt_templates` → `[]`). `ConvexProviderWithClerk` requests `getToken({ template: "convex" })` whenever `sessionClaims.aud !== "convex"` (`node_modules/convex/dist/esm/react-clerk/ConvexProviderWithClerk.js:28-36`). Created via `POST https://api.clerk.com/v1/jwt_templates` with `{"claims":{"aud":"convex","role":"{{user.public_metadata.role}}"},"lifetime":600,"allowed_clock_skew":5}`:
   - Production: `jtmp_3HwZxcHUO48q2tNAUdUu1xvfBPK`
   - Dev (`known-tahr-41`): `jtmp_3HwZyFEMfYDkKooelaPMlu0xmGV`
2. **Issuer mismatch**: the JWT `iss` claim is the **proxy URL** `https://mmf-calculator.vercel.app/__clerk`, NOT `https://clerk.mmf-calculator.vercel.app`. Convex rejected the token (`No auth provider found matching the given token`). Fix: set the Convex deployment env `CLERK_JWT_ISSUER_DOMAIN=https://mmf-calculator.vercel.app/__clerk` (`npx convex env set`), then `npx convex deploy` to re-bundle `convex/auth.config.ts`.
3. **Stale Convex deployment**: `https://sleek-squirrel-611.convex.cloud` only had 7 functions (missing `auth.js`/`admin.js`). Redeployed via `npx convex deploy` (deploy key `dev:sleek-squirrel-611|...`) → 11 functions live.
4. **User role mismatch**: user `user_3HwWxRatvOfOLuLPbpNw1BULsN0` (abdooraf3@gmail.com) had `public_metadata.role = "isAdmin"` but the app checks `role === "admin"` (`src/hooks/useMyRole.ts:18`, `convex/helpers.ts:34`). Updated via `PATCH /v1/users/{user_id}/metadata` (the old `public_metadata` param on `PATCH /v1/users/{id}` is **deprecated**, returns 422).

**Verification (end-to-end, all HTTP 200):** mint token `POST /v1/sessions/{sid}/tokens/convex` → decoded `iss=https://mmf-calculator.vercel.app/__clerk, aud=convex, role=admin` → `POST https://sleek-squirrel-611.convex.cloud/api/query` with `Authorization: Bearer <jwt>` for `auth:getMyRole` (returns `"admin"`) and `admin:listApplications` (returns `[]`).

Note: the "production" backend is a Convex **dev deployment** (`dev/bdllh-bwsgyr`, URL `sleek-squirrel-611.convex.cloud`) that `VITE_CONVEX_URL` points at; `npx convex deploy` targets it via `CONVEX_DEPLOY_KEY` (deploy-key auth; `--prod`/`--deployment` flags are ignored while the deploy key env var is set). There is no separate production Convex project configured.

## Files touched

- `middleware.ts` (new)
- `middleware.test.ts` (new)
- `src/main.tsx`
- `.env.production`
- `.env.example`
