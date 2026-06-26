import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { timer } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { apiErrorMessage } from '../../core/http-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-white">EventosVivos</h1>
          <p class="mt-2 text-slate-400">Create your account</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-5">
          @if (errorMsg()) {
            <div class="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">
              {{ errorMsg() }}
            </div>
          }
          @if (success()) {
            <div class="rounded-lg border border-emerald-900 bg-emerald-950 p-3 text-sm text-emerald-400">
              Account created. Redirecting to login...
            </div>
          }

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              formControlName="email"
              autocomplete="email"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="tu@email.com"
            />
            @if (invalid('email')) {
              <p class="text-xs text-red-400">Enter a valid email.</p>
            }
          </div>

          <div class="space-y-1">
            <label class="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              formControlName="password"
              autocomplete="new-password"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="At least 8 characters"
            />
            @if (invalid('password')) {
              <p class="text-xs text-red-400">Password must be at least 8 characters.</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loading() || success() || form.invalid"
            class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading() ? 'Creating account...' : 'Create account' }}
          </button>

          <p class="text-center text-sm text-slate-500">
            Already have an account?
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 ml-1">Sign in</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly success = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  invalid(name: 'email' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.dirty || c.touched);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set(null);

    const { email, password } = this.form.getRawValue();
    this.auth.register(email, password).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        timer(1500)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/login']));
      },
      error: (err) => {
        this.errorMsg.set(apiErrorMessage(err, 'Failed to create account.'));
        this.loading.set(false);
      },
    });
  }
}
