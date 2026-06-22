'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';

interface AuthOutput {
  accessToken: string;
  user: { id: string; email: string; displayName: string };
  accessTokenExpiresAt: string;
  isTwoFactorPending?: boolean;
}

interface DeviceSession {
  deviceId: string;
  isCurrent: boolean;
  [key: string]: unknown;
}

export default function JwtPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  async function run(name: string, fn: () => Promise<ApiResult<unknown>>) {
    setLoading(name);
    const res = await fn();
    setResult(res);
    setLoading(null);
    return res;
  }

  async function handleRegister() {
    const res = await run('register', () =>
      apiFetch<AuthOutput>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, displayName, password }),
      }),
    );
    if (res.data) setAccessToken((res.data as AuthOutput).accessToken);
  }

  async function handleLogin() {
    const res = await run('login', () =>
      apiFetch<AuthOutput>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    );
    if (res.data) setAccessToken((res.data as AuthOutput).accessToken);
  }

  async function handleRefresh() {
    const res = await run('refresh', () => apiFetch<AuthOutput>('/auth/refresh', { method: 'POST' }));
    if (res.data) setAccessToken((res.data as AuthOutput).accessToken);
  }

  async function handleLogout() {
    const res = await run('logout', () =>
      apiFetch<null>('/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      }),
    );
    if (res.status === 204) setAccessToken(null);
  }

  async function handleMe() {
    await run('me', () => apiFetch<unknown>('/auth/me', { headers: { Authorization: `Bearer ${accessToken ?? ''}` } }));
  }

  async function handleSessions() {
    await run('sessions', () =>
      apiFetch<DeviceSession[]>('/auth/sessions', { headers: { Authorization: `Bearer ${accessToken ?? ''}` } }),
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">JWT Auth</h1>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="display name (register only)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleRegister} loading={loading === 'register'}>Register</ActionButton>
        <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
        <ActionButton onClick={handleRefresh} loading={loading === 'refresh'}>Refresh</ActionButton>
        <ActionButton onClick={handleLogout} loading={loading === 'logout'}>Logout</ActionButton>
        <ActionButton onClick={handleMe} loading={loading === 'me'}>Me</ActionButton>
        <ActionButton onClick={handleSessions} loading={loading === 'sessions'}>Device Sessions</ActionButton>
      </div>

      <div className="text-xs text-zinc-500 break-all">
        Access token (in-memory only): {accessToken ?? '(none)'}
      </div>

      <ResponsePanel result={result} />
    </main>
  );
}
