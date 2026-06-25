# CLAUDE.md — features/admin/

Admin panel. All routes require `adminGuard`.

## Files

| File | Route | Status |
|---|---|---|
| `admin-layout.component.ts` | `/admin` | Stub (Phase 3) |
| `reservation-management.component.ts` | `/admin/reservations` | Pending Phase 3 |
| `create-event.component.ts` | `/admin/events/new` | Pending Phase 3 |
| `reports.component.ts` | `/admin/reports` | Pending Phase 3 |

## Admin-only endpoints

```
POST /api/events                         → { id }              create event
PUT  /api/reservations/{id}/confirm      → { reservationCode }
PUT  /api/reservations/{id}/cancel       → 204
GET  /api/events/{id}/report             → occupancy report
```

## Pending API change

`GET /api/reservations` currently returns only the logged-in user's reservations.
The admin dashboard needs ALL reservations. The handler must be updated to return
all when the caller has `role: admin` (or a new `GET /api/admin/reservations` endpoint created).
**Do not implement Phase 3 until this backend change is in place.**

## Create event — form fields

```ts
{
  title: string
  description: string
  venueId: 1 | 2 | 3           // Auditorio Central / Sala Norte / Arena Sur
  maxCapacity: number
  startDateTime: string         // ISO UTC with Z
  endDateTime: string           // ISO UTC with Z
  ticketPrice: number
  type: 'Conference' | 'Workshop' | 'Concert'
}
```

## Dashboard layout

Header with tabs: **Events** | **Reservations** | **Reports**
Metrics: Confirmed · Pending · Available · Total Revenue
