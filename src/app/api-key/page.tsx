'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';
import { PageShell, Field, ReadoutLine } from '@/components/PageShell';

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
    <PageShell path="api-key" title="API Key">
      <div className="flex flex-col gap-3">
        <Field label="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="password" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleCreate} loading={loading === 'create'}>Create key</ActionButton>
        <ActionButton onClick={handleTestCall} loading={loading === 'test'}>
          Test call (Bull Board, dev only)
        </ActionButton>
      </div>

      <ReadoutLine label="raw key (shown once, never again)" value={apiKey ?? '(none)'} />

      <div className="flex flex-col gap-3">
        <Field label="key id to revoke" placeholder="key id" value={keyId} onChange={(e) => setKeyId(e.target.value)} />
        <div>
          <ActionButton onClick={handleRevoke} loading={loading === 'revoke'}>Revoke</ActionButton>
        </div>
      </div>

      <p className="text-xs text-[var(--fg-dim)]">
        No list endpoint exists on the backend (create + revoke only) — copy the key id
        from the create response (decode the JWT-like raw key or check the DB) to revoke it.
      </p>

      <ResponsePanel result={result} />
    </PageShell>
  );
}
