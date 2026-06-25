import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReservationService } from './reservation.service';
import { AuthService } from '../../core/auth.service';
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
        <h1 class="text-xl font-bold text-white">Mis reservas</h1>
        <div class="flex items-center gap-4">
          <a routerLink="/" class="text-sm text-slate-400 hover:text-white">← Eventos</a>
          <button (click)="auth.logout()" class="text-sm text-slate-400 hover:text-white">
            Cerrar sesión
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
          <p class="text-slate-400">No tienes reservas aún.</p>
          <a routerLink="/" class="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            Ver eventos
          </a>
        </div>
      } @else {
        <div class="overflow-hidden rounded-xl border border-slate-800">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
                <th class="px-5 py-3 font-medium">Evento</th>
                <th class="px-5 py-3 font-medium">Fecha reserva</th>
                <th class="px-5 py-3 font-medium">Cant.</th>
                <th class="px-5 py-3 font-medium">Estado</th>
                <th class="px-5 py-3 font-medium">Código</th>
                <th class="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              @for (r of reservations(); track r.id) {
                <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                  <td class="px-5 py-4 font-medium text-white">{{ r.eventTitle }}</td>
                  <td class="px-5 py-4 text-slate-400">{{ r.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="px-5 py-4 text-slate-300">{{ r.quantity }}</td>
                  <td class="px-5 py-4">
                    <app-badge [label]="r.status" />
                  </td>
                  <td class="px-5 py-4 font-mono text-slate-400">
                    {{ r.reservationCode ?? '—' }}
                  </td>
                  <td class="px-5 py-4">
                    @if (r.status === 'Confirmada') {
                      <button
                        (click)="cancel(r)"
                        [disabled]="cancelling() === r.id"
                        class="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50 transition-colors"
                      >
                        {{ cancelling() === r.id ? 'Cancelando...' : 'Cancelar' }}
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
        this.error.set('No se pudieron cargar tus reservas.');
        this.loading.set(false);
      },
    });
  }

  cancel(r: Reservation) {
    if (!confirm(`¿Cancelar la reserva de "${r.eventTitle}"?`)) return;

    this.cancelling.set(r.id);
    this.reservationService.cancel(r.id).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.load();
      },
      error: (err) => {
        const msg = err?.error?.detail ?? 'No se pudo cancelar la reserva.';
        alert(msg);
        this.cancelling.set(null);
      },
    });
  }
}
