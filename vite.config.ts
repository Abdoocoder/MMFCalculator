import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import {assertRequiredEnvVars} from './src/config/requiredEnv';

export default defineConfig(({command, mode}) => {
  // Load all env vars (no VITE_ prefix filter) so the guard can validate
  // the build-time vars the app inlines (see src/main.tsx). Shell/CI/deploy
  // env takes priority over .env files, which is what a cloud build injects.
  const env = loadEnv(mode, process.cwd(), '');

  // Only enforce on production builds. Vitest/dev-server boot the config via
  // command 'serve', which must not require the deploy-time vars.
  if (command === 'build') {
    assertRequiredEnvVars(env);
  }

  return {
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
