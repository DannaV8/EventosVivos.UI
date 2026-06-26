/**
 * Extracts a user-facing message from an HTTP error returned by the API.
 *
 * The backend's ExceptionHandlingMiddleware returns `{ error, message, detail }`,
 * while ASP.NET validation problems use `{ title }`. We try the most specific
 * field first and fall back to a caller-provided default.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const body = (err as { error?: { detail?: string; message?: string; title?: string } })?.error;
  return body?.detail ?? body?.message ?? body?.title ?? fallback;
}
