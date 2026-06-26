# CLAUDE.md — shared/

Reusable UI components. No business logic or HTTP calls.

## Components

| Component | Selector | Usage |
|---|---|---|
| `ui/badge.component.ts` | `<app-badge>` | Type/status badge. Input: `label` (string). Auto-colors by value. |
| `ui/spinner.component.ts` | `<app-spinner>` | Centered loading spinner. No inputs. |
| `ui/toast.component.ts` | `<app-toast>` | Toast notifications. Driven by `ToastService`. |
| `ui/select-filter.component.ts` | `<app-select-filter>` | Custom dropdown (replaces native `<select>`, which Tailwind can't style on Windows). Inputs: `placeholder`, `options` (`{value,label}[]`), `value`. Output: `valueChange`. ARIA listbox + Escape-to-close. |
| `ui/paginator.component.ts` | `<app-paginator>` | Zero-based pager. Inputs: `page`, `totalPages`. Output: `pageChange`. Self-hides when `totalPages <= 1`. |

All shared components use `ChangeDetectionStrategy.OnPush` (they are pure / signal-driven).

## Services

| Service | Usage |
|---|---|
| `services/toast.service.ts` | `ToastService.show(message, type, durationMs?)` / `dismiss()`. Single active toast via signal. Use for action feedback (confirm/cancel/create). |

## Badge colors

| Value | Color |
|---|---|
| Active / Confirmed | Green (`emerald`) |
| Cancelled | Red (`red`) |
| Completed | Grey (`slate`) |
| Conference | Blue (`blue`) |
| Workshop | Amber (`amber`) |
| Concert | Purple (`purple`) |
| PendingPayment | Yellow (`yellow`) |

## Tailwind conventions

- Dark theme. Base background: `slate-950` / `slate-900`. Borders: `slate-800` / `slate-700`.
- Primary accent: `indigo-600` (buttons, focus rings).
- Primary text: `white`. Secondary text: `slate-400` / `slate-300`.
- Border radius: `rounded-lg` for inputs/buttons, `rounded-xl` for cards/panels.
