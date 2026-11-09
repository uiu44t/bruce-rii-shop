import React from 'react';

type State = { error?: Error };
export class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('UBUZIMA UI error', error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
          <h1 style={{ color: '#f87171', fontSize: 20, fontWeight: 700 }}>UBUZIMA HMS — UI error (page recovered from blank screen)</h1>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, background: '#0f172a', padding: 12, borderRadius: 12, border: '1px solid #334155' }}>{String(this.state.error.stack || this.state.error.message)}</pre>
          <button onClick={() => { localStorage.removeItem('ubuzima_auth_v1'); location.reload(); }} style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#0891b2', color: 'white', border: 0, fontWeight: 700 }}>Clear UBUZIMA auth & reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
