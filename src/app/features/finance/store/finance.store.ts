import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, forkJoin } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

import {
  WalletDto,
  FinancialCategoryDto,
  TransactionDto,
  CreateWalletDto,
  UpdateWalletDto,
  CreateTransactionDto,
  CreateFinancialCategoryDto
} from '@features/finance/models/finance.models';

import { WalletsApiService } from '@features/finance/services/wallets.api.service';
import { TransactionsApiService } from '@features/finance/services/transactions.api.service';
import { FinancialCategoriesApiService } from '@features/finance/services/financial-categories.api.service';

interface FinanceState {
  wallets:      WalletDto[];
  categories:   FinancialCategoryDto[];
  transactions: TransactionDto[];
  currentWalletId: string | null;
  isLoading:    boolean;
  error:        string | null;
}

const initialState: FinanceState = {
  wallets:      [],
  categories:   [],
  transactions: [],
  currentWalletId: null,
  isLoading:    false,
  error:        null,
};

export const FinanceStore = signalStore(
  { providedIn: 'root' },
  withState<FinanceState>(initialState),
  withComputed(({ wallets, categories, transactions, currentWalletId }) => ({
    allWallets:      computed(() => wallets()),
    allCategories:   computed(() => categories()),
    allTransactions: computed(() => transactions()),
    selectedWalletId: computed(() => currentWalletId()),
    
    selectedWallet: computed(() => {
      const id = currentWalletId();
      return id ? wallets().find(w => w.id === id) || null : null;
    }),
    
    totalBalance: computed(() => {
      return wallets().reduce((sum, w) => sum + w.balance, 0);
    })
  })),
  withMethods((
    store,
    walletApi = inject(WalletsApiService),
    transactionApi = inject(TransactionsApiService),
    categoryApi = inject(FinancialCategoriesApiService)
  ) => ({
    
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          forkJoin({
            wallets: walletApi.getAll(),
            categories: categoryApi.getAll(),
            transactions: transactionApi.getAll()
          }).pipe(
            tapResponse({
              next: (data) => patchState(store, {
                wallets: data.wallets,
                categories: data.categories,
                transactions: data.transactions,
                isLoading: false
              }),
              error: (err: any) => patchState(store, { error: err.message, isLoading: false })
            })
          )
        )
      )
    ),

    selectWallet: (id: string | null) => {
      patchState(store, { currentWalletId: id });
    },

    // --- Wallets ---
    addWallet: rxMethod<CreateWalletDto>(
      pipe(
        switchMap((dto) => walletApi.create(dto).pipe(
          tapResponse({
            next: (w) => patchState(store, (s) => ({ wallets: [...s.wallets, w] })),
            error: console.error
          })
        ))
      )
    ),
    editWallet: rxMethod<{id: string, dto: UpdateWalletDto}>(
      pipe(
        switchMap(({id, dto}) => walletApi.update(id, dto).pipe(
          tapResponse({
            next: (w) => patchState(store, (s) => ({
              wallets: s.wallets.map(x => x.id === id ? w : x)
            })),
            error: console.error
          })
        ))
      )
    ),
    deleteWallet: rxMethod<string>(
      pipe(
        switchMap((id) => walletApi.delete(id).pipe(
          tapResponse({
            next: () => patchState(store, (s) => ({
              wallets: s.wallets.filter(x => x.id !== id),
              currentWalletId: s.currentWalletId === id ? null : s.currentWalletId
            })),
            error: console.error
          })
        ))
      )
    ),

    // --- Transactions ---
    addTransaction: rxMethod<CreateTransactionDto>(
      pipe(
        switchMap((dto) => transactionApi.create(dto).pipe(
          tapResponse({
            next: (t) => {
               // Update local wallet balance optimistically based on transaction created
               // Real architecture usually fetches wallet again or relies on backend triggers, 
               // but we can locally patch for snappiness.
               patchState(store, (s) => {
                 const amount = t.type === 1 ? -t.amount : t.amount; // 1 = Expense, 0 = Income
                 return {
                   transactions: [t, ...s.transactions],
                   wallets: s.wallets.map(w => w.id === t.walletId ? { ...w, balance: w.balance + amount } : w)
                 };
               });
            },
            error: console.error
          })
        ))
      )
    ),
    deleteTransaction: rxMethod<{id: string, walletId: string, amount: number, type: number}>(
      pipe(
        switchMap(({id, walletId, amount, type}) => transactionApi.delete(id).pipe(
          tapResponse({
            next: () => {
              patchState(store, (s) => {
                const reverseAmount = type === 1 ? amount : -amount;
                return {
                  transactions: s.transactions.filter(x => x.id !== id),
                  wallets: s.wallets.map(w => w.id === walletId ? { ...w, balance: w.balance + reverseAmount } : w)
                };
              });
            },
            error: console.error
          })
        ))
      )
    ),

    // --- Categories ---
    addCategory: rxMethod<CreateFinancialCategoryDto>(
      pipe(
        switchMap((dto) => categoryApi.create(dto).pipe(
          tapResponse({
            next: (c) => patchState(store, (s) => ({ categories: [...s.categories, c] })),
            error: console.error
          })
        ))
      )
    )

  }))
);
