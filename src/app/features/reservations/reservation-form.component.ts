import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { EventService } from '../events/event.service';
import { ReservationService } from './reservation.service';
import { ToastService } from '../../shared/services/toast.service';
import { apiErrorMessage } from '../../core/http-error';
import { Event } from '../../core/models/event.model';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent, BadgeComponent, DatePipe, DecimalPipe],
  template: `
    <div class="min-h-screen bg-slate-950 px-4 py-10">
      <div class="mx-auto max-w-lg">
        <a routerLink="/" class="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          ← Back to events
        </a>

        @if (loadingEvent()) {
          <app-spinner />
        } @else if (!event()) {
          <div class="rounded-xl border border-red-900 bg-red-950 p-6 text-center text-red-400">
            Event not found.
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
            <p class="mt-2 text-sm font-medium text-indigo-400">&#36;{{ event()!.ticketPrice }} per ticket</p>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 class="mb-5 text-base font-semibold text-white">Complete your reservation</h3>

            @if (errorMsg()) {
              <div class="mb-4 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">
                {{ errorMsg() }}
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Full name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Your name"
                />
                @if (invalid('name')) {
                  <p class="text-xs text-red-400">Your name is required.</p>
                }
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="tu@email.com"
                />
                @if (invalid('email')) {
                  <p class="text-xs text-red-400">Enter a valid email.</p>
                }
              </div>

              <div class="space-y-1">
                <label class="text-sm font-medium text-slate-300">Number of tickets</label>
                <input
                  type="number"
                  formControlName="quantity"
                  min="1"
                  max="10"
                  class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
                @if (invalid('quantity')) {
                  <p class="text-xs text-red-400">Choose between 1 and 10 tickets.</p>
                }
                <p class="text-xs text-slate-500">
                  Available: {{ eventService.availableTickets(event()!) }} | Total: &#36;{{ (event()!.ticketPrice * quantity()) | number:'1.2-2' }}
                </p>
              </div>

              <button
                type="submit"
                [disabled]="loading() || success() || form.invalid"
                class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading() ? 'Reserving...' : 'Confirm reservation' }}
              </button>
            </form>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReservationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  readonly eventService = inject(EventService);
  private readonly reservationService = inject(ReservationService);
  private readonly toast = inject(ToastService);

  readonly event = signal<Event | null>(null);
  readonly loadingEvent = signal(true);
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  /** Live quantity for the running total in the template. */
  readonly quantity = toSignal(this.form.controls.quantity.valueChanges, {
    initialValue: this.form.controls.quantity.value,
  });

  invalid(name: 'name' | 'email' | 'quantity'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.form.controls.email.setValue(this.auth.email() ?? '');
    this.eventService.getById(eventId).subscribe({
      next: (event) => {
        this.event.set(event);
        this.loadingEvent.set(false);
      },
      error: () => {
        this.event.set(null);
        this.loadingEvent.set(false);
      },
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const eventId = this.route.snapshot.paramMap.get('eventId')!;

    this.loading.set(true);
    this.errorMsg.set(null);

    const { name, email, quantity } = this.form.getRawValue();
    this.reservationService.create({
      eventId,
      quantity,
      buyerName: name,
      buyerEmail: email,
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.toast.show(
          'Reservation created! Your reservation is pending payment confirmation.',
          'success',
          5000
        );
        timer(2000)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/my-reservations']));
      },
      error: (err) => {
        const msg = apiErrorMessage(err, 'Failed to create reservation.');
        this.errorMsg.set(msg);
        this.toast.show(msg, 'error');
        this.loading.set(false);
      },
    });
  }
}
