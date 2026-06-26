# CLAUDE.md — EventosVivos UI (Angular + Tailwind)

SPA for cultural event reservations. Consumes the REST API at `https://localhost:62323/api`
(configured in `src/environments/environment.ts`). No SSR. Angular standalone components,
signals, `@if`/`@for`, `inject()`, Reactive Forms.

## Structure

```
src/app/
├── core/             ← auth service, interceptor, guards, models  →  core/CLAUDE.md
├── shared/           ← reusable UI components                      →  shared/CLAUDE.md
├── features/
│   ├── events/       ← public event list + detail
│   ├── reservations/ ← create reservation + my-reservations
│   ├── auth/         ← login + register                            →  features/auth/CLAUDE.md
│   └── admin/        ← admin dashboard                             →  features/admin/CLAUDE.md
└── app.routes.ts     ← routes + guards
```

Before editing any file, identify the feature and read its CLAUDE.md.

## Roles & access flow

| Role | Can |
|---|---|
| Anonymous | View event list only. |
| User | Reserve, view own reservations, cancel own reservations. |
| Admin | All of the above + create events, confirm payments, view all reservations. |

Anonymous clicking "Reserve" → redirected to `/login` with `returnUrl`. Returns after auth.

## Routes

```
/                    → event list (public)
/login               → login
/register            → registration
/my-reservations     → [authGuard]
/book/:eventId       → [authGuard]
/admin               → [adminGuard]
```

## Implementation status

- [x] Phase 1: core + auth + public event list (paginated, server-side)
- [x] Phase 2: reservations (create, my-reservations, cancel)
- [x] Phase 3: admin dashboard (reservations, events, reports, create-event tabs)

Refactored June 2026 — see the per-area CLAUDE.md files for the patterns below.

## Architecture principles

**Single Responsibility — components only render, services own logic.**
- Computed values (e.g. available tickets) belong in the service, not the component.
- Components read from signals/services and dispatch actions. Nothing else.
- If a method could live in a service, it must live in a service.

**No JWT parsing outside AuthService.**
- `AuthService` exposes `userId`, `email`, `role`, `isAdmin` as computed signals.
- Components and other services consume those signals directly — never decode the token themselves.

**No duplicated domain logic.**
- `availableTickets(event)` lives in `EventService`. Any component that needs it calls the service.
- If two components need the same derived value, it goes in the service, not both components.

**Template inline is fine for small/medium components** (Angular 17+ standard).
Extract to a separate `.html` file only when the template exceeds ~100 lines and becomes hard to read.
A large multi-purpose screen should be split into sub-components rather than growing one file
(see `features/admin/` — a shell + one component per tab).

**Reactive Forms everywhere** (not template-driven `[(ngModel)]`).
`fb.nonNullable.group` + `Validators`; per-field errors shown when `dirty || touched`;
`getRawValue()` on submit. Use an `invalid(name)` helper for the touched-and-invalid check.

**Errors: one helper, two surfaces.**
- Message extraction: `apiErrorMessage(err, fallback)` from `core/http-error.ts`. Never inline `err?.error?.detail`.
- Surface: actions (confirm/cancel/etc.) → `ToastService`; forms → inline red banner signal. No native `alert()`.

**Delayed navigation:** `timer(ms).pipe(takeUntilDestroyed(destroyRef))`, never `setTimeout`.

**Pagination:** the shared `<app-paginator>` (zero-based). Public event list paginates server-side; admin tables paginate client-side (low volume).

**Presentational/shared components are `OnPush`** and signal-driven.

**Fetch one event with `EventService.getById(id)`** (`GET /api/events/{id}`), never by loading the full list.

## Hard rules

- Never send `userId` or `role` in request bodies — the backend reads them from JWT.
- All dates in UTC. `type`/`status` arrive as text in GET responses.
- No business logic in the frontend — only presentation and API orchestration.
- Token stored in `localStorage`; interceptor injects it. Never hardcode in services.
- Never parse the JWT outside `AuthService`.
