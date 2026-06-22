'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';

interface AuthOutput {
  accessToken: string;
}

export default function ApiKeyPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyId, setKeyId] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  async function run(name: string, fn: () => Promise<ApiResult<unknown>>) {
    setLoading(name);
    const res = await fn();
    setResult(res);
    setLoading(null);
    return res;
  }

  // API keys are minted by a logged-in user — JWT login first.
  async function handleLogin() {
    const res = await run('login', () =>
      apiFetch<AuthOutput>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    );
    if (res.data) setAccessToken((res.data as AuthOutput).accessToken);
  }

  async function handleCreate() {
    const res = await run('create', () =>
      apiFetch<{ apiKey: string }>('/auth/api-keys', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: JSON.stringify({ scopes: ['read', 'write'] }),
      }),
    );
    if (res.data) setApiKey((res.data as { apiKey: string }).apiKey);
  }

  async function handleRevoke() {
    await run('revoke', () =>
      apiFetch<null>(`/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      }),
    );
  }

  // No JSON API guarded by ApiKeyGuard exists yet — Bull Board (dev-only) is the only
  // route using it, so we hit that directly with the raw key as a connectivity check.
  async function handleTestCall() {
    setLoading('test');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/api/queues`, {
        headers: { 'X-API-Key': apiKey ?? '' },
      });
      setResult({ status: res.status, data: null, error: res.ok ? null : 'Rejected (see status)' });
    } catch (err) {
      setResult({ status: 0, data: null, error: err instanceof Error ? err.message : 'Request failed' });
    }
    setLoading(null);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">API Key</h1>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleCreate} loading={loading === 'create'}>Create key</ActionButton>
        <ActionButton onClick={handleTestCall} loading={loading === 'test'}>
          Test call (Bull Board, dev only)
        </ActionButton>
      </div>

      <div className="text-xs text-zinc-500 break-all">
        Raw key (shown once, never again): {apiKey ?? '(none)'}
      </div>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="key id to revoke" value={keyId} onChange={(e) => setKeyId(e.target.value)} />
        <ActionButton onClick={handleRevoke} loading={loading === 'revoke'}>Revoke</ActionButton>
      </div>

      <p className="text-xs text-zinc-500">
        No list endpoint exists on the backend (create + revoke only) — copy the key id
        from the create response (decode the JWT-like raw key or check the DB) to revoke it.
      </p>

      <ResponsePanel result={result} />
    </main>
  );
}
