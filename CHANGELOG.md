# Changelog

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
