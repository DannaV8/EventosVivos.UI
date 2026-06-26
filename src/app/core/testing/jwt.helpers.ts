export function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

export const TOKEN_USER = fakeJwt({
  sub: 'user-id-123',
  email: 'user@test.com',
  role: 'user',
  exp: 9999999999,
});

export const TOKEN_ADMIN = fakeJwt({
  sub: 'admin-id-456',
  email: 'admin@test.com',
  role: 'admin',
  exp: 9999999999,
});
