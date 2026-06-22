const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROVIDERS = [
  { path: '/google', label: 'Continue with Google' },
  { path: '/github', label: 'Continue with GitHub' },
  { path: '/microsoft', label: 'Continue with Microsoft' },
];

export default function OAuthPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-8 max-w-2xl">
      <h1 className="text-xl font-semibold">OAuth</h1>
      <p className="text-sm text-zinc-600">
        Full page redirect required — provider creds must be configured on the nest-nexus
        backend, otherwise the provider rejects the request before you see this app again.
      </p>
      <div className="flex flex-col gap-2">
        {PROVIDERS.map((p) => (
          <a
            key={p.path}
            href={`${API_URL}${p.path}`}
            className="rounded bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-zinc-700"
          >
            {p.label}
          </a>
        ))}
      </div>
    </main>
  );
}
