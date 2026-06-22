'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';
import { PageShell, Field, ReadoutLine } from '@/components/PageShell';

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

// Mirrors RegisterInput validation in nest-nexus (register.input.ts) — fail fast
// client-side instead of round-tripping a guaranteed 400.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,72}$/;

function validatePassword(password: string): string | null {
  if (!PASSWORD_PATTERN.test(password)) {
    return 'Password must be 8-72 chars with uppercase, lowercase, number, and a special character (@$!%*?&).';
  }
  return null;
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
    const validationError = validatePassword(password);
    if (validationError) {
      setResult({ status: 400, data: null, error: validationError });
      return;
    }
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
    <PageShell path="jwt" title="JWT Auth">
      <div className="flex flex-col gap-3">
        <Field label="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="display name (register only)" placeholder="display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Field label="password" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <p className="text-xs text-[var(--fg-dim)]">
          Register requires 8+ chars with uppercase, lowercase, number, and a special character
          (@$!%*?&amp;) — e.g. P@ssw0rd!
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleRegister} loading={loading === 'register'}>Register</ActionButton>
        <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
        <ActionButton onClick={handleRefresh} loading={loading === 'refresh'}>Refresh</ActionButton>
        <ActionButton onClick={handleLogout} loading={loading === 'logout'}>Logout</ActionButton>
        <ActionButton onClick={handleMe} loading={loading === 'me'}>Me</ActionButton>
        <ActionButton onClick={handleSessions} loading={loading === 'sessions'}>Device Sessions</ActionButton>
      </div>

      <ReadoutLine label="access token (in-memory only)" value={accessToken ?? '(none)'} />

      <ResponsePanel result={result} />
    </PageShell>
  );
}
