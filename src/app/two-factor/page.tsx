'use client';

import { useState } from 'react';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';
import { PageShell, Field, ReadoutLine } from '@/components/PageShell';

interface AuthOutput {
  accessToken: string;
  isTwoFactorPending?: boolean;
}

interface SetupOutput {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export default function TwoFactorPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [code, setCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  async function run(name: string, fn: () => Promise<ApiResult<unknown>>) {
    setLoading(name);
    const res = await fn();
    setResult(res);
    setLoading(null);
    return res;
  }

  // Login first — if 2FA is enabled, the token returned is pending-scope and only
  // POST /auth/2fa/verify will accept it (see AllowPending2FA in backend).
  async function handleLogin() {
    const res = await run('login', () =>
      apiFetch<AuthOutput>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    );
    if (res.data) {
      const data = res.data as AuthOutput;
      setAccessToken(data.accessToken);
      setIsPending(Boolean(data.isTwoFactorPending));
    }
  }

  async function handleSetup() {
    const res = await run('setup', () =>
      apiFetch<SetupOutput>('/auth/2fa/setup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      }),
    );
    if (res.data) setQrCodeDataUrl((res.data as SetupOutput).qrCodeDataUrl);
  }

  async function handleEnable() {
    await run('enable', () =>
      apiFetch<{ backupCodes: string[] }>('/auth/2fa/enable', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: JSON.stringify({ code }),
      }),
    );
  }

  async function handleVerify() {
    const res = await run('verify', () =>
      apiFetch<AuthOutput>('/auth/2fa/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: JSON.stringify({ code }),
      }),
    );
    if (res.data) {
      setAccessToken((res.data as AuthOutput).accessToken);
      setIsPending(false);
    }
  }

  async function handleDisable() {
    await run('disable', () =>
      apiFetch<null>('/auth/2fa/disable', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: JSON.stringify({ code }),
      }),
    );
  }

  return (
    <PageShell path="two-factor" title="2FA (TOTP)">
      <div className="flex flex-col gap-3">
        <Field label="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="password" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <div>
          <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login</ActionButton>
        </div>
      </div>

      <ReadoutLine
        label="access token (in-memory only)"
        value={accessToken ?? '(none)'}
        flag={isPending ? 'PENDING 2FA' : undefined}
      />

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleSetup} loading={loading === 'setup'}>Setup (get QR)</ActionButton>
      </div>

      {qrCodeDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrCodeDataUrl} alt="2FA QR code" className="h-48 w-48 rounded border border-[var(--border)]" />
      )}

      <div className="flex flex-col gap-3">
        <Field label="TOTP or backup code" placeholder="code" value={code} onChange={(e) => setCode(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={handleEnable} loading={loading === 'enable'}>Enable</ActionButton>
          <ActionButton onClick={handleVerify} loading={loading === 'verify'}>Verify pending login</ActionButton>
          <ActionButton onClick={handleDisable} loading={loading === 'disable'}>Disable</ActionButton>
        </div>
      </div>

      <ResponsePanel result={result} />
    </PageShell>
  );
}
