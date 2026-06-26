import { Component, DestroyRef, inject, signal, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { timer } from 'rxjs';
import { AdminService } from '../admin.service';
import { apiErrorMessage } from '../../../core/http-error';

/** Group-level validator: the end date must be later than the start date. */
function endAfterStart(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDateTime')?.value;
  const end = group.get('endDateTime')?.value;
  if (!start || !end) return null;
  return new Date(end) > new Date(start) ? null : { endBeforeStart: true };
}

@Component({
  selector: 'app-admin-create-event-tab',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-xl">
      <h2 class="mb-6 text-lg font-semibold text-white">New event</h2>

      @if (error()) {
        <div class="mb-4 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">{{ error() }}</div>
      }
      @if (success()) {
        <div class="mb-4 rounded-lg border border-emerald-900 bg-emerald-950 p-3 text-sm text-emerald-400">
          Event created! Returning to the list...
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-300">Title</label>
          <input type="text" formControlName="title"
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
          @if (invalid('title')) {
            <p class="text-xs text-red-400">Title is required.</p>
          }
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium text-slate-300">Description</label>
          <textarea formControlName="description" rows="3"
            class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"></textarea>
          @if (invalid('description')) {
            <p class="text-xs text-red-400">Description is required.</p>
          }
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Type</label>
            <select formControlName="type"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none">
              <option value="Conference">Conference</option>
              <option value="Workshop">Workshop</option>
              <option value="Concert">Concert</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Venue</label>
            <select formControlName="venueId"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none">
              <option [value]="1">Central Auditorium</option>
              <option [value]="2">North Hall</option>
              <option [value]="3">South Arena</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Max capacity</label>
            <input type="number" formControlName="maxCapacity" min="1"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            @if (invalid('maxCapacity')) {
              <p class="text-xs text-red-400">Capacity must be at least 1.</p>
            }
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Price (&#36;)</label>
            <input type="number" formControlName="ticketPrice" min="0" step="0.01"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            @if (invalid('ticketPrice')) {
              <p class="text-xs text-red-400">Price cannot be negative.</p>
            }
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Start (local)</label>
            <input type="datetime-local" formControlName="startDateTime"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            @if (invalid('startDateTime')) {
              <p class="text-xs text-red-400">Start date is required.</p>
            }
          </div>
          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">End (local)</label>
            <input type="datetime-local" formControlName="endDateTime"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none" />
            @if (invalid('endDateTime')) {
              <p class="text-xs text-red-400">End date is required.</p>
            }
          </div>
        </div>
        @if (form.errors?.['endBeforeStart'] && form.controls.endDateTime.touched) {
          <p class="text-xs text-red-400">The end date must be later than the start date.</p>
        }
        <div class="flex gap-3 pt-2">
          <button type="submit" [disabled]="creating() || success() || form.invalid"
            class="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
            {{ creating() ? 'Creating...' : 'Create event' }}
          </button>
          <button type="button" (click)="cancelled.emit()"
            class="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-600">
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class AdminCreateEventTabComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);

  readonly created = output<void>();
  readonly cancelled = output<void>();

  readonly creating = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      type: ['Conference', [Validators.required]],
      venueId: [1, [Validators.required]],
      maxCapacity: [100, [Validators.required, Validators.min(1)]],
      ticketPrice: [0, [Validators.required, Validators.min(0)]],
      startDateTime: ['', [Validators.required]],
      endDateTime: ['', [Validators.required]],
    },
    { validators: endAfterStart },
  );

  invalid(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.creating.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    const body = {
      title: v.title,
      description: v.description,
      type: v.type,
      venueId: +v.venueId,
      maxCapacity: +v.maxCapacity,
      ticketPrice: +v.ticketPrice,
      startDateTime: new Date(v.startDateTime).toISOString(),
      endDateTime: new Date(v.endDateTime).toISOString(),
    };

    this.adminService.createEvent(body).subscribe({
      next: () => {
        this.success.set(true);
        this.creating.set(false);
        timer(1500)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.success.set(false);
            this.form.reset({
              title: '', description: '', type: 'Conference',
              venueId: 1, maxCapacity: 100, ticketPrice: 0,
              startDateTime: '', endDateTime: '',
            });
            this.created.emit();
          });
      },
      error: (err) => {
        this.error.set(apiErrorMessage(err, 'Failed to create the event.'));
        this.creating.set(false);
      },
    });
  }
}
