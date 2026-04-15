import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { WalletsApiService } from '../services/wallets.api.service';
import { TransactionsApiService } from '../services/transactions.api.service';
import { FinancialCategoriesApiService } from '../services/financial-categories.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { WalletDto, FinancialTransactionDto, FinancialCategoryDto, FinanceSummaryDto, CreateWalletDto, UpdateWalletDto, CreateFinancialTransactionDto, UpdateFinancialTransactionDto, CreateFinancialCategoryDto } from '@shared/models/finance.models';
import { firstValueFrom } from 'rxjs';

interface FinanceState {
  wallets:      WalletDto[];
  transactions: FinancialTransactionDto[];
  categories:   FinancialCategoryDto[];
  summary:      FinanceSummaryDto | null;
  selectedWalletId: string | null;
  selectedTransaction: FinancialTransactionDto | null;
  isLoading:    boolean;
  error:        string | null;
}

export const FinanceStore = signalStore(
  withState<FinanceState>({
    wallets: [], transactions: [], categories: [], summary: null,
    selectedWalletId: null, selectedTransaction: null, isLoading: false, error: null,
  }),
  withComputed(({ wallets, transactions }) => ({
    totalBalance: computed(() => wallets().reduce((sum, w) => sum + w.balance, 0)),
    walletCount:  computed(() => wallets().length),
    txCount:      computed(() => transactions().length),
  })),
  withMethods((store, wApi = inject(WalletsApiService), tApi = inject(TransactionsApiService), cApi = inject(FinancialCategoriesApiService), toast = inject(ToastService)) => ({
    setSelectedWallet(id: string | null) {
      patchState(store, { selectedWalletId: id });
    },
    setSelectedTransaction(tx: FinancialTransactionDto | null) {
      patchState(store, { selectedTransaction: tx });
    },
    async loadAll(currency?: string): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const wallets      = await firstValueFrom(wApi.getAll());
        const transactions = await firstValueFrom(tApi.getAll());
        const categories   = await firstValueFrom(cApi.getAll());
        const summary      = await firstValueFrom(wApi.getSummary(currency));

        patchState(store, { wallets, transactions, categories, summary, isLoading: false });
      } catch (e: unknown) { patchState(store, { isLoading: false, error: (e as { message: string }).message }); }
    },
    async loadTransactionsByWallet(walletId: string): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const transactions = await firstValueFrom(tApi.getByWallet(walletId));
        patchState(store, { transactions, isLoading: false });
      } catch { patchState(store, { isLoading: false }); toast.error('Failed to load wallet transactions'); }
    },
    async createWallet(dto: CreateWalletDto): Promise<void> {
      try {
        const w = await firstValueFrom(wApi.create(dto));
        patchState(store, { wallets: [...store.wallets(), w] });
        toast.success('Wallet created');
      } catch { toast.error('Failed to create wallet'); }
    },
    async updateWallet(id: string, dto: UpdateWalletDto): Promise<void> {
      try {
        const w = await firstValueFrom(wApi.update(id, dto));
        patchState(store, { wallets: store.wallets().map(x => x.id === id ? w : x) });
        toast.success('Wallet updated');
      } catch { toast.error('Failed to update wallet'); }
    },
    async deleteWallet(id: string): Promise<void> {
      try {
        await firstValueFrom(wApi.delete(id));
        patchState(store, { wallets: store.wallets().filter(x => x.id !== id) });
        toast.success('Wallet deleted');
      } catch { toast.error('Failed to delete wallet'); }
    },
    async createTransaction(dto: CreateFinancialTransactionDto): Promise<void> {
      try {
        const t = await firstValueFrom(tApi.create(dto));
        patchState(store, { transactions: [t, ...store.transactions()] });
        // Refresh wallet balances after transaction
        const wallets = await firstValueFrom(wApi.getAll());
        const summary = await firstValueFrom(wApi.getSummary());
        patchState(store, { wallets, summary });
        toast.success('Transaction created');
      } catch { toast.error('Failed to create transaction'); }
    },
    async updateTransaction(id: string, dto: UpdateFinancialTransactionDto): Promise<void> {
      try {
        const t = await firstValueFrom(tApi.update(id, dto));
        patchState(store, { transactions: store.transactions().map(x => x.id === id ? t : x), selectedTransaction: null });
        const wallets = await firstValueFrom(wApi.getAll());
        const summary = await firstValueFrom(wApi.getSummary());
        patchState(store, { wallets, summary });
        toast.success('Transaction updated');
      } catch { toast.error('Failed to update transaction'); }
    },
    async removeTransaction(id: string): Promise<void> {
      try {
        await firstValueFrom(tApi.delete(id));
        patchState(store, { transactions: store.transactions().filter(x => x.id !== id), selectedTransaction: null });
        // Re-fetch wallets to get corrected balances
        const wallets = await firstValueFrom(wApi.getAll());
        const summary = await firstValueFrom(wApi.getSummary());
        patchState(store, { wallets, summary });
        toast.success('Transaction deleted');
      } catch { toast.error('Failed to delete transaction'); }
    },
    async createCategory(dto: CreateFinancialCategoryDto): Promise<void> {
      try {
        const c = await firstValueFrom(cApi.create(dto));
        patchState(store, { categories: [...store.categories(), c] });
        toast.success('Category created');
      } catch { toast.error('Failed to create category'); }
    },
    async renameCategory(id: string, newName: string): Promise<void> {
      try {
        const c = await firstValueFrom(cApi.rename(id, newName));
        patchState(store, { categories: store.categories().map(x => x.id === id ? c : x) });
        toast.success('Category renamed');
      } catch { toast.error('Failed to rename category'); }
    },
    async updateCategoryIcon(id: string, icon: string): Promise<void> {
      try {
        const c = await firstValueFrom(cApi.updateIcon(id, icon));
        patchState(store, { categories: store.categories().map(x => x.id === id ? c : x) });
        toast.success('Icon updated');
      } catch { toast.error('Failed to update icon'); }
    },
    async deleteCategory(id: string): Promise<void> {
      try {
        await firstValueFrom(cApi.delete(id));
        patchState(store, { categories: store.categories().filter(x => x.id !== id) });
        toast.success('Category deleted');
      } catch { toast.error('Failed to delete category'); }
    },
  })),
);
