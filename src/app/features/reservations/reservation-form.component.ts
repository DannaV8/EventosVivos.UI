import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { EventService } from '../events/event.service';
import { ReservationService } from './reservation.service';
import { ToastService } from '../../shared/services/toast.service';
import { Event } from '../../core/models/event.model';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [FormsModule, RouterLink, SpinnerComponent, BadgeComponent, DatePipe, DecimalPipe],
  template: `
    <div class="min-h-screen bg-slate-950 px-4 py-10">
      <div class="mx-auto max-w-lg">
        <a routerLink="/" class="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          ← Volver a eventos
        </a>

        @if (loadingEvent()) {
          <app-spinner />
        } @else if (!event()) {
          <div class="rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-400">
            Evento no encontrado.
          </div>
        } @else {
          <div class="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div class="flex flex-wrap gap-2 mb-3">
              <app-badge [label]="event()!.type" />
              <app-badge [label]="event()!.status" />
            </div>
            <h2 class="text-lg font-semibold text-white">{{ event()!.title }}</h2>
            <p class="mt-1 text-sm text-slate-400">📍 {{ event()!.venueName }}</p>
            <p class="text-sm text-slate-400">📅 {{ event()!.startDateTime | date:'dd/MM/yyyy HH:mm' }} UTC</p>
            <p class="mt-2 text-sm font-medium text-indigo-400">&#36;{{ event()!.ticketPrice }} por entrada</p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 class="mb-5 text-base font-semibold text-white">Completa tu reserva</h3>

            @if (errorMsg()) {
              <div class="mb-4 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">
                {{ errorMsg() }}
              </div>
            }

            <form (ngSubmit)="submit()" class="space-y-4">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Nombre completo</label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Tu nombre"
                />
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Cantidad de entradas</label>
                <input
                  type="number"
                  [(ngModel)]="quantity"
                  name="quantity"
                  required
                  min="1"
                  max="10"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
                <p class="text-xs text-slate-500">
                  Disponibles: {{ eventService.availableTickets(event()!) }} | Total: &#36;{{ (event()!.ticketPrice * quantity) | number:'1.2-2' }}
                </p>
              </div>

              <button
                type="submit"
                [disabled]="loading() || success()"
                class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading() ? 'Reservando...' : 'Confirmar reserva' }}
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReservationFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly eventService = inject(EventService);
  private readonly reservationService = inject(ReservationService);
  private readonly toast = inject(ToastService);

  readonly event = signal<Event | null>(null);
  readonly loadingEvent = signal(true);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly success = signal(false);

  name = '';
  email = '';
  quantity = 1;

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.eventService.list().subscribe({
      next: (events) => {
        this.event.set(events.find((e) => e.id === eventId) ?? null);
        this.loadingEvent.set(false);
        this.email = this.auth.email() ?? '';
      },
      error: () => this.loadingEvent.set(false),
    });
  }

  submit() {
    if (!this.name || !this.email || this.quantity < 1) return;
    const eventId = this.route.snapshot.paramMap.get('eventId')!;

    this.loading.set(true);
    this.errorMsg.set(null);

    this.reservationService.create({
      eventId,
      quantity: this.quantity,
      buyerName: this.name,
      buyerEmail: this.email,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.show(
          '¡Reserva creada! Tu reserva está pendiente de confirmación de pago.',
          'success',
          5000
        );
        setTimeout(() => this.router.navigate(['/my-reservations']), 2000);
      },
      error: (err) => {
        const msg = err?.error?.detail ?? err?.error?.title ?? 'Error al crear la reserva.';
        this.errorMsg.set(msg);
        this.toast.show(msg, 'error');
        this.loading.set(false);
      },
    });
  }
}
