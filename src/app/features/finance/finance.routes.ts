import { Routes } from '@angular/router';
export const FINANCE_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./finance.component').then(m => m.FinanceComponent) },
];
