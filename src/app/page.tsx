import Link from 'next/link';

const AUTH_METHODS = [
  { href: '/jwt', label: 'jwt' },
  { href: '/session', label: 'session' },
  { href: '/oauth', label: 'oauth' },
  { href: '/two-factor', label: 'two-factor' },
  { href: '/magic-link', label: 'magic-link' },
  { href: '/api-key', label: 'api-key' },
  { href: '/webauthn', label: 'webauthn' },
];

export default function Home() {
  return (
    <main className="flex flex-1 justify-center p-6 sm:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="terminal-frame rounded-md p-6">
          <p className="text-xs text-[var(--fg-dim)]">$ ls ./auth-methods</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--accent)]">
            nest-nexus auth harness<span className="blink-caret" />
          </h1>
          <p className="mt-2 text-xs text-[var(--fg-dim)]">
            select a method to exercise its endpoints directly against the backend.
          </p>

          <ul className="mt-6 flex flex-col gap-1">
            {AUTH_METHODS.map((m, i) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="group flex items-center gap-3 rounded px-3 py-2 text-sm text-[var(--fg)] hover:bg-[var(--bg-input)]"
                >
                  <span className="text-[var(--fg-dim)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[var(--accent)]">&gt;</span>
                  <span className="group-hover:text-[var(--accent)] group-hover:[text-shadow:0_0_12px_var(--accent)]">
                    {m.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
