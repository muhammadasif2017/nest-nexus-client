'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch, type ApiResult } from '@/lib/api-client';
import { ResponsePanel } from '@/components/ResponsePanel';
import { PageShell, ReadoutLine } from '@/components/PageShell';

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
    <PageShell path="auth/magic-link" title="Magic link verification">
      {!token && <p className="text-xs text-[var(--danger)]">No token found in URL.</p>}
      {accessToken && <ReadoutLine label="access token" value={accessToken} />}
      <ResponsePanel result={result} />
    </PageShell>
  );
}

export default function MagicLinkCallbackPage() {
  return (
    <Suspense>
      <MagicLinkCallbackContent />
    </Suspense>
  );
}
