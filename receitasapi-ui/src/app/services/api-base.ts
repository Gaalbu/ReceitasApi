export function resolveApiBase(): string {
  try {
    if (typeof window !== 'undefined') {
      const isTestEnv = typeof process !== 'undefined'
        && (process.env['NODE_ENV'] === 'test' || process.env['VITEST'] === 'true');

      if (!isTestEnv) {
        return 'http://localhost:8080';
      }

      return '/api';
    }
  } catch {
    // Ignore when running in SSR context without browser globals.
  }

  return '/api';
}
