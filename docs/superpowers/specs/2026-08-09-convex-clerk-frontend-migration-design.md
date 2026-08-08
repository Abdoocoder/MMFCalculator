# Design: Complete Convex + Clerk Frontend Migration for MMF Calculator

**Version target:** 0.3.1.0
**Status:** Draft — pending user review
**Date:** 2026-08-09

## Problem

The Convex backend (`convex/`) and Clerk auth (providers, `AuthGate`, sign-in /
sign-up) shipped in v0.3.0.0. The member app (`src/App.tsx`) is still
mid-migration: it imports `useQuery`/`useMutation` from `convex/react` and `api`
from `../convex/_generated/api`, but still references the removed `localStorage`
helpers (`loadState`, `saveState`, `loadRawState`) and the `mockData` seeds
(`INITIAL_MEMBER_PROFILE`, `INITIAL_LOAN_RECORDS`). The file does not compile —
`npm run lint` (`tsc --noEmit`) fails with 8 `TS2304` errors. Member profile and
loan records are still sourced from `localStorage`/`mockData` and shared between
all visitors; there is no per-member persistence.

## Goal

Finish wiring the authenticated member app to Convex, scoped to the signed-in
member's Clerk `userId`, so profile and loan records are server-backed and
persist across devices. Keep `localStorage` **only** as an offline fallback
cache (cold start / offline reads). The dark-mode preference stays local (it is
a device preference, not member data).

## Approach

**Chosen — Approach A: central `useMemberData()` hook.**

A single `src/hooks/useMemberData.ts` wraps the Convex queries, mutations, and
the offline mirror. `App.tsx` becomes declarative; child components remain
prop-driven and are untouched. The data layer (mirror resolution, adapters,
error handling) is isolated and unit-testable.

Rejected alternatives:

- **B — inline hooks in `App.tsx`:** fewer files, but mixes data-layer concerns
  (mirror, adapters, errors) into the component and is harder to test in
  isolation.
- **C — Convex-only, drop localStorage entirely:** simplest, but provides no
  offline fallback (the project's PWA/offline TODO in `TODOS.md` wants one).

## Architecture

### Adapters — `src/data/convexAdapters.ts` (pure functions, unit-tested)

- `toLoanRecord(doc)` — maps Convex `_id` → frontend `id`; carries
  `resultSnapshot` (backend `v.any()`) through as `CalculationResult`.
- `toMemberProfile(doc)` — maps `_id` → `id`.
- `toLoanRecordInput(rec)` — strips `id` for the `loanRecords.create` payload.
- `toMemberProfileInput(profile)` — strips `id` for the
  `members.upsertMyProfile` payload.

### Data hook — `src/hooks/useMemberData.ts`

Reads (Convex reactive queries):

- `useQuery(api.members.getMyProfile)` → `Doc<"members"> | null | undefined`
- `useQuery(api.loanRecords.listMy)` → `Doc<"loanRecords">[] | undefined`

Offline mirror (existing `mmf-profile` / `mmf-records` keys):

- Seed display state from the mirrors on cold start (fast paint / offline).
- Resolution rule: when a query returns `undefined` (loading or offline), fall
  back to the mirror; otherwise use the server value **and** write it back to
  the mirror.
- A definitive server `null` (profile) or `[]` (records) clears the mirror — no
  stale "ghost" data after a member deletes or a fresh account signs in.

Mutations (each wrapped in try/catch; a failed call sets `lastError`):

- `saveRecord(input)` → `loanRecords.create({ record: toLoanRecordInput(input) })`
- `deleteRecord(id)` → `loanRecords.deleteDraft({ id })`
- `updateProfile(profile)` → `members.upsertMyProfile({ profile: toMemberProfileInput(profile) })`

The hook exposes the mapped `profile`, `records`, the mutation helpers, and
`lastError` (Arabic message) for an App-level toast.

### `src/App.tsx`

- Replace the `useState` profile/records and the removed `localStorage` helpers
  with `useMemberData()`.
- Keep the `handleSaveRecord` / `handleDeleteRecord` / `handleUpdateProfile`
  signatures so `LoanCalculator`, `ApplicationsHistory`, `ProfileSettings`, and
  `HomeDashboard` are unchanged.
- Render a defensive loading state while `profile` is null/undefined
  (`AuthGate` normally guarantees a non-null profile before `<App />` mounts).
- Dark-mode preference stays in `localStorage` (`mmf-dark-mode`) — unchanged.

### Delete semantics

`loanRecords.deleteDraft` only deletes caller-owned rows with `status ===
"draft"`. To align the UI with the backend and with product sense (members
should not silently delete submitted applications), `ApplicationsHistory` shows
the trash button **only for draft records**. Approved/pending/rejected records
are not deletable by the member.

## Testing

- New `src/data/convexAdapters.test.ts` — mapping in both directions
  (frontend ↔ backend payloads).
- New `src/hooks/useMemberData.test.ts` — mirror-vs-server resolution, mutation
  wrappers, and the mutation error path.
- Updated `src/App.test.tsx` — switch to the `vi.mock('convex/react')` pattern
  already used in `src/landing/LandingGate.test.tsx`; mocked query results feed
  the member data; dark-mode tests remain; the print-modal test seeds mocked
  records.
- Updated `src/components/ApplicationsHistory.test.tsx` — trash button only on
  drafts; the current delete assertion (deleting a pending record) is removed.
- Gate: `npm test` (Vitest) stays green, `npm run lint` (`tsc --noEmit`) is
  clean, and the 100% coverage goal is maintained.

## Versioning / flow

- Bump to `0.3.1.0`; update `CHANGELOG.md`, `PRODUCT.md`, `TODOS.md`.

## Out of scope (this iteration)

- Convex optimistic-update configuration.
- Offline mutation queueing (no outbox; offline saves fail gracefully with an
  error toast).
- Public-calculator sign-in gating — the landing already funnels through a
  "sign in / open the full calculator" CTA.
- Admin/association review role and status-approval workflow.
- Reference-number uniqueness fix (tracked separately, P2 in `TODOS.md`).
