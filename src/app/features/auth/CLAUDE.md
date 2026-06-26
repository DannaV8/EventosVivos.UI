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
   (via `timer(1500).pipe(takeUntilDestroyed(destroyRef))`, not `setTimeout`)

## Forms

Both use **Reactive Forms** (`fb.nonNullable.group` + `Validators`):
- email: `required` + `email`; password: `required` (login) / `required` + `minLength(8)` (register)
- Submit is disabled while `form.invalid`; `submit()` calls `markAllAsTouched()` if invalid.
- Per-field errors render when the control is `invalid && (dirty || touched)` — see the `invalid(name)` helper.

## Error handling

Use `apiErrorMessage(err, fallback)` from `core/http-error.ts` (it reads
`detail ?? message ?? title ?? fallback`). Show it via the inline red banner signal.

API error codes:
- `INVALID_CREDENTIALS` → 401
- `EMAIL_IN_USE` → 409 (on registration)
- Validation failed → 400 with `errors` object
