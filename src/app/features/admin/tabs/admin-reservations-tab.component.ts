import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../../reservations/reservation.service';
import { AdminService } from '../admin.service';
import { ToastService } from '../../../shared/services/toast.service';
import { apiErrorMessage } from '../../../core/http-error';
import { sortBy, SortDir } from '../../../core/sort';
import { Reservation } from '../../../core/models/reservation.model';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { PaginatorComponent } from '../../../shared/ui/paginator.component';

@Component({
  selector: 'app-admin-reservations-tab',
  standalone: true,
  imports: [FormsModule, DatePipe, BadgeComponent, SpinnerComponent, PaginatorComponent],
  template: `
    <div class="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      @for (m of metrics(); track m.label) {
        <div class="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ m.label }}</p>
          <p class="mt-2 text-2xl font-bold text-white">{{ m.value }}</p>
        </div>
      }
    </div>

    <div class="mb-4 flex flex-wrap gap-3">
      <input
        type="text"
        [ngModel]="search()"
        (ngModelChange)="search.set($event); page.set(0)"
        placeholder="Search by event or code..."
        class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none sm:w-72"
      />
      <select
        [ngModel]="statusFilter()"
        (ngModelChange)="statusFilter.set($event); page.set(0)"
        class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
      >
        <option value="">All statuses</option>
        <option value="PendingPayment">Pending payment</option>
        <option value="Confirmed">Confirmed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    @if (loading()) {
      <app-spinner />
    } @else {
      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('eventTitle')">
                Event <span class="ml-1">{{ sortIndicator('eventTitle') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('quantity')">
                Qty <span class="ml-1">{{ sortIndicator('quantity') }}</span>
              </th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('status')">
                Status <span class="ml-1">{{ sortIndicator('status') }}</span>
              </th>
              <th class="px-4 py-3 font-medium">Code</th>
              <th class="px-4 py-3 font-medium cursor-pointer select-none hover:text-white" (click)="setSort('creationDate')">
                Date <span class="ml-1">{{ sortIndicator('creationDate') }}</span>
              </th>
              <th class="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            @for (r of paged(); track r.id) {
              <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                <td class="px-4 py-3 text-white font-medium">{{ r.eventTitle }}</td>
                <td class="px-4 py-3 text-slate-300">{{ r.quantity }}</td>
                <td class="px-4 py-3"><app-badge [label]="r.status" /></td>
                <td class="px-4 py-3 font-mono text-slate-400">{{ r.reservationCode ?? '—' }}</td>
                <td class="px-4 py-3 text-slate-400">{{ r.creationDate | date:'dd/MM/yy HH:mm' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    @if (r.status === 'PendingPayment') {
                      <button
                        (click)="confirmReservation(r)"
                        [disabled]="processing() === r.id"
                        class="rounded-md bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                      >{{ processing() === r.id ? '...' : 'Confirm' }}</button>
                    }
                    @if (r.status === 'Confirmed') {
                      <button
                        (click)="cancelReservation(r)"
                        [disabled]="processing() === r.id"
                        class="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50"
                      >Cancel</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-4 py-10 text-center text-slate-500">No matching reservations.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-right text-xs text-slate-500">
        {{ filtered().length }} of {{ reservations().length }} reservations
      </p>
      <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="page.set($event)" />
    }
  `,
})
export class AdminReservationsTabComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly adminService = inject(AdminService);
  private readonly toast = inject(ToastService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly processing = signal<string | null>(null);

  readonly search = signal('');
  readonly statusFilter = signal('');

  readonly sortCol = signal<keyof Reservation>('creationDate');
  readonly sortDir = signal<SortDir>('desc');

  private readonly perPage = 8;
  readonly page = signal(0);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const status = this.statusFilter();
    return this.reservations().filter((r) => {
      const matchStatus = !status || r.status === status;
      const matchSearch = !q ||
        r.eventTitle.toLowerCase().includes(q) ||
        (r.reservationCode ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  });

  readonly metrics = computed(() => {
    const rs = this.reservations();
    return [
      { label: 'Confirmed',         value: rs.filter((r) => r.status === 'Confirmed').length },
      { label: 'Pending payment',   value: rs.filter((r) => r.status === 'PendingPayment').length },
      { label: 'Cancelled',         value: rs.filter((r) => r.status === 'Cancelled').length },
      { label: 'Total reservations', value: rs.length },
    ];
  });

  readonly sorted = computed(() =>
    sortBy(this.filtered(), this.sortCol(), this.sortDir()));

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.perPage)));

  readonly paged = computed(() => {
    const start = this.page() * this.perPage;
    return this.sorted().slice(start, start + this.perPage);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reservationService.myReservations().subscribe({
      next: (data) => { this.reservations.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  confirmReservation(r: Reservation) {
    this.processing.set(r.id);
    this.adminService.confirmReservation(r.id).subscribe({
      next: () => { this.processing.set(null); this.load(); },
      error: (err) => {
        this.toast.show(apiErrorMessage(err, 'Failed to confirm.'), 'error');
        this.processing.set(null);
      },
    });
  }

  setSort(col: keyof Reservation) {
    if (this.sortCol() === col) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
    this.page.set(0);
  }

  sortIndicator(col: keyof Reservation): string {
    if (this.sortCol() !== col) return '↕';
    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  cancelReservation(r: Reservation) {
    if (!confirm(`Cancel the reservation for "${r.eventTitle}"?`)) return;
    this.processing.set(r.id);
    this.reservationService.cancel(r.id).subscribe({
      next: () => { this.processing.set(null); this.load(); },
      error: (err) => {
        this.toast.show(apiErrorMessage(err, 'Failed to cancel.'), 'error');
        this.processing.set(null);
      },
    });
  }
}
