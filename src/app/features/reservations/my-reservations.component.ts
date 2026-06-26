import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReservationService } from './reservation.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { apiErrorMessage } from '../../core/http-error';
import { Reservation } from '../../core/models/reservation.model';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner.component';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [RouterLink, DatePipe, BadgeComponent, SpinnerComponent],
  template: `
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div class="mx-auto flex max-w-5xl items-center justify-between">
        <h1 class="text-xl font-bold text-white">My reservations</h1>
        <div class="flex items-center gap-4">
          <a routerLink="/" class="text-sm text-slate-400 hover:text-white">← Events</a>
          <button (click)="auth.logout()" class="text-sm text-slate-400 hover:text-white">
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-8">
      @if (loading()) {
        <app-spinner />
      } @else if (error()) {
        <div class="rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-400">
          {{ error() }}
        </div>
      } @else if (reservations().length === 0) {
        <div class="py-20 text-center">
          <p class="text-slate-400">You have no reservations yet.</p>
          <a routerLink="/" class="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            View events
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
                <th class="px-5 py-3 font-medium">Event</th>
                <th class="px-5 py-3 font-medium">Reserved on</th>
                <th class="px-5 py-3 font-medium">Qty</th>
                <th class="px-5 py-3 font-medium">Status</th>
                <th class="px-5 py-3 font-medium">Code</th>
                <th class="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              @for (r of reservations(); track r.id) {
                <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                  <td class="px-5 py-4 font-medium text-white">{{ r.eventTitle }}</td>
                  <td class="px-5 py-4 text-slate-400">{{ r.creationDate | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-5 py-4 text-slate-300">{{ r.quantity }}</td>
                  <td class="px-5 py-4">
                    <app-badge [label]="r.status" />
                  </td>
                  <td class="px-5 py-4">
                    @if (r.reservationCode) {
                      <span class="inline-flex items-center gap-1.5 rounded-md bg-emerald-950 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-400 ring-1 ring-emerald-800">
                        🎟️ {{ r.reservationCode }}
                      </span>
                    } @else {
                      <span class="text-slate-600">—</span>
                    }
                  </td>
                  <td class="px-5 py-4">
                    @if (r.status === 'Confirmed') {
                      <button
                        (click)="cancel(r)"
                        [disabled]="cancelling() === r.id"
                        class="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50 transition-colors"
                      >
                        {{ cancelling() === r.id ? 'Cancelling...' : 'Cancel' }}
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
})
export class MyReservationsComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly toast = inject(ToastService);

  readonly reservations = signal<Reservation[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly cancelling = signal<string | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.reservationService.myReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your reservations.');
        this.loading.set(false);
      },
    });
  }

  cancel(r: Reservation) {
    if (!confirm(`Cancel the reservation for "${r.eventTitle}"?`)) return;

    this.cancelling.set(r.id);
    this.reservationService.cancel(r.id).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.load();
      },
      error: (err) => {
        this.toast.show(apiErrorMessage(err, 'Could not cancel the reservation.'), 'error');
        this.cancelling.set(null);
      },
    });
  }
}
