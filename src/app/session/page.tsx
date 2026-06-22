'use client';

import { useEffect, useState } from 'react';
import { apiFetch, getCsrfTokenFromCookie, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';

export default function SessionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  // Double-submit pattern needs a token in hand before any mutating request.
  useEffect(() => {
    apiFetch<{ csrfToken: string }>('/auth/session/csrf-token').then((res) => {
      if (res.data) setCsrfToken(res.data.csrfToken);
    });
  }, []);

  async function run(name: string, fn: () => Promise<ApiResult<unknown>>) {
    setLoading(name);
    const res = await fn();
    setResult(res);
    setLoading(null);
  }

  async function handleLogin() {
    await run('login', () =>
      apiFetch<unknown>('/auth/session/login', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken ?? '' },
        body: JSON.stringify({ email, password }),
      }),
    );
    // Login calls req.session.regenerate() (prevents session fixation) — that gives
    // a new session id, which invalidates any CSRF token minted before login.
    const fresh = await apiFetch<{ csrfToken: string }>('/auth/session/csrf-token');
    if (fresh.data) setCsrfToken(fresh.data.csrfToken);
  }

  async function handleLogout() {
    // Token rotates on use in some configs — read fresh from cookie rather than stale state.
    const token = getCsrfTokenFromCookie() ?? csrfToken ?? '';
    await run('logout', () =>
      apiFetch<null>('/auth/session/logout', {
        method: 'POST',
        headers: { 'X-CSRF-Token': token },
      }),
    );
  }

  async function handleLogoutNoCsrf() {
    await run('logout-no-csrf', () =>
      apiFetch<null>('/auth/session/logout', { method: 'POST' }),
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">Session Auth</h1>

      <div className="text-xs text-zinc-500 break-all">CSRF token: {csrfToken ?? '(loading…)'}</div>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
        <ActionButton onClick={handleLogout} loading={loading === 'logout'}>Logout</ActionButton>
        <ActionButton onClick={handleLogoutNoCsrf} loading={loading === 'logout-no-csrf'}>
          Logout (no CSRF header — expect 403)
        </ActionButton>
      </div>

      <ResponsePanel result={result} />
    </main>
  );
}
