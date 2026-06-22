import Link from 'next/link';

const AUTH_METHODS = [
  { href: '/jwt', label: 'JWT' },
  { href: '/session', label: 'Session' },
  { href: '/oauth', label: 'OAuth' },
  { href: '/two-factor', label: '2FA' },
  { href: '/magic-link', label: 'Magic Link' },
  { href: '/api-key', label: 'API Key' },
  { href: '/webauthn', label: 'WebAuthn / Passkey' },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-2xl font-semibold">nest-nexus auth test harness</h1>
      <ul className="flex flex-col gap-2">
        {AUTH_METHODS.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="text-blue-600 underline hover:text-blue-800">
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
