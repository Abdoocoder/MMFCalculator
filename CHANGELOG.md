# Changelog

## [0.3.2.0] - 2026-08-14

### Fixed
- Fixed ARIA current attribute in navigation tests for accuracy
- Corrected hover states in UI components for visual consistency
- Resolved various test failures and improved test reliability

### Changed
- Updated font loading to optimize performance
- Improved form handling in authentication screens
- Enhanced application history component functionality
- Refined home dashboard and loan calculator components
- Updated print voucher modal for better usability
- Improved profile settings form validation and submission
- Enhanced sidebar navigation component
- Updated landing gate and page components
- Improved live calculator component
- Enhanced test setup for better reliability

### Removed
- Removed unused mock data files


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

