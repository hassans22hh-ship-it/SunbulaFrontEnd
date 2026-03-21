import { Routes } from '@angular/router';
import { FinanceStore } from './store/finance.store';

export const FINANCE_ROUTES: Routes = [
  {
    path: '',
    providers: [FinanceStore], // Provide store at feature level so it's isolated but shared among finance routes
    children: [
      {
        path: '',
        redirectTo: 'wallets',
        pathMatch: 'full'
      },
      {
        path: 'wallets',
        loadComponent: () => import('./wallets/wallet-list/wallet-list.component').then(m => m.WalletListComponent)
      },
      {
        // Standalone route for exploring transactions independently
        path: 'transactions',
        loadComponent: () => import('./transactions/transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./financial-categories/financial-category-manager.component').then(m => m.FinancialCategoryManagerComponent)
      }
    ]
  }
];
