# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

Vitest 3 + @testing-library/react + @testing-library/jest-dom, running in jsdom via the Vite config.

## How to run

```bash
npm test          # single run (CI)
npm run lint      # TypeScript strict typecheck
npm run build     # production build
```

## Test layers

- **Unit tests** — pure business logic. Convention: `*.test.ts(x)` colocated next to the module under test. Most live under `src/` (e.g. `src/utils/loanCalculator.test.ts`); tests for root-level deploy files (the Vercel edge middleware) sit at the repo root next to their source (`middleware.test.ts`).
- **Integration tests** — components with @testing-library/react, colocated under `src/components` (e.g. `src/components/HomeDashboard.test.tsx`).
- **Smoke tests** — the CI pipeline (`.github/workflows/test.yml`) runs test + lint + build on every push/PR to `main`.
- **E2E tests** — not configured; add Playwright or similar when a browser-level flow needs coverage.

## Conventions

- File naming: `*.test.ts(x)` colocated with the source file.
- Assertion style: Vitest's `expect` + `@testing-library/jest-dom` matchers (imported globally via `src/test/setup.ts`).
- Test real behavior with meaningful assertions — never `expect(x).toBeDefined()`.
- Floating-point comparisons use `toBeCloseTo`.
- Setup/teardown: jsdom is the default environment; per-file setup lives in `src/test/setup.ts`.
