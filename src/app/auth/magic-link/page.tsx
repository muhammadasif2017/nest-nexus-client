'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';

interface AuthOutput {
  accessToken: string;
}

// Matches the link backend emails: `${clientOrigin}/auth/magic-link?token=...`
// (see magic-link.service.ts) — distinct from the manual test page at /magic-link.
function MagicLinkCallbackContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult<unknown> | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<AuthOutput>(`/auth/magic-link/verify?token=${encodeURIComponent(token)}`).then((res) => {
      setResult(res);
      if (res.data) setAccessToken(res.data.accessToken);
    });
  }, [token]);

  return (
    <main className="flex flex-1 flex-col gap-4 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">Magic link verification</h1>
      {!token && <p className="text-sm text-red-700">No token found in URL.</p>}
      {accessToken && (
        <div className="text-xs text-zinc-500 break-all">Access token: {accessToken}</div>
      )}
      <ResponsePanel result={result} />
    </main>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense>
      <MagicLinkCallbackContent />
    </Suspense>
  );
}
