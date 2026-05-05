import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.parseUrl('/Home/login');
  }

  if (!auth.isEmailConfirmed()) {
    return router.parseUrl('/Home/verify-email');
  }

  return true;
};
