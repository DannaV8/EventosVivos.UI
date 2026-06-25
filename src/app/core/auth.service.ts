import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = environment.apiBase;

  readonly token = signal<string | null>(localStorage.getItem('token'));

  readonly isAuthenticated = computed(() => this.token() !== null);

  readonly role = computed<string | null>(() => {
    const t = this.token();
    if (!t) return null;
    try {
      const payload: JwtPayload = JSON.parse(atob(t.split('.')[1]));
      return payload.role ?? null;
    } catch {
      return null;
    }
  });

  readonly isAdmin = computed(() => this.role() === 'admin');

  readonly userId = computed<string | null>(() => {
    const t = this.token();
    if (!t) return null;
    try {
      const payload: JwtPayload = JSON.parse(atob(t.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  });

  readonly email = computed<string | null>(() => {
    const t = this.token();
    if (!t) return null;
    try {
      const payload: JwtPayload = JSON.parse(atob(t.split('.')[1]));
      return payload.email ?? null;
    } catch {
      return null;
    }
  });

  login(email: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.base}/auth/login`, { email, password })
      .pipe(tap(({ token }) => this.setToken(token)));
  }

  register(email: string, password: string) {
    return this.http.post<{ id: string }>(`${this.base}/auth/register`, { email, password });
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.router.navigate(['/']);
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
  }
}
