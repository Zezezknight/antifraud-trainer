export interface ApiError {
  code: string;
  message: string;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'code' in value &&
    typeof value.code === 'string'
  );
}
