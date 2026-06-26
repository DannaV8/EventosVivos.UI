import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/events/event-list.component').then((m) => m.EventListComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'my-reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/my-reservations.component').then((m) => m.MyReservationsComponent),
  },
  {
    path: 'book/:eventId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/reservation-form.component').then((m) => m.ReservationFormComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
  },
  { path: '**', redirectTo: '' },
];
