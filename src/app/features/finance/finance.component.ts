import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceStore } from './store/finance.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { TransactionFormComponent } from './transactions/transaction-form/transaction-form.component';
import { DecimalPipe, DatePipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { FinancialTransactionDto } from '@shared/models/finance.models';
import { TransactionType, TRANSACTION_TYPE_META } from '@shared/models/enums';

@Component({
  selector: 'sb-finance',
  standalone: true,
  imports: [
    RouterLink, SbSpinnerComponent,
    SbEmptyStateComponent, SbConfirmDialogComponent, TransactionFormComponent,
    DecimalPipe, DatePipe, PageTransitionDirective,
  ],
  providers: [FinanceStore],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  protected readonly txMeta = TRANSACTION_TYPE_META;
  protected readonly TransactionType = TransactionType;

  readonly showTxForm = signal(false);
  readonly editingTx = signal<FinancialTransactionDto | null>(null);
  readonly showDeleteConfirm = signal(false);
  readonly deletingTxId = signal<string | null>(null);

  readonly selectedMonth = signal(new Date().toISOString().slice(0, 7)); // "YYYY-MM"

  readonly sortedTransactions = computed(() => {
    const txs = this.store.transactions();
    return [...txs].sort((a, b) =>
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
  });

  ngOnInit(): void {
    this.store.loadAll('SAR');
  }

  openAddTx(): void {
    this.editingTx.set(null);
    this.showTxForm.set(true);
  }

  openEditTx(tx: FinancialTransactionDto): void {
    this.editingTx.set(tx);
    this.showTxForm.set(true);
    this.store.setSelectedTransaction(null);
  }

  closeTxForm(): void {
    this.showTxForm.set(false);
    this.editingTx.set(null);
  }

  onTxFormSaved(dto: any): void {
    const editing = this.editingTx();
    if (editing) {
      this.store.updateTransaction(editing.id, dto);
    } else {
      this.store.createTransaction(dto);
    }
    this.closeTxForm();
  }

  selectTransaction(tx: FinancialTransactionDto): void {
    const current = this.store.selectedTransaction();
    if (current?.id === tx.id) {
      this.store.setSelectedTransaction(null);
    } else {
      this.store.setSelectedTransaction(tx);
    }
  }

  confirmDeleteTx(id: string): void {
    this.deletingTxId.set(id);
    this.showDeleteConfirm.set(true);
  }

  onDeleteConfirmed(): void {
    const id = this.deletingTxId();
    if (id) {
      this.store.removeTransaction(id);
    }
    this.showDeleteConfirm.set(false);
    this.deletingTxId.set(null);
  }

  onDeleteCancelled(): void {
    this.showDeleteConfirm.set(false);
    this.deletingTxId.set(null);
  }

  getTypeColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income: return 'var(--color-success)';
      case TransactionType.Expense: return 'var(--color-danger)';
      case TransactionType.Transfer: return 'var(--color-info)';
    }
  }
}
