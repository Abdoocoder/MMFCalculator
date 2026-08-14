# MMF Calculator — حاسبة المرابحة الإسلامية

A public web app for the **Greater Madaba Municipality Employees Association** (جمعية موظفي بلدية مادبا الكبرى) that lets members calculate Sharia-compliant Murabaha loan installments transparently, apply for financing, track application status, and print an official voucher.

Live at [https://mmf-calculator.vercel.app](https://mmf-calculator.vercel.app) — Arabic-first, RTL, JOD currency.

## What it does

- **Public landing page + live calculator** — no account needed. Visitors see the financing terms and their installment before committing, with a built-in eligibility check.
- **Member area** (`#app`) — sign in with Clerk, fill out a profile, save loan applications, track their status (draft / pending / approved / rejected), and print a voucher.
- **Offline-friendly** — profile and saved records are mirrored to `localStorage` for fast cold-start and offline reads; the Convex server value wins and is written back when available.

### Financing terms

- 5 Murabaha product lines — appliances (5y max), furniture/building (6y), vehicles (7y), goods/supplies (3y), medical/education (3y).
- Fixed **15% annual profit**, **40% DTI cap** on net salary, **0.5%/year** insurance estimate.
- Reference numbers in `MDB-YYYYMMDD-HHmmss-###` format.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript (strict) + Vite 6 + Tailwind CSS v4 |
| Auth | Clerk (member area), production-proxied through the app's own domain |
| Backend | Convex (`members` and `loanRecords` tables, scoped to the Clerk user id) |
| Edge | Root Vercel Edge `middleware.ts` proxies `/__clerk/*` to the Clerk Frontend API |
| Testing | Vitest 3 + Testing Library + jest-dom (100% coverage goal) |

## Getting started

### Prerequisites

- Node.js (the repo targets modern ESM; Vite 6 is used)
- A [Convex](https://convex.dev) project and a [Clerk](https://clerk.com) application

### Install & run

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev                  # Vite dev server on http://localhost:3000
```

The app loads the landing page at the entry; the member area lives at `#app`.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | ✅ build | Convex deployment URL, e.g. `https://happy-fox-123.convex.cloud` |
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ build | Clerk publishable key (`pk_test_...` / `pk_live_...`) |
| `VITE_CLERK_PROXY_URL` | production | Clerk proxy URL (`https://<app-domain>/__clerk`) — set on production only |
| `CLERK_SECRET_KEY` | production | Clerk secret key (`sk_live_...`) — **never commit**; set in the Vercel project env |
| `CLERK_JWT_ISSUER_DOMAIN` | production | Convex dashboard → Auth config → Clerk JWT issuer domain |

`npm run build` fails loudly if `VITE_CONVEX_URL` or `VITE_CLERK_PUBLISHABLE_KEY` are missing. Public build-time vars are tracked in `.env.production`; secrets stay in `.env.local` / the platform's secret store.

### Scripts

```bash
npm run dev       # vite dev server on port 3000 (host 0.0.0.0)
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # TypeScript strict typecheck (tsc --noEmit)
npm test          # Vitest single run (CI)
```

## Project structure

```
├── convex/            # Convex backend: schema, members & loanRecords, auth config
├── middleware.ts      # Root Vercel Edge function proxying /__clerk/* (must stay at root)
├── src/
│   ├── auth/          # AuthGate, sign-in, sign-up
│   ├── components/    # Member SPA components (calculator, dashboard, voucher, ...)
│   ├── config/        # requiredEnv guard
│   ├── data/          # Convex adapters, localStorage mirror, mock announcements
│   ├── hooks/         # useMemberData() — central profile/records data layer
│   ├── landing/       # Public landing page
│   ├── utils/         # loanCalculator.ts (the association's formulas)
│   └── App.tsx        # Declarative member app over useMemberData()
└── src/**/*.test.*    # Colocated tests (root-level middleware.test.ts at repo root)
```

## Deployment

```bash
npx convex deploy      # push schema + functions to Convex
npm run build          # CI does build + lint + test on push/PR to main
```

The app deploys to Vercel. Two external setup steps are required for production Clerk sign-in (not covered by the repo):

1. Set the proxy URL (`https://mmf-calculator.vercel.app/__clerk`) in the Clerk dashboard (Production instance → Domains).
2. Add `CLERK_SECRET_KEY` to the Vercel project env.

See `memory/2026-08-14-clerk-prod-frontend-api-vercel-proxy.md` for the full write-up.

## Testing

```bash
npm test          # Vitest + jsdom, single run
npm run lint      # TypeScript strict typecheck
npm run build     # production build
```

The CI pipeline (`.github/workflows/test.yml`) runs test + lint + build on every push/PR to `main`. 100% test coverage is the goal — tests live colocated next to their source. See [TESTING.md](./TESTING.md) for conventions.

## Docs

- [PRODUCT.md](./PRODUCT.md) — product purpose, users, positioning, brand commitments
- [TESTING.md](./TESTING.md) — test framework and conventions
- [CHANGELOG.md](./CHANGELOG.md) — release history (current: 0.3.2.0)
- [TODOS.md](./TODOS.md) — open work

## Brand

- System title: نظام حاسبة المرابحة الإسلامية والخدمات الإلكترونية
- Font: Tajawal (display/body); primary blue `#0f4c81`, teal `#34645d`
- Footer credit: تصميم وتطوير بواسطة Abdoo Coder (https://www.abdoocoder.dev/)
