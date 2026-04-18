import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FinanceStore } from '@features/finance/store/finance.store';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { FinancialTransactionDto, WalletDto } from '@shared/models/finance.models';
import { TransactionType } from '@shared/models/enums';

@Component({
  selector: 'sb-transaction-list',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, TransactionFormComponent, SbButtonComponent, SbEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent {
  protected readonly store = inject(FinanceStore);
  readonly TransactionType = TransactionType;

  selectedWalletId = input<string | null>(null);

  showForm = signal(false);

  filteredTransactions(): FinancialTransactionDto[] {
    const selected = this.selectedWalletId();
    const all = this.store.transactions();
    if (!selected) return all;
    return all.filter((t: FinancialTransactionDto) => t.walletId === selected);
  }

  getWalletName(id: string): string {
    const w = this.store.wallets().find((x: WalletDto) => x.id === id);
    return w ? w.name : 'Unknown Wallet';
  }

  getIconForType(type: number): string {
    switch(type) {
      case TransactionType.Income: return '↓'; // Money in
      case TransactionType.Expense: return '↑'; // Money out
      case TransactionType.Transfer: return '⇄';
      default: return '•';
    }
  }

  getLabelForType(type: number): string {
    switch(type) {
      case TransactionType.Income: return 'Income';
      case TransactionType.Expense: return 'Expense';
      case TransactionType.Transfer: return 'Transfer';
      default: return 'Transaction';
    }
  }

  onFormSave(dto: any): void {
    this.store.createTransaction(dto);
    this.showForm.set(false);
  }

  onDelete(t: FinancialTransactionDto): void {
    if (confirm('Delete this transaction? This will automatically reverse the wallet balance.')) {
      this.store.removeTransaction(t.id);
    }
  }
}
