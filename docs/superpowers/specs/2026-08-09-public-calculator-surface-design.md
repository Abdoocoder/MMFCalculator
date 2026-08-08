# Design: Public Calculator Surface (v0.3.0.0)

**Date:** 2026-08-09
**Branch:** chore/impeccable-audit-fixes (same PR #1, no new PR)
**Status:** Approved by user

## Goal

Make the Murabaha calculator the public root page of the app. Anyone visiting `/` gets the working calculator with no intermediate landing page and no exposure of member data. The existing full member app (records, profile, applications) remains reachable at `/#app` for when real member access is added later.

## Architecture

Two surfaces behind the existing single-HTML entry, switched by hash:

- `/` → `PublicCalculatorPage` (public, anonymous, calculator only)
- `/#app` → `App` (member app, unchanged)

`LandingGate` keeps its current role — it becomes the surface switch with `PublicCalculatorPage` replacing `LandingPage`. Same `hashchange` mechanism, reset scroll on switch.

## Components

### `src/calculator/PublicCalculatorPage.tsx` (new)

Minimal public shell wrapping the existing `LoanCalculator`:

- Header bar: app title, dark-mode sun/moon toggle, link "منطقة الأعضاء" → `/#app`.
- Renders `<LoanCalculator profile={INITIAL_MEMBER_PROFILE} onSaveRecord={...} />` unchanged — save / submit / print all work locally for the visitor.
  - `onSaveRecord` is a no-op on the public page: the success toast still shows (confirming the calculation), but no record is written to a member store. The public page has no records surface, so there is nowhere to display saved records; nothing is persisted.
- Reuses the dark-mode pattern from `App.tsx` (`mmf-dark-mode` localStorage + `document.documentElement.classList.toggle('dark', …)`).
- Uses the same design tokens / Tailwind classes as the rest of the app.

### `LandingGate.tsx` (repurposed)

- `/` → `PublicCalculatorPage`
- `/#app` → `App`
- Hash switch + scroll reset behavior unchanged.

### Deletions (landing no longer used)

- `src/landing/LandingPage.tsx`
- `src/landing/StarField.tsx`
- `src/landing/LedgerSection.tsx`
- `src/landing/LiveCalculator.tsx`
- `src/landing/useReveal.ts`
- `src/landing/landing.css`
- `src/landing/star.ts`
- `src/landing/ledger.ts`
- Tests: `LandingPage.test.tsx`, `LiveCalculator.test.tsx`, `star.test.ts`, `ledger.test.ts`

## Testing

- `LandingGate.test.tsx` rewritten: `/` renders the public calculator, `#app` renders the member app; hash switching flips surfaces.
- `PublicCalculatorPage.test.tsx` (new): renders the calculator, dark-mode toggle flips the `dark` class both ways, nav link to `/#app` present.
- All existing calculator/app tests remain green.

## Docs & Version

- `index.html`: keep Arabic title, update meta description to describe the public calculator.
- Version bumped to **0.3.0.0**; CHANGELOG updated; PRODUCT.md/TODOS reflect the public-calculator-first product.
- Same PR #1 (no new PR); branch and push as before.
