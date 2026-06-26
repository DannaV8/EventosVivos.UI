import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { TOKEN_ADMIN, TOKEN_USER } from './testing/jwt.helpers';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('starts without token when localStorage is empty', () => {
    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.role()).toBeNull();
    expect(service.isAdmin()).toBe(false);
  });

  it('reads token from localStorage on init', () => {
    localStorage.setItem('token', TOKEN_USER);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const freshService = TestBed.inject(AuthService);
    expect(freshService.token()).toBe(TOKEN_USER);
    expect(freshService.isAuthenticated()).toBe(true);
    expect(freshService.role()).toBe('user');
  });

  it('login stores token and updates signals', () => {
    service.login('user@test.com', '12345678').subscribe();

    const req = http.expectOne('https://localhost:62323/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: TOKEN_USER });

    expect(service.token()).toBe(TOKEN_USER);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.role()).toBe('user');
    expect(service.isAdmin()).toBe(false);
    expect(service.userId()).toBe('user-id-123');
    expect(localStorage.getItem('token')).toBe(TOKEN_USER);
  });

  it('login with admin token: isAdmin() is true', () => {
    service.login('admin@test.com', '12345678').subscribe();

    http.expectOne('https://localhost:62323/api/auth/login').flush({ token: TOKEN_ADMIN });

    expect(service.isAdmin()).toBe(true);
    expect(service.role()).toBe('admin');
    expect(service.userId()).toBe('admin-id-456');
  });

  it('logout clears token from signal and localStorage', () => {
    service.login('user@test.com', '12345678').subscribe();
    http.expectOne('https://localhost:62323/api/auth/login').flush({ token: TOKEN_USER });

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('register calls POST /auth/register without sending role', () => {
    service.register('nuevo@test.com', 'password123').subscribe();

    const req = http.expectOne('https://localhost:62323/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'nuevo@test.com', password: 'password123' });
    expect(req.request.body.role).toBeUndefined();
    req.flush({ id: 'nuevo-id' });
  });
});
