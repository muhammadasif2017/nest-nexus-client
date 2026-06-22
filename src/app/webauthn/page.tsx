'use client';

import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { ActionButton } from '@/components/ActionButton';

interface AuthOutput {
  accessToken: string;
  user: { id: string; email: string; displayName: string };
}

export default function WebauthnPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  async function run(name: string, fn: () => Promise<unknown>) {
    setLoading(name);
    try {
      await fn();
    } catch (err) {
      setResult({ status: 0, data: null, error: err instanceof Error ? err.message : 'Browser WebAuthn call failed' });
    }
    setLoading(null);
  }

  // Brand-new account, no JWT needed — passkey is the only credential.
  async function handleSignup() {
    await run('signup', async () => {
      const optionsRes = await apiFetch<Parameters<typeof startRegistration>[0]['optionsJSON']>(
        '/auth/webauthn/signup/options',
        { method: 'POST', body: JSON.stringify({ email, displayName }) },
      );
      setResult(optionsRes);
      if (!optionsRes.data) return;

      const attResp = await startRegistration({ optionsJSON: optionsRes.data });
      const verifyRes = await apiFetch<AuthOutput>('/auth/webauthn/signup/verify', {
        method: 'POST',
        body: JSON.stringify({ email, response: attResp }),
      });
      setResult(verifyRes);
      if (verifyRes.data) setAccessToken(verifyRes.data.accessToken);
    });
  }

  // Add a passkey to the currently JWT-logged-in user (signup or JWT login first).
  async function handleRegister() {
    await run('register', async () => {
      const optionsRes = await apiFetch<Parameters<typeof startRegistration>[0]['optionsJSON']>(
        '/auth/webauthn/register/options',
        { headers: { Authorization: `Bearer ${accessToken ?? ''}` }, method: 'POST' },
      );
      setResult(optionsRes);
      if (!optionsRes.data) return;

      const attResp = await startRegistration({ optionsJSON: optionsRes.data });
      const verifyRes = await apiFetch<{ message: string }>('/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
        body: JSON.stringify({ response: attResp }),
      });
      setResult(verifyRes);
    });
  }

  async function handleLogin() {
    await run('login', async () => {
      const optionsRes = await apiFetch<Parameters<typeof startAuthentication>[0]['optionsJSON']>(
        '/auth/webauthn/login/options',
        { method: 'POST', body: JSON.stringify({ email }) },
      );
      setResult(optionsRes);
      if (!optionsRes.data) return;

      const assertion = await startAuthentication({ optionsJSON: optionsRes.data });
      const verifyRes = await apiFetch<AuthOutput>('/auth/webauthn/login/verify', {
        method: 'POST',
        body: JSON.stringify({ email, response: assertion }),
      });
      setResult(verifyRes);
      if (verifyRes.data) setAccessToken(verifyRes.data.accessToken);
    });
  }

  async function handleDeleteCredential() {
    await run('delete', async () => {
      const res = await apiFetch<null>('/auth/webauthn/credential', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken ?? ''}` },
      });
      setResult(res);
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">WebAuthn / Passkey</h1>
      <p className="text-sm text-zinc-600">
        One passkey per account — re-registering replaces the existing one. Requires a real
        browser with a platform authenticator (Windows Hello, Touch ID, etc).
      </p>

      <div className="flex flex-col gap-2">
        <input className="border rounded px-2 py-1" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="display name (signup only)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>

      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={handleSignup} loading={loading === 'signup'}>Signup (new account, passkey-only)</ActionButton>
        <ActionButton onClick={handleLogin} loading={loading === 'login'}>Login with passkey</ActionButton>
        <ActionButton onClick={handleRegister} loading={loading === 'register'}>Add/replace passkey (needs JWT above)</ActionButton>
        <ActionButton onClick={handleDeleteCredential} loading={loading === 'delete'}>Delete my passkey</ActionButton>
      </div>

      <div className="text-xs text-zinc-500 break-all">Access token (in-memory only): {accessToken ?? '(none)'}</div>

      <ResponsePanel result={result} />
    </main>
  );
}
