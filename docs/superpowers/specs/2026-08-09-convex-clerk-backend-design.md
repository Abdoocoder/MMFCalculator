# Design: Convex Backend + Clerk Auth for MMF Calculator

**Version target:** 0.3.0.0
**Status:** Draft — pending user review
**Date:** 2026-08-09

## Problem

The MMF Calculator (جمعية موظفي بلدية مادبا الكبرى) is currently a pure
client-side SPA. Member profile and loan records live in `localStorage` /
`mockData` and are shared between all visitors. There is no notion of identity,
so the member app (`#app`) cannot distinguish one member's records from another's
and nothing persists across devices.

## Goal

Turn the member app into a real, authenticated application:

- **Public (no auth):** the landing page at `/` and the public calculator.
  Saving/submitting from the public calculator is local-only as before, with a
  "sign in to save" prompt instead of a real backend write.
- **Authenticated (Clerk):** the member app at `/#app` — home dashboard, loan
  records, applications, and profile. All reads/writes hit Convex, scoped to the
  signed-in member's `userId`.
- **Members only for now.** No admin/association review role in this iteration.

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Backend | Convex (`convex`, `convex/react`) | Reactive database + serverless functions in TypeScript, same language as the app |
| Auth | Clerk (`@clerk/clerk-react`, `convex/react-clerk`) | User requested Clerk; first-party `ConvexProviderWithClerk` bridge exists |
| Identity in Convex | `ctx.auth.getUserIdentity().subject` (Clerk userId) | Standard Convex×Clerk integration; no Convex Auth provider needed |
| Build/host | Unchanged (Vite SPA) | No routing/framework change |

## Architecture

### Provider wiring (`src/main.tsx`)

`ClerkProvider` (publishable key from `VITE_CLERK_PUBLISHABLE_KEY`) wraps
`ConvexProviderWithClerk` (client from `VITE_CONVEX_URL`, `useAuth` from
`@clerk/clerk-react`). This replaces the bare `ConvexProvider` we would have used
for a no-auth app; the `LandingGate` hash gate stays as the surface switch.

### Auth gate

A small `AuthGate` guards the `#app` surface:

- Unauthenticated → render a sign-in screen (Clerk `SignIn` / "Sign in to access
  the member area") with a link back to `/`.
- Authenticated, no `members` row yet → render the **sign-up form**.
- Authenticated, `members` row exists → render the member `<App />`.

Public `/` never requires auth.

### Convex schema (`convex/schema.ts`)

```ts
members:
  userId: string            // Clerk subject, unique
  membershipNo: string      // unique
  fullName: string
  nationalId: string
  department: string
  jobTitle: string
  netSalary: number
  currentDeductions: number
  phone: string
  joinDate: string
  activeLoanCount: number
  totalLoansPaid: number
  createdAt: number

loanRecords:
  userId: string            // index
  referenceNo: string       // unique
  date: string
  productName: string
  loanAmount: number
  netIncome: number
  durationYears: number
  monthlyInstallment: number
  totalWithInsurance: number
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  notes?: string
  resultSnapshot?: CalculationResult
  createdAt: number
```

### Convex functions

Queries (return `null` / `[]` when unauthenticated — never throw):

- `members.getMyProfile` — `ctx.auth.getUserIdentity()?.subject`
- `loanRecords.listMy` — all rows where `userId === subject`, newest first

Mutations (guard: throw `unauthenticated` if no subject):

- `members.upsertMyProfile` — full profile payload; creates or updates the row
  for the caller's `userId`
- `members.createOnSignup` — called by the sign-up form; writes the initial
  `members` row (idempotent: no-op if the caller already has a row)
- `loanRecords.create` — new record for the caller (status `draft` initially,
  or `pending` if the member submits an application)
- `loanRecords.updateStatus` — member-side status change (e.g. draft → pending;
  delete-draft via a dedicated `loanRecords.deleteDraft`)

### `convex/auth.config.ts`

```ts
providers: [{
  domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
  applicationID: 'convex',
}]
```

### App changes

- `src/main.tsx`: add `ClerkProvider` + `ConvexProviderWithClerk` + `AuthGate`.
- `App.tsx` and the dashboard/records/profile screens: replace `localStorage`
  reads with `useQuery(api.members.getMyProfile)` and
  `useQuery(api.loanRecords.listMy)`; saves/submits use `useMutation`.
- `LoanCalculator.tsx` / `LiveCalculator.tsx`: calculation logic unchanged; the
  persistence callback becomes Convex-backed when authenticated and shows a
  "sign in to save" prompt in the public context.
- `data/mockData.ts`: seed values reused only for the public calculator's
  default inputs; no longer the source of truth for the member app.
- `.env.example`: add `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`,
  `CLERK_JWT_ISSUER_DOMAIN` (Convex dashboard / Clerk dashboard config).

## Onboarding flow (decided)

On first sign-in, a short **sign-up form** (membership no, full name, national
ID, department, job title, net salary, current deductions, phone) runs
`members.createOnSignup`. This simulates the association's real onboarding; the
member can edit everything later in the profile tab.

## Out of scope (this iteration)

- Admin/association review role and status approval workflow
- Clerk webhooks to auto-sync user profile to `members`
- File uploads, notifications, cross-device realtime beyond what Convex gives free
- Password/OTP via Convex Auth (Clerk owns auth; Convex only trusts its JWT)

## Tests

- New: `AuthGate` component test (three states), sign-up form test (submit →
  `createOnSignup` called), Convex function tests for the queries' null/empty
  behavior and mutation guards (via `convex/testing` with mocked auth identity).
- Updated: `App.tsx`/dashboard/records tests switch from localStorage fakes to
  mocked `useQuery`/`useMutation` hooks.
- Keep the 100%-coverage goal; run `npm test` after every step.

## Versioning / flow

- Bump to 0.3.0.0; update `CHANGELOG.md`, `PRODUCT.md`, `TODOS.md`.
- Continue on the existing PR #1 (`chore/impeccable-audit-fixes`). No new PR.
