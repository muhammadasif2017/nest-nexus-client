import Link from 'next/link';

export function PageShell({
  path,
  title,
  description,
  children,
}: {
  path: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 justify-center p-6 sm:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center gap-2 text-xs text-[var(--fg-dim)]">
          <Link href="/" className="hover:text-[var(--accent)]">~</Link>
          <span>/</span>
          <span className="text-[var(--accent)]">{path}</span>
        </div>

        <div className="terminal-frame rounded-md p-6">
          <h1 className="text-lg font-bold tracking-tight text-[var(--fg)]">
            <span className="text-[var(--accent)]">$</span> {title}
          </h1>
          {description && <p className="mt-2 text-xs leading-relaxed text-[var(--fg-dim)]">{description}</p>}

          <div className="mt-6 flex flex-col gap-6">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--fg-dim)]">{label}</span>
      <div className="flex items-center gap-2 rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_1px_var(--accent)]">
        <span className="text-[var(--accent)]">&gt;</span>
        <input
          {...props}
          className="w-full bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-dim)]"
        />
      </div>
    </label>
  );
}

export function ReadoutLine({ label, value, flag }: { label: string; value: string; flag?: string }) {
  return (
    <div className="rounded border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-xs">
      <span className="text-[var(--fg-dim)]">{label}: </span>
      <span className="break-all text-[var(--fg)]">{value}</span>
      {flag && <span className="ml-2 text-[var(--warn)]">[{flag}]</span>}
    </div>
  );
}
