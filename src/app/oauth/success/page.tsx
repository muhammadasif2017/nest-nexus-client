'use client';

import { useEffect, useState } from 'react';

export default function OAuthSuccessPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Fragment isn't sent to the server — read it client-side only, matches backend's
    // choice to put the token there instead of a query param (see oauth.controller.ts).
    const match = window.location.hash.match(/token=([^&]+)/);
    setToken(match ? decodeURIComponent(match[1]) : null);
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-4 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">OAuth callback result</h1>
      {token ? (
        <div className="rounded border border-green-300 bg-green-50 p-4 font-mono text-sm break-all">
          accessToken: {token}
        </div>
      ) : (
        <div className="rounded border border-red-300 bg-red-50 p-4 text-sm">
          No token found in URL fragment — OAuth flow did not complete successfully.
        </div>
      )}
    </main>
  );
}
