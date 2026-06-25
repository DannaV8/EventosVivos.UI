import { TestBed } from '@angular/core/testing';
import { UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { adminGuard } from './admin.guard';
import { AuthService } from '../auth.service';
import { TOKEN_ADMIN, TOKEN_USER } from '../testing/jwt.helpers';

function runGuard() {
  return TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
}

describe('adminGuard', () => {
  let auth: AuthService;

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
  });

  afterEach(() => localStorage.clear());

  it('permite el paso con token de admin', () => {
    auth.token.set(TOKEN_ADMIN);
    expect(runGuard()).toBe(true);
  });

  it('redirige a / con token de user normal', () => {
    auth.token.set(TOKEN_USER);
    const result = runGuard() as UrlTree;
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });

  it('redirige a / sin token', () => {
    auth.token.set(null);
    const result = runGuard() as UrlTree;
    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe('/');
  });
});
