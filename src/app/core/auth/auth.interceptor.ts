import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { from } from 'rxjs';
import { AuthService } from './auth.service';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthEndpoint =
    req.url.includes('/api/Authentication/login') ||
    req.url.includes('/api/Authentication/register') ||
    req.url.includes('/api/Authentication/refresh');
  const hasRefreshToken = !!sessionStorage.getItem('sb_refresh');

  // Attach token if available
  const token = auth.accessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint && hasRefreshToken && !isRefreshing) {
        isRefreshing = true;
        return from(auth.performRefresh()).pipe(
          switchMap(newToken => {
            isRefreshing = false;
            return next(addToken(req, newToken));
          }),
          catchError(refreshError => {
            isRefreshing = false;
            auth.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
