import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { ReservationService } from '../reservations/reservation.service';
import { EventService } from '../events/event.service';
import { Reservation } from '../../core/models/reservation.model';
import { Event, VENUE_MAP } from '../../core/models/event.model';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { environment } from '../../../environments/environment';

type Tab = 'reservations' | 'events' | 'create';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, BadgeComponent, SpinnerComponent],
  template: `
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <div class="flex items-center gap-6">
          <h1 class="text-xl font-bold text-white">EventosVivos <span class="text-indigo-400">Admin</span></h1>
          <nav class="flex gap-1">
            @for (t of tabs; track t.id) {
              <button
                (click)="tab.set(t.id)"
                [class]="tab() === t.id
                  ? 'rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white'
                  : 'rounded-md px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-white'"
              >{{ t.label }}</button>
            }
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <a routerLink="/" class="text-sm text-slate-400 hover:text-white">Ver sitio</a>
          <button (click)="auth.logout()" class="text-sm text-slate-400 hover:text-white">Salir</button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">

      @if (tab() === 'reservations') {
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
            [(ngModel)]="search"
            placeholder="Buscar por comprador o código..."
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none w-72"
          />
          <select
            [(ngModel)]="statusFilter"
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="PendientePago">Pendiente de pago</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>

        @if (loadingReservations()) {
          <app-spinner />
        } @else {
          <div class="overflow-hidden rounded-xl border border-slate-800">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
                  <th class="px-4 py-3 font-medium">Evento</th>
                  <th class="px-4 py-3 font-medium">Cant.</th>
                  <th class="px-4 py-3 font-medium">Estado</th>
                  <th class="px-4 py-3 font-medium">Código</th>
                  <th class="px-4 py-3 font-medium">Fecha</th>
                  <th class="px-4 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (r of filteredReservations(); track r.id) {
                  <tr class="border-b border-slate-800 bg-slate-950 hover:bg-slate-900 transition-colors">
                    <td class="px-4 py-3 text-white font-medium">{{ r.eventTitle }}</td>
                    <td class="px-4 py-3 text-slate-300">{{ r.quantity }}</td>
                    <td class="px-4 py-3"><app-badge [label]="r.status" /></td>
                    <td class="px-4 py-3 font-mono text-slate-400">{{ r.reservationCode ?? '—' }}</td>
                    <td class="px-4 py-3 text-slate-400">{{ r.createdAt | date:'dd/MM/yy HH:mm' }}</td>
                    <td class="px-4 py-3">
                      <div class="flex gap-2">
                        @if (r.status === 'PendientePago') {
                          <button
                            (click)="confirm(r)"
                            [disabled]="processing() === r.id"
                            class="rounded-md bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {{ processing() === r.id ? '...' : 'Confirmar' }}
                          </button>
                        }
                        @if (r.status !== 'Cancelada') {
                          <button
                            (click)="cancel(r)"
                            [disabled]="processing() === r.id"
                            class="rounded-md border border-red-800 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-950 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-10 text-center text-slate-500">
                      No hay reservas que coincidan.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-right text-xs text-slate-500">
            {{ filteredReservations().length }} de {{ reservations().length }} reservas
          </p>
        }
      }

      @if (tab() === 'events') {
        @if (loadingEvents()) {
          <app-spinner />
        } @else {
          <div class="mb-4 flex justify-end">
            <button
              (click)="tab.set('create')"
              class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              + Nuevo evento
            </button>
          </div>
          <div class="overflow-hidden rounded-xl border border-slate-800">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-slate-800 bg-slate-900 text-left text-slate-400">
                  <th class="px-4 py-3 font-medium">Título</th>
                  <th class="px-4 py-3 font-medium">Venue</th>
                  <th class="px-4 py-3 font-medium">Inicio</th>
                  <th class="px-4 py-3 font-medium">Precio</th>
                  <th class="px-4 py-3 font-medium">Capacidad</th>
                  <th class="px-4 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (e of events(); track e.id) {
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
        }
      }

      @if (tab() === 'create') {
        <div class="mx-auto max-w-xl">
          <h2 class="mb-6 text-lg font-semibold text-white">Nuevo evento</h2>

          @if (createError()) {
            <div class="mb-4 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">{{ createError() }}</div>
          }
          @if (createSuccess()) {
            <div class="mb-4 rounded-lg border border-emerald-900 bg-emerald-950 p-3 text-sm text-emerald-400">
              ¡Evento creado! Volviendo a la lista...
            </div>
          }

          <form (ngSubmit)="createEvent()" class="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-300">Título</label>
              <input type="text" [(ngModel)]="newEvent.title" name="title" required
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="text-sm font-medium text-slate-300">Descripción</label>
              <textarea [(ngModel)]="newEvent.description" name="description" rows="3" required
                class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Tipo</label>
                <select [(ngModel)]="newEvent.type" name="type"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none">
                  <option value="Conferencia">Conferencia</option>
                  <option value="Taller">Taller</option>
                  <option value="Concierto">Concierto</option>
                </select>
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Venue</label>
                <select [(ngModel)]="newEvent.venueId" name="venueId"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none">
                  <option [value]="1">Auditorio Central</option>
                  <option [value]="2">Sala Norte</option>
                  <option [value]="3">Arena Sur</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Capacidad máxima</label>
                <input type="number" [(ngModel)]="newEvent.maxCapacity" name="maxCapacity" min="1" required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Precio (&#36;)</label>
                <input type="number" [(ngModel)]="newEvent.ticketPrice" name="ticketPrice" min="0" step="0.01" required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Inicio (local)</label>
                <input type="datetime-local" [(ngModel)]="newEvent.startDateTime" name="startDateTime" required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Fin (local)</label>
                <input type="datetime-local" [(ngModel)]="newEvent.endDateTime" name="endDateTime" required
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" [disabled]="creating() || createSuccess()"
                class="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                {{ creating() ? 'Creando...' : 'Crear evento' }}
              </button>
              <button type="button" (click)="tab.set('events')"
                class="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-600">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      }
    </main>
  `,
})
export class AdminLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly reservationService = inject(ReservationService);
  private readonly eventService = inject(EventService);
  private readonly http = inject(HttpClient);

  readonly tab = signal<Tab>('reservations');
  readonly tabs = [
    { id: 'reservations' as Tab, label: 'Reservas' },
    { id: 'events' as Tab, label: 'Eventos' },
    { id: 'create' as Tab, label: '+ Crear evento' },
  ];

  // Reservations
  readonly reservations = signal<Reservation[]>([]);
  readonly loadingReservations = signal(true);
  readonly processing = signal<string | null>(null);
  search = '';
  statusFilter = '';

  readonly filteredReservations = computed(() => {
    const q = this.search.toLowerCase();
    return this.reservations().filter((r) => {
      const matchStatus = !this.statusFilter || r.status === this.statusFilter;
      const matchSearch = !q ||
        r.eventTitle.toLowerCase().includes(q) ||
        (r.reservationCode ?? '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  });

  readonly metrics = computed(() => {
    const rs = this.reservations();
    const confirmed = rs.filter((r) => r.status === 'Confirmada').length;
    const pending = rs.filter((r) => r.status === 'PendientePago').length;
    const cancelled = rs.filter((r) => r.status === 'Cancelada').length;
    return [
      { label: 'Confirmadas', value: confirmed },
      { label: 'Pendientes pago', value: pending },
      { label: 'Canceladas', value: cancelled },
      { label: 'Total reservas', value: rs.length },
    ];
  });

  // Events
  readonly events = signal<Event[]>([]);
  readonly loadingEvents = signal(false);

  // Create event
  readonly creating = signal(false);
  readonly createError = signal<string | null>(null);
  readonly createSuccess = signal(false);
  newEvent = this.emptyEvent();

  ngOnInit() {
    this.loadReservations();
    this.loadEvents();
  }

  loadReservations() {
    this.loadingReservations.set(true);
    this.reservationService.myReservations().subscribe({
      next: (data) => { this.reservations.set(data); this.loadingReservations.set(false); },
      error: () => this.loadingReservations.set(false),
    });
  }

  loadEvents() {
    this.loadingEvents.set(true);
    this.eventService.list().subscribe({
      next: (data) => { this.events.set(data); this.loadingEvents.set(false); },
      error: () => this.loadingEvents.set(false),
    });
  }

  confirm(r: Reservation) {
    this.processing.set(r.id);
    this.http.put<{ reservationCode: string }>(`${environment.apiBase}/reservations/${r.id}/confirm`, {}).subscribe({
      next: () => { this.processing.set(null); this.loadReservations(); },
      error: (err) => {
        alert(err?.error?.detail ?? 'Error al confirmar.');
        this.processing.set(null);
      },
    });
  }

  cancel(r: Reservation) {
    if (!confirm(`¿Cancelar reserva de "${r.eventTitle}"?`)) return;
    this.processing.set(r.id);
    this.reservationService.cancel(r.id).subscribe({
      next: () => { this.processing.set(null); this.loadReservations(); },
      error: (err) => {
        alert(err?.error?.detail ?? 'Error al cancelar.');
        this.processing.set(null);
      },
    });
  }

  createEvent() {
    this.creating.set(true);
    this.createError.set(null);

    const body = {
      title: this.newEvent.title,
      description: this.newEvent.description,
      type: this.newEvent.type,
      venueId: +this.newEvent.venueId,
      maxCapacity: +this.newEvent.maxCapacity,
      ticketPrice: +this.newEvent.ticketPrice,
      startDateTime: new Date(this.newEvent.startDateTime).toISOString(),
      endDateTime: new Date(this.newEvent.endDateTime).toISOString(),
    };

    this.http.post<{ id: string }>(`${environment.apiBase}/events`, body).subscribe({
      next: () => {
        this.createSuccess.set(true);
        this.creating.set(false);
        setTimeout(() => {
          this.createSuccess.set(false);
          this.newEvent = this.emptyEvent();
          this.loadEvents();
          this.tab.set('events');
        }, 1500);
      },
      error: (err) => {
        this.createError.set(err?.error?.detail ?? err?.error?.title ?? 'Error al crear el evento.');
        this.creating.set(false);
      },
    });
  }

  private emptyEvent() {
    return {
      title: '', description: '', type: 'Conferencia',
      venueId: 1, maxCapacity: 100, ticketPrice: 0,
      startDateTime: '', endDateTime: ''
    };
  }
}
