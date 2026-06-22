import type { ApiResult } from '@/lib/api-client';

export function ResponsePanel<T>({ result }: { result: ApiResult<T> | null }) {
  if (!result) return null;

  const ok = result.status >= 200 && result.status < 300;

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded border p-4 font-mono text-xs"
      style={{
        borderColor: ok ? 'var(--accent-soft)' : 'var(--danger-soft)',
        background: ok ? 'rgba(77,255,160,0.05)' : 'rgba(255,93,122,0.06)',
        boxShadow: ok ? '0 0 24px -16px var(--accent)' : '0 0 24px -16px var(--danger)',
      }}
    >
      <div className="font-bold" style={{ color: ok ? 'var(--accent)' : 'var(--danger)' }}>
        // status {result.status}
      </div>
      {result.error && <div className="mt-1 text-[var(--danger)]">err: {result.error}</div>}
      {result.data !== null && (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-[var(--fg)]">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
    </div>
  );
}
