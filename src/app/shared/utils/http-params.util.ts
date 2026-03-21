import { HttpParams } from '@angular/common/http';

/**
 * Convert a plain object to HttpParams, filtering out null/undefined values.
 */
export function toHttpParams(obj: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
