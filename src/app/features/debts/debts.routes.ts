import { Routes } from '@angular/router';
export const DEBTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./debts.component').then(m => m.DebtsComponent) },
];
