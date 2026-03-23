import { Routes } from '@angular/router';
import { ShellComponent } from '@core/layout/shell/shell.component';
import { authGuard } from '@core/auth/auth.guard';
import { guestGuard } from '@core/auth/guest.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('@features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES) },
      { path: 'tasks',     loadChildren: () => import('@features/tasks/tasks.routes').then(m => m.TASKS_ROUTES) },
      { path: 'folders',   loadChildren: () => import('@features/folders/folders.routes').then(m => m.FOLDERS_ROUTES) },
      { path: 'timer',     loadChildren: () => import('@features/timer/timer.routes').then(m => m.TIMER_ROUTES) },
      { path: 'timeline',  loadChildren: () => import('@features/timeline/timeline.routes').then(m => m.TIMELINE_ROUTES) },
      { path: 'reports',   loadChildren: () => import('@features/reports/reports.routes').then(m => m.REPORTS_ROUTES) },
      { path: 'finance',   loadChildren: () => import('@features/finance/finance.routes').then(m => m.FINANCE_ROUTES) },
      { path: 'debts',     loadChildren: () => import('@features/debts/debts.routes').then(m => m.DEBTS_ROUTES) },
      { path: 'store',     loadChildren: () => import('@features/plant-store/plant-store.routes').then(m => m.PLANT_STORE_ROUTES) },
      { path: 'settings',  loadChildren: () => import('@features/settings/settings.routes').then(m => m.SETTINGS_ROUTES) },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard],
  },
  { path: '**', redirectTo: 'dashboard' },
];
