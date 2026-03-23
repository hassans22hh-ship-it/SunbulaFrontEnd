import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FinanceStore } from './store/finance.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WalletType, TransactionType, WALLET_TYPE_META, TRANSACTION_TYPE_META } from '@shared/models/enums';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { DecimalPipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'sb-finance',
  standalone: true,
  imports: [SbCardComponent, SbButtonComponent, SbModalComponent, SbSpinnerComponent, SbEmptyStateComponent, ReactiveFormsModule, RelativeDatePipe, DecimalPipe, PageTransitionDirective],
  providers: [FinanceStore],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly fb = inject(FormBuilder);
  readonly tab = signal<'wallets' | 'transactions' | 'categories'>('wallets');
  readonly showWalletForm = signal(false);
  readonly showTxForm = signal(false);
  readonly showCatForm = signal(false);
  protected readonly walletTypes = [WalletType.Cash, WalletType.Bank, WalletType.Card];
  protected readonly txTypes = [TransactionType.Income, TransactionType.Expense, TransactionType.Transfer];
  protected readonly walletMeta = WALLET_TYPE_META;
  protected readonly txMeta = TRANSACTION_TYPE_META;

  readonly walletForm = this.fb.nonNullable.group({ name: ['', Validators.required], type: [WalletType.Cash], currency: ['SAR'], openingBalance: [0] });
  readonly txForm = this.fb.nonNullable.group({ walletId: ['', Validators.required], type: [TransactionType.Income], amount: [0, [Validators.required, Validators.min(0.01)]], description: [''], financialCategoryId: [''], destinationWalletId: [''], transactionDate: [''] });
  readonly catForm = this.fb.nonNullable.group({ name: ['', Validators.required] });

  ngOnInit(): void { this.store.loadAll(); }
  createWallet(): void { if (this.walletForm.invalid) return; this.store.createWallet(this.walletForm.getRawValue()); this.showWalletForm.set(false); }
  createTx(): void { if (this.txForm.invalid) return; this.store.createTransaction(this.txForm.getRawValue()); this.showTxForm.set(false); }
  createCat(): void { if (this.catForm.invalid) return; this.store.createCategory(this.catForm.getRawValue()); this.showCatForm.set(false); }
}
