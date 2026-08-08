import { useCallback, useEffect, useState } from 'react';
import App from '../App';
import AuthGate from '../auth/AuthGate';
import LandingPage from './LandingPage';

const APP_HASH = '#app';

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
      <AuthGate>
        <App />
      </AuthGate>
    );
  }
  return <LandingPage onLaunchApp={launchApp} />;
}
