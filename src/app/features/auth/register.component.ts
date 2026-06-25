import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-white">EventosVivos</h1>
          <p class="mt-2 text-slate-400">Crea tu cuenta</p>
        </div>

        <form (ngSubmit)="submit()" class="rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-5">
          @if (errorMsg()) {
            <div class="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-400">
              {{ errorMsg() }}
            </div>
          }
          @if (success()) {
            <div class="rounded-lg border border-emerald-900 bg-emerald-950 p-3 text-sm text-emerald-400">
              Cuenta creada. Redirigiendo al login...
            </div>
          }

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
            <label class="text-sm font-medium text-slate-300">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              minlength="8"
              class="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            [disabled]="loading() || success()"
            class="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}
          </button>

          <p class="text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-indigo-400 hover:text-indigo-300 ml-1">Inicia sesión</a>
          </p>
        </form>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly success = signal(false);

  submit() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.errorMsg.set(null);

    this.auth.register(this.email, this.password).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        const msg = err?.error?.detail ?? err?.error?.title ?? 'Error al crear la cuenta.';
        this.errorMsg.set(msg);
        this.loading.set(false);
      },
    });
  }
}
