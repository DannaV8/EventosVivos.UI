# CLAUDE.md — features/auth/

Login and registration. Both routes are public (no guard).

## Files

| File | Route | What it does |
|---|---|---|
| `login.component.ts` | `/login` | Email + password form → `authService.login()` → redirects to `returnUrl` or `/` |
| `register.component.ts` | `/register` | Email + password form → `authService.register()` → redirects to `/login` |

## Login flow

1. User arrives at `/login?returnUrl=my-reservations`
2. Submits credentials → POST `/api/auth/login` → receives `{ token }`
3. `AuthService` saves token in `localStorage` and updates the signal
4. Router navigates to `returnUrl` (or `/` if none)

## Registration flow

1. Only asks for email and password (never role — backend always assigns `"user"`)
2. POST `/api/auth/register` → `{ id }`
3. Shows success message → redirects to `/login` after 1.5s

## Error handling

Read `err.error.detail` first (API error format), then `err.error.title`, then a generic message.

API error codes:
- `INVALID_CREDENTIALS` → 401
- `EMAIL_IN_USE` → 409 (on registration)
- Validation failed → 400 with `errors` object
