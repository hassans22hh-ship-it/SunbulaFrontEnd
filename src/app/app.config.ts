import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideExperimentalZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { AuthService } from './core/auth/auth.service';

function initApp() {
  return async () => {
    // 1. Restore theme preference
    const theme = localStorage.getItem('sb_theme') ?? 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // 2. Restore timer from sessionStorage (handled by TimerStore on inject)

    // 3. Initialize auth (loads tokens + user profile)
    const auth = inject(AuthService);
    await auth.initialize();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideAppInitializer(initApp()),
  ],
};
