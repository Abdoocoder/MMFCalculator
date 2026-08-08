# TODOS

## General
- **Priority:** P4 — Add an offline/PWA install option so members can use the calculator without a network connection.
- **Priority:** P2 — Admin/association review role to approve or reject applications (status pending → approved/rejected).

## Loan Calculator
- **Priority:** P3 — Add a printable/voucher export for the monthly payment schedule (amortization table), not just the summary voucher.

## Applications History
- **Priority:** P3 — Add edit + resubmit for draft applications directly from the history page.

## Accessibility
- **Priority:** P2 — Full keyboard navigation audit across all tabs (focus order, skip link, ARIA live regions for calculator results).

## Testing
- **Priority:** P3 — Add component tests for HomeDashboard and Sidebar (currently covered only indirectly).

## Hardening (pre-landing review 2026-08-08)
- **Priority:** P2 — Add uniqueness check or timestamp component to `generateReferenceNo()` (4-digit random has ~40% collision chance at scale).
- **Priority:** P2 — Validate shape of parsed localStorage values in `loadState` (e.g. `Array.isArray` for records) so malformed-but-valid JSON can't blank the app.
- **Priority:** P3 — Review print CSS scope (`body > *:not(.print-modal-root)`) for plain page-level printing regression.
- **Priority:** P3 — Store `currentDeductions` + product id on `LoanRecord` so snapshot-less recompute is consistent.
- **Priority:** P3 — Review PII-at-rest surface (national ID, phone, salary in plaintext localStorage).

## Completed
- **Priority:** P0 — Convex + Clerk backend: member profile and loan records stored server-side in Convex scoped by the Clerk user id; member area at `#app` requires sign-in. **Completed:** v0.3.0.0 (2026-08-09)
- **Priority:** P0 — Single-page landing as the new HTML entry (Financing Notation world) with live hero calculator, narrative ledger, products, legend, and app at `/#app`. **Completed:** v0.2.0.0 (2026-08-08)
- **Priority:** P0 — Print voucher modal with accessible focus trap. **Completed:** v0.1.0.0 (2026-08-08)
- **Priority:** P0 — Persist member profile, saved applications, and dark-mode preference. **Completed:** v0.1.0.0 (2026-08-08)
- **Priority:** P1 — Design-token refactor replacing hard-coded colors. **Completed:** v0.1.0.0 (2026-08-08)
- **Priority:** P1 — Enable strict TypeScript checking. **Completed:** v0.1.0.0 (2026-08-08)
- **Priority:** P1 — Vitest + Testing Library test suite with CI (test, lint, build). **Completed:** v0.1.0.0 (2026-08-08)
