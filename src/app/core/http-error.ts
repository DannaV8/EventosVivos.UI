/**
 * Extracts a user-facing message from an HTTP error returned by the API.
 *
 * The backend's ExceptionHandlingMiddleware returns `{ error, message, detail }`,
 * while ASP.NET validation problems use `{ title }`. We try the most specific
 * field first and fall back to a caller-provided default.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  const body = (err as { error?: { detail?: unknown; message?: string; title?: string } })?.error;

  if (body?.detail && typeof body.detail === 'object') {
    const messages = Object.values(body.detail as Record<string, string[]>).flat();
    return messages.join(' ') || body?.message || fallback;
  }

  return (body?.detail as string | undefined) ?? body?.message ?? body?.title ?? fallback;
}
