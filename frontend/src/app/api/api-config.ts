import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8000',
});

/** Builds query params, skipping undefined, null and empty values. */
export function toParams(values: object = {}): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** The API returns errors as {"detail": "..."}; fall back to a generic message. */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse && typeof error.error?.detail === 'string') {
    return error.error.detail;
  }
  return 'Something went wrong. Please try again.';
}
