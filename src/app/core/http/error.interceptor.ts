import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/ui/toast/toast.service';

const HTTP_MESSAGES: Record<number, string> = {
  401: 'Please log in to continue',
  403: 'You are not authorized to perform this action',
  404: 'The requested resource was not found',
  500: 'A server error occurred. Please try again.',
  0:   'Check your internet connection',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const msg =
        err.error?.detail ??
        err.error?.title ??
        HTTP_MESSAGES[err.status] ??
        'An unexpected error occurred';

      // 400 = inline form validation errors — show inline, not toast
      // 401 = handled by auth interceptor
      if (err.status !== 400 && err.status !== 401) {
        toast.error(msg);
      }

      return throwError(() => ({
        status:  err.status,
        message: msg,
        errors:  err.error?.errors,
      }));
    }),
  );
};
