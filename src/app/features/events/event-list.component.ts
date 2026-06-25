import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { EventService } from './event.service';
import { Event, EventFilters, VENUE_MAP } from '../../core/models/event.model';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [FormsModule, RouterLink, BadgeComponent, SpinnerComponent, DatePipe],
  template: `
    <header class="border-b border-slate-800 bg-slate-900 px-6 py-4">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <h1 class="text-xl font-bold text-white">EventosVivos</h1>
        <div class="flex items-center gap-3">
          @if (auth.isAuthenticated()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                Panel Admin
              </a>
            } @else {
              <a routerLink="/my-reservations" class="text-sm text-slate-300 hover:text-white">
                Mis reservas
              </a>
            }
            <button (click)="auth.logout()" class="text-sm text-slate-400 hover:text-white">
              Cerrar sesión
            </button>
          } @else {
            <a routerLink="/login" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Iniciar sesión
            </a>
          }
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">
      <div class="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            placeholder="Buscar evento..."
            [(ngModel)]="filters.title"
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
          <select
            [(ngModel)]="filters.type"
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="Conference">Conferencia</option>
            <option value="Workshop">Taller</option>
            <option value="Concert">Concierto</option>
          </select>
          <select
            [(ngModel)]="filters.venueId"
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos los lugares</option>
            <option value="1">Auditorio Central</option>
            <option value="2">Sala Norte</option>
            <option value="3">Arena Sur</option>
          </select>
          <select
            [(ngModel)]="filters.status"
            class="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="Active">Activo</option>
            <option value="Cancelled">Cancelado</option>
            <option value="Completed">Completado</option>
          </select>
        </div>
        <div class="mt-4 flex gap-3">
          <button
            (click)="search()"
            class="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Buscar
          </button>
          <button
            (click)="clear()"
            class="rounded-lg border border-slate-700 px-5 py-2 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (error()) {
        <div class="rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-400">
          {{ error() }}
        </div>
      } @else if (paginatedEvents().length === 0) {
        <div class="py-16 text-center text-slate-500">No se encontraron eventos.</div>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (event of paginatedEvents(); track event.id) {
            <div class="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              <div class="h-40 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                <span class="text-4xl">🎭</span>
              </div>
              <div class="flex flex-1 flex-col p-5 gap-3">
                <div class="flex flex-wrap gap-2">
                  <app-badge [label]="event.type" />
                  <app-badge [label]="event.status" />
                </div>
                <h3 class="font-semibold text-white leading-tight">{{ event.title }}</h3>
                <div class="text-sm text-slate-400 space-y-1">
                  <p>📍 {{ event.venueName }}</p>
                  <p>📅 {{ event.startDateTime | date:'dd/MM/yyyy HH:mm' }} UTC</p>
                  <p>💶 &#36;{{ event.ticketPrice }}</p>
                  <p>🎟️ {{ eventService.availableTickets(event) }} / {{ event.maxCapacity }} disponibles</p>
                </div>
                <div class="mt-auto pt-2">
                  @if (event.status === 'Active') {
                    <button
                      (click)="book(event)"
                      class="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                      Reservar
                    </button>
                  } @else {
                    <button disabled class="w-full rounded-lg bg-slate-700 py-2 text-sm font-medium text-slate-500 cursor-not-allowed">
                      No disponible
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        @if (totalPages() > 1) {
          <div class="mt-8 flex justify-center gap-2">
            <button
              (click)="page.set(page() - 1)"
              [disabled]="page() === 0"
              class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-slate-600"
            >
              ← Anterior
            </button>
            <span class="flex items-center px-4 text-sm text-slate-400">
              {{ page() + 1 }} / {{ totalPages() }}
            </span>
            <button
              (click)="page.set(page() + 1)"
              [disabled]="page() === totalPages() - 1"
              class="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-slate-600"
            >
              Siguiente →
            </button>
          </div>
        }
      }
    </main>
  `,
})
export class EventListComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly eventService = inject(EventService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly events = signal<Event[]>([]);
  readonly page = signal(0);
  readonly perPage = 9;

  filters: EventFilters = {};

  readonly totalPages = computed(() => Math.ceil(this.events().length / this.perPage));

  readonly paginatedEvents = computed(() => {
    const start = this.page() * this.perPage;
    return this.events().slice(start, start + this.perPage);
  });

  ngOnInit() {
    this.search();
  }

  search() {
    this.loading.set(true);
    this.error.set(null);
    this.page.set(0);
    this.eventService.list(this.filters).subscribe({
      next: (data) => {
        this.events.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los eventos. Verifica que la API esté corriendo.');
        this.loading.set(false);
      },
    });
  }

  clear() {
    this.filters = {};
    this.search();
  }

  book(event: Event) {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `book/${event.id}` } });
      return;
    }
    this.router.navigate(['/book', event.id]);
  }
}
