export interface ApiResult<T> {
  status: number;
  data: T | null;
  error: string | null;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  return {
    status: res.status,
    data: res.ok ? (body as T) : null,
    error: res.ok ? null : body?.message ?? 'Unknown error',
  };
}

export function getCsrfTokenFromCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}
