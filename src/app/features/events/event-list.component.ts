import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { EventService } from './event.service';
import { Event, EventFilters, EventType, EventStatus, VENUE_MAP } from '../../core/models/event.model';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { SelectFilterComponent } from '../../shared/ui/select-filter.component';
import { PaginatorComponent } from '../../shared/ui/paginator.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [FormsModule, RouterLink, BadgeComponent, SpinnerComponent, DatePipe, SelectFilterComponent, PaginatorComponent],
  template: `
    <header class="border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <h1 class="text-base sm:text-xl font-bold text-white shrink-0">EventosVivos</h1>
        <div class="flex items-center gap-3">
          @if (auth.isAuthenticated()) {
            @if (auth.isAdmin()) {
              <a routerLink="/admin" class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
                Admin Panel
              </a>
            } @else {
              <a routerLink="/my-reservations" class="text-sm text-slate-300 hover:text-white">
                My reservations
              </a>
            }
            <button (click)="auth.logout()" class="text-sm text-slate-400 hover:text-white">
              Sign out
            </button>
          } @else {
            <a routerLink="/login" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 whitespace-nowrap">
              Sign in
            </a>
          }
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">

      <div class="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">

        <!-- Fila 1: búsqueda + dropdowns -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 [&>*]:min-w-0">
          <div class="col-span-2 lg:col-span-1 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 focus-within:border-indigo-500">
            <svg class="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search event..." [(ngModel)]="filters.title"
              class="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none" />
          </div>

          <app-select-filter
            placeholder="Type: all"
            [options]="typeOptions"
            [value]="filters.type ?? ''"
            (valueChange)="setType($event)">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
          </app-select-filter>

          <app-select-filter
            placeholder="Venue: all"
            [options]="venueOptions"
            [value]="filters.venueId ? filters.venueId.toString() : ''"
            (valueChange)="setVenue($event)">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </app-select-filter>

          <app-select-filter
            placeholder="Status: all"
            [options]="statusOptions"
            [value]="filters.status ?? ''"
            (valueChange)="setStatus($event)">
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </app-select-filter>
        </div>

        <!-- Fila 2: fechas + botones -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 [&>*]:min-w-0">
          <div class="flex items-center gap-1.5 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 focus-within:border-indigo-500">
            <svg class="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span class="text-xs text-slate-500 shrink-0">From</span>
            <input type="date" [(ngModel)]="filters.startDate"
              class="min-w-0 flex-1 bg-transparent text-xs text-slate-300 focus:outline-none focus:text-white" />
          </div>

          <div class="flex items-center gap-1.5 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 focus-within:border-indigo-500">
            <svg class="h-4 w-4 shrink-0 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span class="text-xs text-slate-500 shrink-0">To</span>
            <input type="date" [(ngModel)]="filters.endDate"
              class="min-w-0 flex-1 bg-transparent text-xs text-slate-300 focus:outline-none focus:text-white" />
          </div>

          <button (click)="search()"
            class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            Search
          </button>
          <button (click)="clear()"
            class="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            Clear filters
          </button>
        </div>
      </div>

      @if (loading()) {
        <app-spinner />
      } @else if (error()) {
        <div class="rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-400">
          {{ error() }}
        </div>
      } @else if (events().length === 0) {
        <div class="py-16 text-center text-slate-500">No events found.</div>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          @for (event of events(); track event.id) {
            <div class="flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              <div class="h-40 bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                <span class="text-4xl">{{ typeIcon(event) }}</span>
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
                  <p>🎟️ {{ eventService.availableTickets(event) }} / {{ event.maxCapacity }} available</p>
                </div>
                <div class="mt-auto pt-2">
                  @if (event.status === 'Active') {
                    <button
                      (click)="book(event)"
                      class="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
                    >
                      Reserve
                    </button>
                  } @else {
                    <button disabled class="w-full rounded-lg bg-slate-700 py-2 text-sm font-medium text-slate-500 cursor-not-allowed">
                      Unavailable
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <app-paginator [page]="page()" [totalPages]="totalPages()" (pageChange)="goTo($event)" />
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
  readonly totalCount = signal(0);
  readonly page = signal(0);
  readonly perPage = 9;

  filters: EventFilters = {};

  readonly typeOptions = [
    { value: 'Conference', label: 'Conference' },
    { value: 'Workshop',   label: 'Workshop' },
    { value: 'Concert',    label: 'Concert' },
  ];
  readonly venueOptions = [
    { value: '1', label: 'Central Auditorium' },
    { value: '2', label: 'North Hall' },
    { value: '3', label: 'South Arena' },
  ];
  readonly statusOptions = [
    { value: 'Active',    label: 'Active' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Completed', label: 'Completed' },
  ];

  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.perPage));

  ngOnInit() {
    this.search();
  }

  typeIcon(event: Event): string {
    const map: Record<string, string> = {
      Conference: '🎤',
      Workshop:   '🛠️',
      Concert:    '🎸',
    };
    return map[event.type] ?? '🎭';
  }

  setType(v: string)   { this.filters = { ...this.filters, type: (v as EventType) || undefined }; }
  setVenue(v: string)  { this.filters = { ...this.filters, venueId: v ? +v : undefined }; }
  setStatus(v: string) { this.filters = { ...this.filters, status: (v as EventStatus) || undefined }; }

  /** Reinicia a la primera página y carga (al buscar o cambiar filtros). */
  search() {
    this.page.set(0);
    this.load();
  }

  /** Carga la página actual desde la API. */
  load() {
    this.loading.set(true);
    this.error.set(null);
    // El componente usa páginas base 0; la API base 1.
    this.eventService.list(this.filters, this.page() + 1, this.perPage).subscribe({
      next: (result) => {
        this.events.set(result.items);
        this.totalCount.set(result.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load events. Make sure the API is running.');
        this.loading.set(false);
      },
    });
  }

  goTo(page: number) {
    if (page < 0 || page >= this.totalPages()) return;
    this.page.set(page);
    this.load();
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
