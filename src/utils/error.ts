export type ErrorType = 'network' | 'api' | 'generic';

export const getErrorType = (error: unknown): ErrorType => {
  if (!error) return 'generic';

  interface ErrorWithDetails {
    isAxiosError?: boolean;
    response?: unknown;
    request?: unknown;
    code?: number | string;
  }

  const err = error as ErrorWithDetails;

  // Axios network error (no response)
  if (err.isAxiosError && !err.response) {
    return 'network';
  }

  // Axios response error (status code outside 2xx) or business error (code !== 0)
  if (err.response || (err.code !== undefined && err.code !== 0 && err.code !== 200)) {
    return 'api';
  }

  // Handle mock errors or other types
  if (err.request) {
    return 'network';
  }

  return 'generic';
};
