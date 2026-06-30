import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { TOKEN_USER } from '../testing/jwt.helpers';

function runGuard() {
  const route = { url: [{ path: 'my-reservations' }] } as unknown as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, {} as any));
}

describe('authGuard', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => localStorage.clear());

  it('allows access when token is present', () => {
    auth.token.set(TOKEN_USER);
    expect(runGuard()).toBe(true);
  });

  it('redirects to /login with returnUrl when there is no token', () => {
    auth.token.set(null);
    const result = runGuard() as UrlTree;
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toContain('/login');
    expect(result.queryParams['returnUrl']).toBe('my-reservations');
  });
});
