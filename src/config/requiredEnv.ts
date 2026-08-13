export const REQUIRED_ENV_VARS = ['VITE_CONVEX_URL', 'VITE_CLERK_PUBLISHABLE_KEY'] as const;

export type RequiredEnv = Record<string, string | undefined>;

export function findMissingEnvVars(env: RequiredEnv): string[] {
  return REQUIRED_ENV_VARS.filter((key) => !env[key] || env[key]!.trim() === '');
}

export function assertRequiredEnvVars(env: RequiredEnv): void {
  const missing = findMissingEnvVars(env);
  if (missing.length > 0) {
    throw new Error(
      `Missing required build-time environment variable(s): ${missing.join(', ')}.\n` +
        'Set them in .env.local or in the deploy platform\'s environment before building.\n' +
        'If deploying to production, see https://docs.convex.dev/production/hosting/',
    );
  }
}