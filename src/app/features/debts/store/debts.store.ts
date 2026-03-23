import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { DebtsApiService } from '../services/debts.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { DebtDto, DebtSummaryDto, CreateDebtDto, RecordPaymentDto } from '@shared/models/debt.models';
import { firstValueFrom, forkJoin } from 'rxjs';

interface DebtsState { debts: DebtDto[]; summary: DebtSummaryDto | null; isLoading: boolean; error: string | null; }

export const DebtsStore = signalStore(
  withState<DebtsState>({ debts: [], summary: null, isLoading: false, error: null }),
  withComputed(({ debts }) => ({
    activeDebts:  computed(() => debts().filter(d => d.status === 'OUTSTANDING' || d.status === 'OVERDUE')),
    settledDebts: computed(() => debts().filter(d => d.status === 'PAID')),
  })),
  withMethods((store, api = inject(DebtsApiService), toast = inject(ToastService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const [debts, summary] = await firstValueFrom(forkJoin([api.getAll(), api.getSummary()]));
        patchState(store, { debts, summary, isLoading: false });
      } catch (e: unknown) { patchState(store, { isLoading: false, error: (e as { message: string }).message }); }
    },
    async create(dto: CreateDebtDto): Promise<void> {
      try { const d = await firstValueFrom(api.create(dto)); patchState(store, { debts: [...store.debts(), d] }); toast.success('Debt created'); }
      catch { toast.error('Failed to create debt'); }
    },
    async recordPayment(debtId: string, dto: RecordPaymentDto): Promise<void> {
      try {
        await firstValueFrom(api.recordPayment(debtId, dto));
        // Reload to get updated debt (with remaining amount)
        await this.loadAll();
        toast.success('Payment recorded');
      } catch { toast.error('Failed to record payment'); }
    },
    async remove(id: string): Promise<void> {
      try { await firstValueFrom(api.delete(id)); patchState(store, { debts: store.debts().filter(d => d.id !== id) }); toast.success('Debt deleted'); }
      catch { toast.error('Failed to delete debt'); }
    },
  })),
);
