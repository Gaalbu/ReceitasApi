export function resolveApiBase(): string {
  try {
    if (typeof window !== 'undefined' && window.location?.port === '4000') {
      return 'http://localhost:8080';
    }
  } catch {
    // Ignore when running in SSR context without browser globals.
  }

  return '/api';
}
