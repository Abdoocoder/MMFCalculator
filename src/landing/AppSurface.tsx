import { Suspense, lazy } from 'react';
import AuthGate from '../auth/AuthGate';

/**
 * The member SPA chunk, loaded only when the user switches to the `#app`
 * hash. Keeps the ~450 kB member bundle off the public landing page's
 * critical path (single HTML entry; landing at `/`, SPA at `#app`).
 */
const App = lazy(() => import('../App'));

export default function AppSurface() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
          <p className="text-sm text-ink-soft dark:text-gray-400">جارٍ تحميل النظام...</p>
        </div>
      }
    >
      <AuthGate>
        <App />
      </AuthGate>
    </Suspense>
  );
}
