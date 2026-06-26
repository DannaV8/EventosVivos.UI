import { apiErrorMessage } from './http-error';

describe('apiErrorMessage', () => {
  const fallback = 'Something went wrong.';

  it('prefers error.detail when present', () => {
    const err = { error: { detail: 'Not enough capacity.', message: 'msg', title: 'ttl' } };
    expect(apiErrorMessage(err, fallback)).toBe('Not enough capacity.');
  });

  it('falls back to error.message when detail is missing', () => {
    const err = { error: { message: 'Validation failed.', title: 'ttl' } };
    expect(apiErrorMessage(err, fallback)).toBe('Validation failed.');
  });

  it('falls back to error.title when detail and message are missing', () => {
    const err = { error: { title: 'One or more validation errors occurred.' } };
    expect(apiErrorMessage(err, fallback)).toBe('One or more validation errors occurred.');
  });

  it('returns the fallback when there is no usable field', () => {
    expect(apiErrorMessage({ error: {} }, fallback)).toBe(fallback);
    expect(apiErrorMessage({}, fallback)).toBe(fallback);
    expect(apiErrorMessage(null, fallback)).toBe(fallback);
    expect(apiErrorMessage(undefined, fallback)).toBe(fallback);
  });
});
