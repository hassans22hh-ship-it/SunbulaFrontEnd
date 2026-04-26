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
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      { path: 'tasks', loadChildren: () => import('@features/tasks/tasks.routes').then(m => m.TASKS_ROUTES) },
      { path: 'categories/:id', loadComponent: () => import('@features/categories/category-detail-page/category-detail-page.component').then(m => m.CategoryDetailPageComponent) },
      { path: 'folders', loadChildren: () => import('@features/folders/folders.routes').then(m => m.FOLDERS_ROUTES) },
      { path: 'folders/:id', loadComponent: () => import('@features/folders/folder-detail-page/folder-detail-page.component').then(m => m.FolderDetailPageComponent) },


      { path: 'timer', loadChildren: () => import('@features/timer/timer.routes').then(m => m.TIMER_ROUTES) },
      { path: 'reports', loadChildren: () => import('@features/reports/reports.routes').then(m => m.REPORTS_ROUTES) },
      { path: 'finance', loadChildren: () => import('@features/finance/finance.routes').then(m => m.FINANCE_ROUTES) },
      { path: 'debts', loadChildren: () => import('@features/debts/debts.routes').then(m => m.DEBTS_ROUTES) },
      { path: 'plant-store', loadChildren: () => import('@features/plant-store/plant-store.routes').then(m => m.PLANT_STORE_ROUTES) },
      { path: 'settings', loadChildren: () => import('@features/settings/settings.routes').then(m => m.SETTINGS_ROUTES) },
    ],
  },
  {
    path: 'auth',
    loadChildren: () => import('@features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [guestGuard],
  },
  { path: '**', redirectTo: 'tasks' },
];
