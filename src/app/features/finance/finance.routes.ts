import { Routes } from '@angular/router';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./finance.component').then(m => m.FinanceComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./categories/categories-page.component').then(m => m.CategoriesPageComponent),
  },
  {
    path: 'wallets',
    loadComponent: () => import('./wallets/wallet-list/wallet-list.component').then(m => m.WalletListComponent),
  },
];
