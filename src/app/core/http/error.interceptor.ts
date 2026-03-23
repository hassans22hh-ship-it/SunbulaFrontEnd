import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '@shared/ui/toast/toast.service';

const HTTP_MESSAGES: Record<number, string> = {
  401: 'Please sign in to continue',
  403: 'You are not authorized',
  404: 'Resource not found',
  409: 'This item already exists or conflicts with existing data',
  500: 'A server error occurred',
  0:   'Check your internet connection',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message: string;

      if (typeof err.error === 'string') {
        // Raw string 500 from unhandled domain exception
        message = 'A server error occurred. Please try again.';
      } else {
        message =
          err.error?.detail ??
          err.error?.title ??
          HTTP_MESSAGES[err.status] ??
          'An unexpected error occurred';
      }

      // 400 = inline form validation — show inline, not toast
      // 401 = handled by auth interceptor
      // 204 = not an error
      if (err.status !== 400 && err.status !== 401 && err.status !== 204) {
        toast.error(message);
      }

      return throwError(() => ({
        status:  err.status,
        message,
        errors:  err.error?.errors ?? null,
      }));
    }),
  );
};
