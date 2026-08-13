# DEBUG REPORT — Clerk production Frontend API unreachable; fixed via Vercel proxy

**Date:** 2026-08-14
**Reporter:** opencode
**Severity:** Production outage (auth unavailable to all users)
**Status:** RESOLVED — code fix committed (`4805143`), external config applied, verified live. `https://mmf-calculator.vercel.app/__clerk/` returns HTTP 200 (application/json) from the Clerk Frontend API; app is 200.

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

## Files touched

- `middleware.ts` (new)
- `middleware.test.ts` (new)
- `src/main.tsx`
- `.env.production`
- `.env.example`
