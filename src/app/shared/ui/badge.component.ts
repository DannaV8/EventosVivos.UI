import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventType, EventStatus } from '../../core/models/event.model';

type BadgeVariant = EventType | EventStatus | string;

const COLOR_MAP: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  Confirmed: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 ring-red-500/30',
  Completed: 'bg-slate-500/20 text-slate-400 ring-slate-500/30',
  Conference: 'bg-blue-500/20 text-blue-400 ring-blue-500/30',
  Workshop: 'bg-amber-500/20 text-amber-400 ring-amber-500/30',
  Concert: 'bg-purple-500/20 text-purple-400 ring-purple-500/30',
  PendingPayment: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
};

const LABEL_MAP: Record<string, string> = {
  Active: 'Active',
  Cancelled: 'Cancelled',
  Completed: 'Completed',
  Confirmed: 'Confirmed',
  Conference: 'Conference',
  Workshop: 'Workshop',
  Concert: 'Concert',
  PendingPayment: 'Pending payment',
};

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset {{ colorClass() }}">
      {{ displayLabel() }}
    </span>
  `,
})
export class BadgeComponent {
  readonly label = input.required<BadgeVariant>();

  colorClass() {
    return COLOR_MAP[this.label() as string] ?? 'bg-slate-500/20 text-slate-400 ring-slate-500/30';
  }

  displayLabel() {
    return LABEL_MAP[this.label() as string] ?? this.label();
  }
}
