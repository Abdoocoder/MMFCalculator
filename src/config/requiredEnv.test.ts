import { describe, expect, it } from 'vitest';
import {
  assertRequiredEnvVars,
  findMissingEnvVars,
  REQUIRED_ENV_VARS,
} from './requiredEnv';

describe('requiredEnv', () => {
  it('reports every required var that is missing or blank', () => {
    expect(findMissingEnvVars({})).toEqual(['VITE_CONVEX_URL', 'VITE_CLERK_PUBLISHABLE_KEY']);
    expect(findMissingEnvVars({ VITE_CONVEX_URL: 'https://x.convex.cloud' })).toEqual([
      'VITE_CLERK_PUBLISHABLE_KEY',
    ]);
    expect(findMissingEnvVars({ VITE_CONVEX_URL: '   ', VITE_CLERK_PUBLISHABLE_KEY: '' })).toEqual(
      ['VITE_CONVEX_URL', 'VITE_CLERK_PUBLISHABLE_KEY'],
    );
  });

  it('throws a descriptive error listing the missing vars', () => {
    expect(() => assertRequiredEnvVars({})).toThrow(
      /Missing required build-time environment variable\(s\): VITE_CONVEX_URL, VITE_CLERK_PUBLISHABLE_KEY/,
    );
  });

  it('passes when all required vars are set', () => {
    expect(() =>
      assertRequiredEnvVars({
        VITE_CONVEX_URL: 'https://sleek-squirrel-611.convex.cloud',
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_abc',
      }),
    ).not.toThrow();
  });

  it('tracks exactly the two build-time vars the app requires', () => {
    expect(REQUIRED_ENV_VARS).toEqual(['VITE_CONVEX_URL', 'VITE_CLERK_PUBLISHABLE_KEY']);
  });
});