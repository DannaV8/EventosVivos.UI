# CLAUDE.md — shared/

Reusable UI components. No business logic or HTTP calls.

## Components

| Component | Selector | Usage |
|---|---|---|
| `ui/badge.component.ts` | `<app-badge>` | Type/status badge. Input: `label` (string). Auto-colors by value. |
| `ui/spinner.component.ts` | `<app-spinner>` | Centered loading spinner. No inputs. |
| `ui/toast.component.ts` | `<app-toast>` | Toast notifications. Driven by `ToastService`. |

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
