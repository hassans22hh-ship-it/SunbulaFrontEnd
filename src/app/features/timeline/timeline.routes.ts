import { Routes } from '@angular/router';
export const TIMELINE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./timeline.component').then(m => m.TimelineComponent) },
];
