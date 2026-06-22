'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';
import { PageShell, Field, ReadoutLine } from '@/components/PageShell';

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
    <PageShell path="magic-link" title="Magic Link">
      <div className="flex flex-col gap-3">
        <Field label="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          <ActionButton onClick={handleSend} loading={loading === 'send'}>Send link</ActionButton>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Field
          label="token (paste from email/dev log)"
          placeholder="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div>
          <ActionButton onClick={handleVerify} loading={loading === 'verify'}>Verify</ActionButton>
        </div>
      </div>

      <ReadoutLine label="access token (in-memory only)" value={accessToken ?? '(none)'} />

      <ResponsePanel result={result} />
    </PageShell>
  );
}
