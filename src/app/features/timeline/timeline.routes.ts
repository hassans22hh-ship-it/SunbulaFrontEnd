import { Routes } from '@angular/router';

export const TIMELINE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./day-timeline.component').then(m => m.DayTimelineComponent),
  }
];
