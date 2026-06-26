# CLAUDE.md — core/

Global cross-cutting services. No UI of its own.
Do not import anything from `features/` here.

## Files

| File | What it does |
|---|---|
| `auth.service.ts` | Auth state via signals. Login, register, logout. Decodes JWT once. |
| `auth.interceptor.ts` | Adds `Bearer` token to every request. On 401 (only if a token was sent) → logout. |
| `http-error.ts` | `apiErrorMessage(err, fallback)` — extracts a user message from an API error (`detail ?? message ?? title ?? fallback`). |
| `guards/auth.guard.ts` | Requires authenticated user. Redirects to `/login?returnUrl=...` if not. |
| `guards/admin.guard.ts` | Requires `isAdmin()`. Redirects to `/` if not. |
| `models/event.model.ts` | Interfaces `Event`, `EventFilters`, `PagedResult<T>`, `EventOccupancy`, type/status/venue maps. |
| `models/reservation.model.ts` | Interfaces `Reservation`, `CreateReservationRequest`. |

## AuthService — available signals

```ts
token: Signal<string | null>
isAuthenticated: Signal<boolean>
role: Signal<'admin' | 'user' | null>
isAdmin: Signal<boolean>
userId: Signal<string | null>
email: Signal<string | null>
```

The JWT is decoded **once** via a private `payload` computed; `role`/`userId`/`email`
derive from it. Don't add another `atob()` per claim.

## Rules

- Token is stored/read from `localStorage` with key `'token'`.
- JWT payload decoded with `atob(token.split('.')[1])`, **only inside `AuthService`**. Claims: `sub` (userId), `email`, `role`.
- Use `apiErrorMessage()` for any HTTP error message — never inline `err?.error?.detail ?? ...`.
- Never import anything from `features/` from here.
