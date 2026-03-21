import { Routes } from '@angular/router';

export const TIMER_ROUTES: Routes = [
  {
    path: '',
    // Just a simple wrapper component to hold live timer and session list
    loadComponent: () => import('./timer.component').then(m => m.TimerPageComponent),
  }
];
