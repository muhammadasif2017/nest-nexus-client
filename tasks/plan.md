# Implementation Plan: nest-nexus-client

## Overview
One page per nest-nexus auth method, sharing a fetch wrapper + raw-response
viewer. No automated tests (per SPEC.md) — verify via build + manual exercise
against running nest-nexus backend on :3000.

## Task List

### Phase 1: Foundation
- [x] Task 1: Scaffold project (done — Next.js TS+Tailwind, App Router, src/)
- [x] Task 2: `lib/api-client.ts` typed fetch wrapper + `.env.local.example`
- [x] Task 3: `ResponsePanel` + `ActionButton` shared components, landing page nav to 7 routes

### Checkpoint: Foundation
- [x] `npm run build` succeeds
- [ ] `npm run dev` serves landing page on :3001 with 7 links (manual check pending)

### Phase 2: Core auth slices
- [x] Task 4: JWT page — register/login/refresh/logout/me/device-sessions
- [x] Task 5: Session page — login/logout, CSRF header wiring (required adding GET /auth/session/csrf-token to nest-nexus backend, see fix/session-csrf-token-endpoint branch)
- [x] Task 6: WebAuthn page — signup (passkey-only), login, register/replace passkey (needs Task 4 for JWT), delete credential

### Phase 3: Remaining methods
- [x] Task 7: OAuth page — 3 provider redirect buttons + /oauth/success callback page reading token from URL fragment
- [x] Task 8: 2FA page — login, setup (QR), enable, verify pending-scope token, disable (needs Task 4)
- [ ] Task 9: Magic link page — request + verify
- [ ] Task 10: API key page — create/list/revoke/test (needs Task 4)

### Checkpoint: Complete
- [ ] All 7 pages functional against local nest-nexus
- [ ] Each shows golden path + one error case
- [ ] `npm run build` clean

## Risks
- Backend `CLIENT_ORIGIN` must be `http://localhost:3001` or every request CORS-blocks. User action, out of scope here.
- OAuth provider creds must be configured backend-side for Task 7 to do anything beyond redirect.
