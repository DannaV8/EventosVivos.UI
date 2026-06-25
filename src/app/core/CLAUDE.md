# CLAUDE.md — core/

Global cross-cutting services. No UI of its own.
Do not import anything from `features/` here.

## Files

| File | What it does |
|---|---|
| `auth.service.ts` | Auth state via signals. Login, register, logout. Decodes JWT. |
| `auth.interceptor.ts` | Adds `Bearer` token to every request. On 401 → logout + redirect to `/login`. |
| `guards/auth.guard.ts` | Requires authenticated user. Redirects to `/login?returnUrl=...` if not. |
| `guards/admin.guard.ts` | Requires `isAdmin()`. Redirects to `/` if not. |
| `models/event.model.ts` | Interfaces `Event`, `EventFilter`, type/status/venue enums. |
| `models/reservation.model.ts` | Interfaces `Reservation`, `CreateReservationRequest`. |

## AuthService — available signals

```ts
token: Signal<string | null>
isAuthenticated: Signal<boolean>
role: Signal<'admin' | 'user' | null>
isAdmin: Signal<boolean>
userId: Signal<string | null>
```

## Rules

- Token is stored/read from `localStorage` with key `'token'`.
- JWT payload decoded with `atob(token.split('.')[1])`. Claims: `sub` (userId), `email`, `role`.
- Never import anything from `features/` from here.
