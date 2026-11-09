import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  document.body.innerHTML = '<pre style="color:#f87171;background:#020617;padding:16px">UBUZIMA HMS: #root element missing</pre>';
} else {
  const showFatal = (title: string, detail: unknown) => {
    root.innerHTML = `<div style="min-height:100vh;background:#020617;color:#e2e8f0;padding:24px;font-family:ui-sans-serif,system-ui"><h1 style="color:#f87171;font-size:20px;font-weight:700">${title}</h1><pre style="white-space:pre-wrap;margin-top:12px;background:#0f172a;padding:12px;border-radius:12px;border:1px solid #334155">${String((detail as any)?.stack || detail)}</pre><button onclick="localStorage.clear();location.reload()" style="margin-top:12px;padding:10px 14px;border-radius:10px;background:#0891b2;color:white;border:0;font-weight:700">Clear local data & reload</button></div>`;
  };
  window.addEventListener('error', (e) => {
    const msg = String((e as any)?.message || '');
    // @vitejs/plugin-react preamble detection often fails when CSP blocks /@vite/client or React Refresh.
    if (msg.includes("can't detect preamble")) {
      showFatal('UBUZIMA HMS — Vite React preamble blocked (usually CSP/HMR). Hard refresh (Ctrl+Shift+R). If using a custom port, open the same origin the server logs. Dev CSP must allow Vite scripts and HMR websocket.', e.error || e.message);
      return;
    }
    showFatal('UBUZIMA HMS — runtime error (prevented blank page)', e.error || e.message);
  });
  window.addEventListener('unhandledrejection', (e) => showFatal('UBUZIMA HMS — unhandled promise rejection', e.reason));
  try {
    createRoot(root).render(
      <StrictMode>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </StrictMode>,
    );
  } catch (e) {
    showFatal('UBUZIMA HMS — failed to start React', e);
  }
}
