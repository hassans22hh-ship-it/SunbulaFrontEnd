import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;

  // Allow authenticated users to stay on verify-email if they are not confirmed
  if (state.url.includes('verify-email') && !auth.isEmailConfirmed()) {
    return true;
  }

  // Otherwise, redirect authenticated users away from auth pages
  return router.parseUrl('/tasks'); // Changed from /dashboard to /tasks to match app.routes
};
