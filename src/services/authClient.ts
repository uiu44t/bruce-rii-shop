export type UbuzimaAuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  facilityId?: string | null;
  mode?: 'backend' | 'local';
};

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: UbuzimaAuthUser;
};

const KEY = 'ubuzima_auth_v1';

export function getAuth(): AuthState | null {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setAuth(state: AuthState | null) {
  if (!state) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(state));
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const auth = getAuth();
  const headers = new Headers(init.headers || {});
  if (auth?.accessToken && auth.user?.mode !== 'local') headers.set('Authorization', `Bearer ${auth.accessToken}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  let res = await fetch(path, { ...init, headers });
  if (res.status === 401 && auth?.refreshToken && auth.user?.mode !== 'local') {
    const r = await fetch('/api/v1/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: auth.refreshToken }) });
    if (r.ok) {
      const next = await r.json();
      setAuth({ accessToken: next.accessToken, refreshToken: next.refreshToken, user: { ...next.user, mode: 'backend' } });
      headers.set('Authorization', `Bearer ${next.accessToken}`);
      res = await fetch(path, { ...init, headers });
    } else setAuth(null);
  }
  return res;
}

function localAuth(user: Omit<UbuzimaAuthUser, 'permissions' | 'mode' | 'id'> & { id?: string; permissions?: string[] }): AuthState {
  const state: AuthState = {
    accessToken: `local-${Date.now()}`,
    refreshToken: `local-refresh-${Date.now()}`,
    user: {
      id: user.id || `local-${user.role.toLowerCase()}-${Date.now()}`,
      email: user.email.toLowerCase(),
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions || [],
      facilityId: user.facilityId ?? null,
      mode: 'local',
    },
  };
  setAuth(state);
  return state;
}

async function readAuthResponse(res: Response, fallback: string): Promise<AuthState | { dbNotConfigured: true; message: string }> {
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    const state = { accessToken: data.accessToken, refreshToken: data.refreshToken, user: { ...data.user, mode: 'backend' as const } } as AuthState;
    setAuth(state);
    return state;
  }
  if (res.status === 503 && (data.error === 'DB_NOT_CONFIGURED' || /database|postgres|db/i.test(String(data.message || '')))) {
    return { dbNotConfigured: true, message: data.message || 'Database not configured' };
  }
  throw new Error(data.message || data.error || fallback);
}

export async function login(email: string, password: string): Promise<AuthState> {
  try {
    const res = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const result = await readAuthResponse(res, 'Login failed');
    if ('dbNotConfigured' in result) {
      const safeEmail = String(email || '').trim().toLowerCase();
      const name = safeEmail ? safeEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'UBUZIMA User';
      return localAuth({ email: safeEmail || 'user@local.ubuzima', fullName: name || 'UBUZIMA User', role: 'HOSPITAL_ADMIN' });
    }
    return result;
  } catch (err: any) {
    if (err?.name === 'TypeError') {
      const safeEmail = String(email || '').trim().toLowerCase();
      return localAuth({ email: safeEmail || 'user@local.ubuzima', fullName: 'UBUZIMA User', role: 'HOSPITAL_ADMIN' });
    }
    throw err;
  }
}

export async function register(input: { fullName: string; email: string; password: string; role: string; phone?: string; facilityCode?: string }): Promise<AuthState> {
  try {
    const res = await fetch('/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const result = await readAuthResponse(res, 'Signup failed');
    if ('dbNotConfigured' in result) {
      return localAuth({ email: input.email, fullName: input.fullName, role: input.role });
    }
    return result;
  } catch (err: any) {
    if (err?.name === 'TypeError') {
      return localAuth({ email: input.email, fullName: input.fullName, role: input.role });
    }
    throw err;
  }
}

export function logout() { setAuth(null); }
