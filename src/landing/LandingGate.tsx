import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import LandingPage from './LandingPage';

const AppSurface = lazy(() => import('./AppSurface'));

const APP_HASH = '#app';

const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
    <p className="text-sm text-ink-soft dark:text-gray-400">جارٍ تحميل النظام...</p>
  </div>
);

/**
 * Single-HTML-entry gate: the landing page renders at `/`, and the existing
 * SPA mounts at the `#app` hash route behind the auth gate. Switching hashes
 * swaps surfaces and resets scroll.
 */
export default function LandingGate() {
  const [isApp, setIsApp] = useState(() => window.location.hash === APP_HASH);

  useEffect(() => {
    const onHashChange = () => {
      setIsApp(window.location.hash === APP_HASH);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const launchApp = useCallback(() => {
    window.location.hash = APP_HASH;
  }, []);

  if (isApp) {
    return (
      <Suspense fallback={loadingFallback}>
        <AppSurface />
      </Suspense>
    );
  }
  return <LandingPage onLaunchApp={launchApp} />;
}
