import type { ApiResult } from '@/lib/api-client';

export function ResponsePanel<T>({ result }: { result: ApiResult<T> | null }) {
  if (!result) return null;

  const ok = result.status >= 200 && result.status < 300;

  return (
    <div className={`mt-4 rounded border p-4 font-mono text-sm ${ok ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
      <div className="font-semibold">Status: {result.status}</div>
      {result.error && <div className="mt-1 text-red-700">Error: {result.error}</div>}
      {result.data !== null && (
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{JSON.stringify(result.data, null, 2)}</pre>
      )}
    </div>
  );
}
