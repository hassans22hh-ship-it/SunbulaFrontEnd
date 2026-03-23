import { HttpParams } from '@angular/common/http';

/**
 * Build HttpParams from a plain object, skipping null/undefined values.
 */
export function buildHttpParams(params: Record<string, string | number | boolean | null | undefined>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}
