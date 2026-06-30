import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { EventService } from '../../events/event.service';
import { EventOccupancy } from '../../../core/models/event.model';
import { sortBy, SortDir } from '../../../core/sort';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { PaginatorComponent } from '../../../shared/ui/paginator.component';

@Component({
  selector: 'app-admin-reports-tab',
  standalone: true,
  imports: [BadgeComponent, SpinnerComponent, PaginatorComponent],
  template: `
    @if (loading()) {
      <app-spinner />
    } @else if (reports().length === 0) {
      <div class="py-16 text-center text-slate-500">No events to report.</div>
    } @else {
      <div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p class="text-xs text-slate-500">Tickets sold</p>
          <p class="mt-1 text-2xl font-bold text-white">{{ summary().sold }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p class="text-xs text-slate-500">Available</p>
          <p class="mt-1 text-2xl font-bold text-white">{{ summary().available }}</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p class="text-xs text-slate-500">Average occupancy</p>
          <p class="mt-1 text-2xl font-bold text-white">{{ summary().avgOccupancy }}%</p>
        </div>
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p class="text-xs text-slate-500">Total revenue</p>
          <p class="mt-1 text-2xl font-bold text-emerald-400">&#36;{{ summary().revenue }}</p>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('title')">
                Event <span class="ml-1">{{ sortIndicator('title') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('occupancyPercentage')">
                Occupancy <span class="ml-1">{{ sortIndicator('occupancyPercentage') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('soldTickets')">
                Sold <span class="ml-1">{{ sortIndicator('soldTickets') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('availableTickets')">
                Available <span class="ml-1">{{ sortIndicator('availableTickets') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('totalRevenue')">
                Revenue <span class="ml-1">{{ sortIndicator('totalRevenue') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('status')">
                Status <span class="ml-1">{{ sortIndicator('status') }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (r of paged(); track r.eventId) {
              <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                <td class="px-4 py-3 font-medium text-white">{{ r.title }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                      <div class="h-full rounded-full transition-all" [class]="barColor(r.occupancyPercentage)" [style.width.%]="r.occupancyPercentage"></div>
                    </div>
                    <span class="text-slate-300 tabular-nums">{{ r.occupancyPercentage }}%</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-300">{{ r.soldTickets }}</td>
                <td class="px-4 py-3 text-slate-400">{{ r.availableTickets }}</td>
                <td class="px-4 py-3 text-emerald-400">&#36;{{ r.totalRevenue }}</td>
                <td class="px-4 py-3"><app-badge [label]="r.status" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="page.set($event)" />
    }
  `,
})
export class AdminReportsTabComponent implements OnInit {
  private readonly eventService = inject(EventService);

  readonly reports = signal<EventOccupancy[]>([]);
  readonly loading = signal(true);

  readonly sortCol = signal<keyof EventOccupancy>('occupancyPercentage');
  readonly sortDir = signal<SortDir>('desc');

  private readonly perPage = 8;
  readonly page = signal(0);

  readonly sorted = computed(() => sortBy(this.reports(), this.sortCol(), this.sortDir()));

  readonly summary = computed(() => {
    const rs = this.reports();
    const sold = rs.reduce((acc, r) => acc + r.soldTickets, 0);
    const available = rs.reduce((acc, r) => acc + r.availableTickets, 0);
    const revenue = rs.reduce((acc, r) => acc + r.totalRevenue, 0);
    const avgOccupancy = rs.length
      ? Math.round(rs.reduce((acc, r) => acc + r.occupancyPercentage, 0) / rs.length)
      : 0;
    return { sold, available, revenue, avgOccupancy };
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.reports().length / this.perPage)));

  readonly paged = computed(() => {
    const start = this.page() * this.perPage;
    return this.sorted().slice(start, start + this.perPage);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.eventService.listReports().subscribe({
      next: (data) => { this.reports.set(data); this.page.set(0); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  setSort(col: keyof EventOccupancy) {
    if (this.sortCol() === col) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
    this.page.set(0);
  }

  sortIndicator(col: keyof EventOccupancy): string {
    if (this.sortCol() !== col) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  barColor(pct: number): string {
    if (pct >= 80) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-amber-500';
    return 'bg-indigo-500';
  }
}
