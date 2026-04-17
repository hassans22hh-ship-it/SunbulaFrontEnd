import {
  ApplicationConfig,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
  inject,
  LOCALE_ID,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { APP_ROUTES } from './app.routes';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { errorInterceptor } from '@core/http/error.interceptor';
import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/theme/theme.service';
import { TimerStore } from '@features/timer/store/timer.store';

function initApp(): () => Promise<void> {
  const auth  = inject(AuthService);
  const theme = inject(ThemeService);
  const timer = inject(TimerStore);

  return async () => {
    theme.init();
    await auth.initialize();
    // Restore active session on app boot
    await timer.initialize();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
    },
  ],
};
