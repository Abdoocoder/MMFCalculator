# Changelog

## [0.3.0.0] - 2026-08-09

### Added

- Member identity via Clerk: the member area at `#app` now requires sign-in, with a first-login sign-up form that creates the member's profile row.
- A Convex backend with `members` and `loanRecords` tables, each scoped by the signed-in member's Clerk user id (`ctx.auth.getUserIdentity().subject`).
- Serverless functions: profile query/upsert/sign-up, and loan-record list/create/status-update/delete-draft, all guarded against unauthenticated callers.
- `.env` wiring for `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, with typed `ImportMetaEnv`.

### Changed

- `main.tsx` wraps the app in `ClerkProvider` + `ConvexProviderWithClerk`.
- The `#app` surface is routed through an `AuthGate` (loading → sign-in → sign-up → app).
- Member profile and loan records are read from and written to Convex instead of `localStorage`; only the dark-mode preference stays local.
- The landing page and its public calculator remain open to everyone.

## [0.2.0.0] - 2026-08-08

### Added

- A single-page landing (the "Financing Notation" world): a deep-blue field with a star lattice, a live Murabaha calculator in the hero, and a narrative ledger that balances the account to zero — installment × months always equals principal + fixed profit + insurance.
- The landing is the new single HTML entry; the full app now mounts at the `#app` route, and every CTA takes members straight into the calculator.
- A "key to the ledgers" legend that explains each certified star (fixed 15% profit per association policy, 40% legal deduction cap, 0.5% annual insurance as a cost estimate), the five Murabaha product lines with one-click "احسب هذا المنتج" pre-selection, real association announcements, and a footer crediting the maker.
- Star-geometry and narrative-ledger pure modules (`star.ts`, `ledger.ts`) with their own test suites, plus component tests for the calculator, ledger, page, and hash gate (64 tests total, all passing).

### Changed

- `main.tsx` now renders a `LandingGate` that shows the landing at `/` and the app at `/#app`, keeping the app codebase untouched.
- The document now carries an Arabic title, meta description, and the JetBrains Mono figure font; a contract comment documenting the world's commitments survives into the built `index.html` as the first child of `<body>`.

## [0.1.0.0] - 2026-08-08

### Added

- Saved applications and member profile now persist across sessions in the browser, and your dark/light preference is remembered (and picked up from your system the first time).
- Saved loan calculations carry a result snapshot, so a printed voucher shows exactly the numbers that were saved.
- Automated test suite (Vitest + Testing Library) covering the loan calculator, app state, persistence, and the print voucher modal, with a CI workflow that runs tests, lint, and build on every push.

### Changed

- Refactored hard-coded colors into a reusable design-token system so the palette stays consistent across the app.
- Enabled strict TypeScript checking across the project.
- Improved touch targets and readability on the applications-history page (larger controls, clearer search label).

### Fixed

- The print-voucher modal now traps keyboard focus correctly when opened — Tab/Shift+Tab never escape behind the overlay, and the modal stays reachable on repeated opens.
- The print-voucher modal's Escape/close handling no longer re-binds on every parent re-render.
- Voucher footer text bumped to a readable size for the printed report.
- Corrected the sample pending-application installments to match the calculator output.
