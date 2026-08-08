import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import LandingGate from './landing/LandingGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingGate />
  </StrictMode>,
);
