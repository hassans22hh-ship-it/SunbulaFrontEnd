import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FinanceStore } from '@features/finance/store/finance.store';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { TransactionDto } from '@features/finance/models/finance.models';
import { TransactionType } from '@shared/models/enums';

@Component({
  selector: 'sb-transaction-list',
  standalone: true,
  imports: [DatePipe, TransactionFormComponent, SbButtonComponent, SbEmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-semibold text-lg text-text">
          @if (store.selectedWallet()) {
            Recent Transactions
          } @else {
            All Transactions
          }
        </h3>
        
        <sb-button size="sm" (clicked)="showForm.set(true)" [disabled]="store.allWallets().length === 0">
          + Record
        </sb-button>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
        @if (filteredTransactions().length === 0) {
          <sb-empty-state 
            icon="🧾" 
            title="No transactions" 
            message="No financial history found for this view." 
          />
        } @else {
          <div class="space-y-3">
            @for (t of filteredTransactions(); track t.id) {
              <div class="flex justify-between items-center p-3 rounded-xl hover:bg-surface-2 transition-colors group">
                
                <div class="flex items-center gap-4">
                  <!-- Icon indicator -->
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                       [class.bg-success-light]="t.type === TransactionType.Income"
                       [class.text-success]="t.type === TransactionType.Income"
                       [class.bg-danger-light]="t.type === TransactionType.Expense"
                       [class.text-danger]="t.type === TransactionType.Expense"
                       [class.bg-primary-light]="t.type === TransactionType.Transfer"
                       [class.text-primary]="t.type === TransactionType.Transfer">
                    {{ getIconForType(t.type) }}
                  </div>
                  
                  <div>
                    <div class="font-medium text-text text-sm">{{ t.notes || getLabelForType(t.type) }}</div>
                    <div class="text-xs text-subtle mt-0.5">
                      {{ t.transactionDate | date:'MMM d, y' }}
                      @if (!store.selectedWalletId()) {
                        • {{ getWalletName(t.walletId) }}
                      }
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end">
                  <span class="font-semibold"
                        [class.text-success]="t.type === TransactionType.Income"
                        [class.text-text]="t.type === TransactionType.Expense || t.type === TransactionType.Transfer">
                    {{ t.type === TransactionType.Expense ? '-' : (t.type === TransactionType.Income ? '+' : '') }}{{ t.amount | currency }}
                  </span>
                  
                  <!-- Delete button (visible on hover) -->
                  <button class="text-[10px] text-danger opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider mt-1"
                          (click)="onDelete(t)">
                    Delete
                  </button>
                </div>

              </div>
            }
          </div>
        }
      </div>

      @if (showForm()) {
        <sb-transaction-form 
          [wallets]="store.allWallets()"
          [categories]="store.allCategories()"
          [defaultWalletId]="store.selectedWalletId()"
          (saved)="onFormSave($event)"
          (cancelled)="showForm.set(false)"
        />
      }

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }

    .text-success { color: var(--color-success); }
    .bg-success-light { background: color-mix(in srgb, var(--color-success) 15%, transparent); }
    
    .text-danger { color: var(--color-danger); }
    .bg-danger-light { background: color-mix(in srgb, var(--color-danger) 15%, transparent); }
    
    .text-primary { color: var(--color-primary); }
    .bg-primary-light { background: color-mix(in srgb, var(--color-primary) 15%, transparent); }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class TransactionListComponent {
  protected readonly store = inject(FinanceStore);
  readonly TransactionType = TransactionType;

  showForm = signal(false);

  filteredTransactions(): TransactionDto[] {
    const selected = this.store.selectedWalletId();
    const all = this.store.allTransactions();
    if (!selected) return all;
    return all.filter(t => t.walletId === selected);
  }

  getWalletName(id: string): string {
    const w = this.store.allWallets().find(x => x.id === id);
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
    this.store.addTransaction(dto);
    this.showForm.set(false);
  }

  onDelete(t: TransactionDto): void {
    if (confirm('Delete this transaction? This will automatically reverse the wallet balance.')) {
      this.store.deleteTransaction({ id: t.id, walletId: t.walletId, amount: t.amount, type: t.type });
    }
  }
}
