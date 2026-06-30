import { Component, inject, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AdminReservationsTabComponent } from './tabs/admin-reservations-tab.component';
import { AdminEventsTabComponent } from './tabs/admin-events-tab.component';
import { AdminReportsTabComponent } from './tabs/admin-reports-tab.component';
import { AdminCreateEventTabComponent } from './tabs/admin-create-event-tab.component';

type Tab = 'reservations' | 'events' | 'reports' | 'create';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterLink,
    AdminReservationsTabComponent,
    AdminEventsTabComponent,
    AdminReportsTabComponent,
    AdminCreateEventTabComponent,
  ],
  template: `
    <header class="border-b border-slate-800 bg-slate-900 px-4 py-3">
      <div class="mx-auto max-w-7xl space-y-3">
        <!-- Fila 1: título + acciones -->
        <div class="flex items-center justify-between">
          <h1 class="text-base font-bold text-white sm:text-xl">EventosVivos <span class="text-indigo-400">Admin</span></h1>
          <div class="flex items-center gap-3">
            <a routerLink="/" class="text-xs text-slate-400 hover:text-white sm:text-sm">View site</a>
            <button (click)="auth.logout()" class="text-xs text-slate-400 hover:text-white sm:text-sm">Sign out</button>
          </div>
        </div>
        <!-- Fila 2: tabs scrollables en móvil -->
        <nav class="flex gap-1 overflow-x-auto pb-1">
          @for (t of tabs; track t.id) {
            <button
              (click)="switchTab(t.id)"
              [class]="tab() === t.id
                ? 'shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white sm:px-4 sm:text-sm'
                : 'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white sm:px-4 sm:text-sm'"
            >{{ t.label }}</button>
          }
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8">
      @if (tab() === 'reservations') {
        <app-admin-reservations-tab />
      }
      @if (tab() === 'events') {
        <app-admin-events-tab
          [refreshKey]="eventsRefreshKey()"
          (createRequested)="switchTab('create')"
        />
      }
      @if (tab() === 'reports') {
        <app-admin-reports-tab />
      }
      @if (tab() === 'create') {
        <app-admin-create-event-tab
          (created)="onEventCreated()"
          (cancelled)="switchTab('events')"
        />
      }
    </main>
  `,
})
export class AdminLayoutComponent {
  readonly auth = inject(AuthService);

  readonly tab = signal<Tab>('reservations');
  readonly eventsRefreshKey = signal(0);

  readonly tabs = [
    { id: 'reservations' as Tab, label: 'Reservations' },
    { id: 'events'       as Tab, label: 'Events' },
    { id: 'reports'      as Tab, label: 'Reports' },
    { id: 'create'       as Tab, label: '+ Create event' },
  ];

  switchTab(t: Tab) {
    this.tab.set(t);
  }

  onEventCreated() {
    this.eventsRefreshKey.update((k) => k + 1);
    this.switchTab('events');
  }
}
