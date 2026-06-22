import { PageShell } from '@/components/PageShell';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROVIDERS = [
  { path: '/google', label: 'continue with google' },
  { path: '/github', label: 'continue with github' },
  { path: '/microsoft', label: 'continue with microsoft' },
];

export default function OAuthPage() {
  return (
    <PageShell
      path="oauth"
      title="OAuth"
      description="Full page redirect required — provider creds must be configured on the nest-nexus backend, otherwise the provider rejects the request before you see this app again."
    >
      <div className="flex flex-col gap-2">
        {PROVIDERS.map((p) => (
          <a
            key={p.path}
            href={`${API_URL}${p.path}`}
            className="rounded border border-[var(--accent-soft)] bg-[var(--bg-input)] px-4 py-2 text-center text-xs uppercase tracking-wide text-[var(--accent)] transition-shadow hover:border-[var(--accent)] hover:shadow-[0_0_16px_-4px_var(--accent)]"
          >
            [ {p.label} ]
          </a>
        ))}
      </div>
    </PageShell>
  );
}
