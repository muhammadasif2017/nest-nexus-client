'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';

interface AuthOutput {
  accessToken: string;
}

export default function MagicLinkPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
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

  // Always returns 200 — backend deliberately doesn't reveal whether the email exists.
  async function handleSend() {
    await run('send', () =>
      apiFetch<{ message: string }>('/auth/magic-link/send', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    );
  }

  // Token comes from the emailed link in real use — in dev, grab it from server logs/Bull Board.
  async function handleVerify() {
    const res = await run('verify', () =>
      apiFetch<AuthOutput>(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`),
    );
    if (res.data) setAccessToken((res.data as AuthOutput).accessToken);
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">Magic Link</h1>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <ActionButton onClick={handleSend} loading={loading === 'send'}>Send link</ActionButton>
      </div>

      <div className="flex flex-col gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder="token (paste from email/dev log)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <ActionButton onClick={handleVerify} loading={loading === 'verify'}>Verify</ActionButton>
      </div>

      <div className="text-xs text-zinc-500 break-all">Access token (in-memory only): {accessToken ?? '(none)'}</div>

      <ResponsePanel result={result} />
    </main>
  );
}
