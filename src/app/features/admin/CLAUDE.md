# CLAUDE.md — features/admin/

Admin panel. The `/admin` route requires `adminGuard`. **Done** (refactored June 2026).

## Structure

`admin-layout.component.ts` is a thin **shell** (~63 lines): renders the header + tab
nav and switches between four self-contained tab components. It holds no table/form
logic itself.

```
features/admin/
├── admin-layout.component.ts          ← shell: tab state + coordination only
├── admin.service.ts                   ← AdminService: all admin-only HTTP
└── tabs/
    ├── admin-reservations-tab.component.ts   ← list, search, status filter, confirm/cancel, metrics
    ├── admin-events-tab.component.ts          ← events table; reloads via [refreshKey] input
    ├── admin-reports-tab.component.ts         ← occupancy report + aggregate summary
    └── admin-create-event-tab.component.ts    ← reactive create-event form
```

## How the tabs coordinate (via the shell)

- Each tab loads its own data on init. They do **not** share state.
- **Create → Events refresh:** the shell holds `eventsRefreshKey = signal(0)`. The create
  tab emits `(created)`; the shell bumps the key and switches to the events tab. The events
  tab has a `refreshKey` input + an `effect()` that reloads when it changes.
- The create tab also emits `(cancelled)` → shell switches back to the events tab.
- The events tab emits `(createRequested)` (its "+ New event" button) → shell opens the create tab.

## AdminService

All admin-only HTTP lives here — **never inject `HttpClient` into a tab component**.

```
confirmReservation(id)  → PUT /api/reservations/{id}/confirm  → { reservationCode }
createEvent(req)        → POST /api/events                    → { id }
```

## Admin-only endpoints

```
POST /api/events                         → { id }              create event
PUT  /api/reservations/{id}/confirm      → { reservationCode }
PUT  /api/reservations/{id}/cancel       → 200
GET  /api/events/{id}/report             → occupancy report
GET  /api/reservations                   → returns ALL reservations when caller is admin
```

`GET /api/reservations` already returns all reservations for admins (backend checks
`User.IsInRole("admin")`), so the reservations tab calls the same `ReservationService.myReservations()`.

## Patterns used here

- **Reactive Forms** in the create tab (`fb.nonNullable.group` + `Validators`, incl. a
  cross-field `endAfterStart` validator). Errors show per-field when `dirty || touched`.
- **Errors:** confirm/cancel failures use `ToastService` (toast); the create form uses an
  inline red banner signal. Message via `apiErrorMessage(err, fallback)` from `core/http-error.ts`.
- **Delayed nav/reset** uses `timer(ms).pipe(takeUntilDestroyed(destroyRef))`, never `setTimeout`.
- **Pagination** uses `<app-paginator>` (client-side, 8 rows/page; admin volume is low).

## Create event — form fields

```ts
{
  title: string
  description: string
  type: 'Conference' | 'Workshop' | 'Concert'
  venueId: 1 | 2 | 3            // Central Auditorium / North Hall / South Arena
  maxCapacity: number          // >= 1
  ticketPrice: number          // >= 0
  startDateTime: string        // datetime-local → converted to ISO UTC on submit
  endDateTime: string          // must be after start (endAfterStart validator)
}
```

## Dashboard layout

Header tabs: **Reservations** | **Events** | **Reports** | **+ Create event**
Reservations metrics: Confirmed · Pending payment · Cancelled · Total reservations
