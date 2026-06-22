# nest-nexus-client

Frontend test harness for the [nest-nexus](../nest-nexus) backend. One page per auth
method, each showing the raw request/response.

## Setup

1. `npm install`
2. `cp env.example .env.local` and adjust `NEXT_PUBLIC_API_URL` if your backend
   isn't on `http://localhost:3000/api/v1`.
3. On the backend (nest-nexus), set `CLIENT_ORIGIN=http://localhost:3001` in
   `.env` — required for CORS, since this app runs on a different port.
4. `npm run dev` — serves on `http://localhost:3001`.

Backend must be running (`npm run start:dev` in nest-nexus) before testing.

## Pages

| Route | Auth method |
|---|---|
| `/jwt` | JWT |
| `/session` | Session |
| `/webauthn` | WebAuthn/Passkey |
| `/oauth` | OAuth |
| `/two-factor` | 2FA (TOTP) |
| `/magic-link` | Magic link (send + manual token paste) |
| `/auth/magic-link` | Magic link callback (auto-verifies `?token=` from the emailed link) |
| `/api-key` | API key |

## Testing

Manual only — no automated test suite. Exercise the golden path + at least one
error case per page against a running backend.
