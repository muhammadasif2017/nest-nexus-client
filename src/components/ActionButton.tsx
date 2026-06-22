export function ActionButton({
  onClick,
  loading,
  children,
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="rounded border border-[var(--accent-soft)] bg-[var(--bg-input)] px-4 py-2 text-xs font-medium uppercase tracking-wide text-[var(--accent)] transition-shadow hover:border-[var(--accent)] hover:shadow-[0_0_16px_-4px_var(--accent)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? 'running…' : `[ ${children} ]`}
    </button>
  );
}
