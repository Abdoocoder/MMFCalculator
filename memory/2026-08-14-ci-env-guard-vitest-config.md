# Debug Report — CI fails with "Missing required build-time environment variable(s)"

- **Date:** 2026-08-14
- **Commit:** `4b5f1be`
- **Status:** DONE

## Symptom
GitHub Actions (`test` workflow, PR #12) failed at `npm test` with a
`Startup Error` from Vitest:

```
Error: Missing required build-time environment variable(s): VITE_CONVEX_URL, VITE_CLERK_PUBLISHABLE_KEY.
    at assertRequiredEnvVars ... (vite.config.ts.timestamp-...mjs)
```

## Root cause
Vitest boots the Vite config through `createServer`, which runs the config
function with `command: 'serve'`. The env guard added in `ee77e56` asserted
unconditionally on every config load, so `npm test` (no deploy env vars on CI)
tripped the guard during config resolution — before any test ran. The guard's
intent is to protect the *production build* (`vite build`), not dev-server or
test config boot.

## Fix
`vite.config.ts`: gate `assertRequiredEnvVars(env)` behind `command === 'build'`.

## Evidence
Reproduced in a fresh `git clone` + `npm ci`:
- `npm test` with no env: **passes** (23 files / 133 tests) after fix; failed before.
- `npm run build` with no env source (no `.env.production`, no shell env):
  **fails loudly** with the descriptive error — guard still protects deploys.
- `npm run build` with shell env or tracked `.env.production`: **passes**.

## Regression test
Existing `src/config/requiredEnv.test.ts` (4 tests) covers the guard logic
itself (missing/blank/all-set). The `command === 'build'` gating is in the
Vite config, verified by the reproduction above.

## Related
- `ee77e56` introduced the unconditional guard.
- `f767ceb` tracked public `VITE_*` vars in `.env.production`.
- `6434b86`, `23cb590` prior work on the Convex no-address issue (root cause:
  env-less cloud build inlines `undefined` for `import.meta.env.VITE_CONVEX_URL`).