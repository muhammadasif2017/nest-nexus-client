'use client';

import { useEffect, useState } from 'react';
import { PageShell } from '@/components/PageShell';

export default function OAuthSuccessPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fragment isn't sent to the server — read it client-side only, matches backend's
    // choice to put the token there instead of a query param (see oauth.controller.ts).
    const match = window.location.hash.match(/token=([^&]+)/);
    setToken(match ? decodeURIComponent(match[1]) : null);
  }, []);

  return (
    <PageShell path="oauth/success" title="OAuth callback result">
      {token ? (
        <div
          className="rounded border p-4 text-xs break-all"
          style={{ borderColor: 'var(--accent-soft)', background: 'rgba(77,255,160,0.05)', color: 'var(--fg)' }}
        >
          accessToken: {token}
        </div>
      ) : (
        <div
          className="rounded border p-4 text-xs"
          style={{ borderColor: 'var(--danger-soft)', background: 'rgba(255,93,122,0.06)', color: 'var(--danger)' }}
        >
          No token found in URL fragment — OAuth flow did not complete successfully.
        </div>
      )}
    </PageShell>
  );
}
