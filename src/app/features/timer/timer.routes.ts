import { Routes } from '@angular/router';

export const TIMER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./timer.component').then(m => m.TimerComponent) },
];
