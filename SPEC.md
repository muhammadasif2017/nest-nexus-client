# Spec: nest-nexus-client

## Objective

Frontend test harness for the `nest-nexus` backend. Exercises all 7 auth
mechanisms implemented there (JWT, session, OAuth, 2FA, magic link, API key,
WebAuthn) from a real browser, so implementation correctness and edge cases
are visible client-side, not just via curl/Swagger.

**User**: the engineer building nest-nexus (you), not an end product.
**Success**: every backend auth endpoint has a corresponding UI action and
visibly shows request/response, including error cases (wrong password,
expired token, reused refresh token, no-enumeration responses, etc).

## Tech Stack

- Next.js 15 (App Router), TypeScript
- Tailwind CSS (utility classes, no component library)
- No state management library — local component state + native `fetch`
- No test framework for v1 (manual harness; revisit if this grows)

## Commands

```
Dev:    npm run dev        # localhost:3001
Build:  npm run build
Start:  npm run start
Lint:   npm run lint
```

## Project Structure

```
src/
  app/
    layout.tsx                Root layout, global nav between auth method pages
    page.tsx                  Landing page — links to each auth method page
    jwt/page.tsx               Register / login / refresh / logout / me / device sessions
    session/page.tsx           Session login / logout (CSRF token wiring)
    oauth/page.tsx              Google / GitHub / Microsoft redirect buttons + callback result
    two-factor/page.tsx         Enable 2FA, verify pending-scope token
    magic-link/page.tsx         Request link, verify token (paste from email/log)
    api-key/page.tsx            Create / list / revoke keys, test a protected call with one
    webauthn/page.tsx           Register passkey, login with passkey
  lib/
    api-client.ts              fetch wrapper: base URL, credentials:'include', CSRF header injection
    types.ts                   Response shape types per endpoint (mirrors backend DTOs loosely)
  components/
    ResponsePanel.tsx          Shared raw JSON request/response viewer used on every page
    ActionButton.tsx           Shared submit button w/ loading state
.env.local                     NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

One page per auth method — flat, no nested auth-method folders beyond this.

## Code Style

```typescript
// lib/api-client.ts
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<{
  status: number;
  data: T | null;
  error: string | null;
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, data: res.ok ? body : null, error: res.ok ? null : body?.message ?? 'Unknown error' };
}
```

- Function components, named exports, no default exports for pages' helper components.
- No premature abstraction — each auth page owns its own form state; don't
  build a generic "auth form" component to cover all 7 (shapes differ too much).
- `ResponsePanel` is the one shared abstraction — every page needs to show
  raw status + body, that repetition is real.

## Testing Strategy

Manual only for v1: each page is exercised by hand against a running
nest-nexus backend, golden path + at least one failure path. No Jest/Playwright
setup unless scope grows beyond a debug harness.

## Boundaries

- **Always do**: use `credentials: 'include'` on every request (cookies
  required for session/CSRF); show raw status code + body on every action,
  including errors — hiding failures defeats the harness's purpose.
- **Ask first**: any change to the nest-nexus backend (this repo only
  consumes the API); adding a UI/component library; adding a state manager;
  adding automated tests/CI.
- **Never do**: store JWT access token anywhere but in-memory JS state (no
  localStorage — matches backend's intended client-side handling); commit
  `.env.local`; hardcode the backend URL outside `NEXT_PUBLIC_API_URL`.

## Success Criteria

- All 7 auth pages functional against local nest-nexus instance.
- Each page shows: action buttons matching backend endpoints for that
  method, raw response panel, at least one demonstrated error case.
- WebAuthn register + login works in a real browser on `localhost`.
- OAuth buttons redirect to backend OAuth-init routes and land back showing
  result (provider app registration/credentials are the user's own setup).
- CSRF double-submit header correctly attached on session-auth mutating
  requests (`/auth/session/*`).

## Open Questions

- `CLIENT_ORIGIN` env var on nest-nexus backend needs to be set to
  `http://localhost:3001` for CORS to allow this client — backend-side
  change, needs your action (not making this edit unprompted).
- OAuth provider credentials (Google/GitHub/Microsoft client IDs/secrets) —
  assumed already configured in nest-nexus `.env`; if not, OAuth page will
  show backend errors until that's done.
