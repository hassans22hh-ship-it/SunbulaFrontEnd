import { Routes } from '@angular/router';
export const SETTINGS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./settings.component').then(m => m.SettingsComponent) },
  { path: 'change-password', loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
  { path: 'delete-account', loadComponent: () => import('./components/delete-account/delete-account.component').then(m => m.DeleteAccountComponent) },
  { path: 'reset-coins', loadComponent: () => import('./components/reset-coins/reset-coins.component').then(m => m.ResetCoinsComponent) },
];
