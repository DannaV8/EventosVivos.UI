import { Component, OnInit, inject, input, signal, computed, effect, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EventService } from '../../events/event.service';
import { Event } from '../../../core/models/event.model';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { PaginatorComponent } from '../../../shared/ui/paginator.component';

@Component({
  selector: 'app-admin-events-tab',
  standalone: true,
  imports: [DatePipe, BadgeComponent, SpinnerComponent, PaginatorComponent],
  template: `
    @if (loading()) {
      <app-spinner />
    } @else {
      <div class="mb-4 flex justify-end">
        <button
          (click)="createRequested.emit()"
          class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >+ New event</button>
      </div>
      <div class="overflow-hidden rounded-xl border border-slate-800">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
              <th class="px-4 py-3 font-medium">Title</th>
              <th class="px-4 py-3 font-medium">Venue</th>
              <th class="px-4 py-3 font-medium">Start</th>
              <th class="px-4 py-3 font-medium">Price</th>
              <th class="px-4 py-3 font-medium">Capacity</th>
              <th class="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            @for (e of paged(); track e.id) {
              <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                <td class="px-4 py-3 font-medium text-white">{{ e.title }}</td>
                <td class="px-4 py-3 text-slate-400">{{ e.venueName }}</td>
                <td class="px-4 py-3 text-slate-400">{{ e.startDateTime | date:'dd/MM/yy HH:mm' }}</td>
                <td class="px-4 py-3 text-slate-300">&#36;{{ e.ticketPrice }}</td>
                <td class="px-4 py-3 text-slate-400">{{ e.maxCapacity }}</td>
                <td class="px-4 py-3"><app-badge [label]="e.status" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="page.set($event)" />
    }
  `,
})
export class AdminEventsTabComponent implements OnInit {
  private readonly eventService = inject(EventService);

  /** Incrementar este input desde el parent fuerza una recarga (ej: tras crear un evento). */
  readonly refreshKey = input<number>(0);
  readonly createRequested = output<void>();

  readonly events = signal<Event[]>([]);
  readonly loading = signal(true);

  private readonly perPage = 8;
  readonly page = signal(0);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.events().length / this.perPage)));

  readonly paged = computed(() => {
    const start = this.page() * this.perPage;
    return this.events().slice(start, start + this.perPage);
  });

  constructor() {
    effect(() => {
      const _ = this.refreshKey();
      this.load();
    });
  }

  ngOnInit() {
    // La carga inicial ya se dispara desde el effect al leer refreshKey().
  }

  load() {
    this.loading.set(true);
    this.eventService.list({}, 1, 1000).subscribe({
      next: (data) => { this.events.set(data.items); this.page.set(0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
