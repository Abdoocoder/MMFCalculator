# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Employees of Greater Madaba Municipality who are members of the association (جمعية موظفي بلدية مادبا الكبرى). They use the service to finance purchases of goods (appliances, furniture, vehicles, household supplies, medical/educational items) under Sharia-compliant Murabaha financing at a fixed 15% annual profit rate, with a maximum monthly deduction of 40% of net salary. The landing page audience is the same members plus prospective members learning about the association's financing service.

## Product Purpose

A public web app that lets members calculate Murabaha loan installments transparently, apply for financing, track application status, and print an official voucher. The public landing page introduces the financing service to visitors and funnels them into the calculator.

## Positioning

Transparent, Sharia-compliant Murabaha financing calculation for municipal employees: fixed 15% annual profit, capped 40% salary deduction, built-in insurance estimate, and an instant eligibility check — no hidden terms, results you can see before you apply.

## Operating Context

Arabic-first, RTL interface. Used on both mobile (bottom navigation) and desktop (sidebar). Member profile and saved applications live in the Convex backend scoped to the signed-in Clerk user; only the dark/light preference persists in browser localStorage. Print-voucher flow produces a printable document. JOD currency.

## Backend & Auth

- **Identity:** Clerk — the member area requires sign-in; first login prompts a profile sign-up form.
- **Data:** Convex — `members` and `loanRecords` tables scoped to the Clerk user id.
- **Public surface:** the landing page and its live Murabaha calculator need no account.
- **Clerk proxying (production):** the Clerk Frontend API is proxied through this app's own domain at `https://mmf-calculator.vercel.app/__clerk/*` via the root Vercel Edge `middleware.ts`, which forwards to `frontend-api.clerk.dev` with `Clerk-Proxy-Url` / `Clerk-Secret-Key` headers. This requires two external config steps not in the repo: set the proxy URL in the Clerk dashboard (Production instance → Domains) and add `CLERK_SECRET_KEY` to the Vercel project env. See `memory/2026-08-14-clerk-prod-frontend-api-vercel-proxy.md` for the full write-up.

## Capabilities and Constraints

- Loan calculator with 5 Murabaha product lines (appliances 5y max, furniture/building 6y, vehicles 7y, goods/supplies 3y, medical/education 3y), all at 15% annual profit.
- DTI ratio cap 40% of net income; insurance estimate 0.5%/year.
- Eligibility check, reference number generation (`MDB-YYYY-####`), saved records with status (draft/pending/approved/rejected), print voucher modal.
- Stack: React 19 + Vite + Tailwind v4 + TypeScript strict. Clerk for auth, Convex for backend/database. Dark mode via class on `<html>`. Vitest + Testing Library, 100% coverage goal.
- Landing page must live at the app entry (index.html) ahead of the SPA, per user decision; Arabic only, dir=rtl.
- Existing visual tokens: primary blue #0f4c81, teal #34645d, Tajawal font, canvas #f7f9fb / dark #121619.

## Brand Commitments

- Name: جمعية موظفي بلدية مادبا الكبرى (Greater Madaba Municipality Employees Association).
- System title: نظام حاسبة المرابحة الإسلامية والخدمات الإلكترونية.
- Arabic RTL; Tajawal display/body font; blue #0f4c81 primary with teal #34645d secondary accents.
- Footer credit: تصميم وتطوير بواسطة Abdoo Coder (https://www.abdoocoder.dev/).

## Evidence on Hand

- Real association announcements in `src/data/mockData.ts` (15% Murabaha approval; August application window 1–15).
- Loan math formulas in `src/utils/loanCalculator.ts` are the association's specified formulas.
- No real member/customer names or photos exist; the landing page must not fabricate testimonials with real-sounding claims. Synthetic demonstration data must be labeled as such if used.

## Product Principles

- Transparency first: the visitor must see the financing terms and their installment before committing.
- Sharia compliance is the product: fixed profit, no hidden fees, capped deductions.
- Respect the association's institutional, public-sector tone.
- Arabic-first: the whole experience reads naturally in RTL Arabic.
- Funnel into action: one clear path from "learn" to "calculate".

## Accessibility & Inclusion

Existing app has keyboard focus rings, reduced-motion support, and touch-target improvements. The landing page must carry the same: WCAG AA contrast, visible focus states, `prefers-reduced-motion`, and clean RTL semantics.
