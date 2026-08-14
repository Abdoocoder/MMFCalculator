# Changelog

## [0.3.2.0] - 2026-08-14

### Changed
- Mobile-first responsive design: the header, loan calculator, and print voucher now get larger touch targets and phone-friendly layouts, so the core borrowing flow works comfortably from a phone; the remaining member screens received cleaner tokens and readable text sizes.
- The member app now loads on demand — its bundle is fetched only when someone opens `#app`, keeping the public landing page's critical path lean.
- Improved the landing page, live calculator, and landing gate for better usability.
- Optimized font loading by dropping unused webfonts (Be Vietnam Pro, Material Symbols), so pages render faster.
- Cleaner hover states and design-token colors across UI components, plus smoother form handling in the auth and profile screens.
- Enhanced the test setup for more reliable, consistent runs.

### Fixed
- Corrected the `aria-current` value on active navigation links (and the tests that assert it).
- Resolved several test failures and reliability issues across the suite.

### Removed
- Removed unused sample member and loan mock records; `src/data/mockData.ts` now holds only the real association announcements.

## [0.3.1.0] - 2026-08-14

### Added
- Client-side Convex migration: the member app's profile and loan records are now backed by Convex queries and mutations through a central `useMemberData()` hook (`src/hooks/useMemberData.ts`), with pure-function adapters (`src/data/convexAdapters.ts`) mapping Convex docs to frontend types and vice versa.
- Offline mirror cache (`src/data/mirror.ts`): `mmf-profile` / `mmf-records` localStorage mirrors seed cold-start and offline reads; the server value wins and is written back when available, and a definitive empty result clears the mirror. Reads are shape-validated (`isMemberProfileShape` / `isLoanRecordShape`) so malformed-but-valid JSON can't blank the app.
- Root Vercel Edge `middleware.ts` proxying `https://mmf-calculator.vercel.app/__clerk/*` to `frontend-api.clerk.dev` with `Clerk-Proxy-Url` / `Clerk-Secret-Key` headers, plus its test suite (`middleware.test.ts`) and documented external setup steps.
- Env guard: `vite build` fails loudly when required env vars (`VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`) are missing; public build-time vars are tracked in `.env.production`; Clerk switched to the production publishable key.
- Full a11y pass on the member SPA resolving all audit findings.

### Changed
- `src/App.tsx` is now declarative over `useMemberData()`; child components stay prop-driven and unchanged.
- `ApplicationsHistory` shows the trash button only for draft records — approved/pending/rejected applications are not deletable by the member (aligned with `loanRecords.deleteDraft` semantics).
- Added component tests for the home dashboard, loading gate, and record stats.

### Fixed

- Production Clerk sign-in: the Frontend API is now reachable through the app's own domain instead of the default Clerk domain.
- CI env-guard regression: `assertRequiredEnvVars` only runs during `vite build`, not during Vitest.

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

