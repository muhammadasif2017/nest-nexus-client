import type { ApiResult } from '@/lib/api-client';

export function ResponsePanel<T>({ result }: { result: ApiResult<T> | null }) {
  if (!result) return null;

  const ok = result.status >= 200 && result.status < 300;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'min-w-0 overflow-hidden rounded border p-4 font-mono text-xs',
        ok
          ? 'border-[var(--accent-soft)] bg-[rgba(77,255,160,0.05)] shadow-[0_0_24px_-16px_var(--accent)]'
          : 'border-[var(--danger-soft)] bg-[rgba(255,93,122,0.06)] shadow-[0_0_24px_-16px_var(--danger)]',
      ].join(' ')}
    >
      <div className={ok ? 'font-bold text-[var(--accent)]' : 'font-bold text-[var(--danger)]'}>
        // status {result.status}
      </div>
      {result.error && (
        <div className="mt-1 break-words text-[var(--danger)]">err: {result.error}</div>
      )}
      {result.data !== null && (
        <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words text-[var(--fg)]">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
