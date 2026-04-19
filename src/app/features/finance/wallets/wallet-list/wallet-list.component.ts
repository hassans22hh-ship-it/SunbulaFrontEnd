import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FinanceStore } from '@features/finance/store/finance.store';
import { WalletDto, CreateWalletDto, UpdateWalletDto, FinancialTransactionDto } from '@shared/models/finance.models';
import { TransactionType, TRANSACTION_TYPE_META } from '@shared/models/enums';
import { WalletCardComponent } from '../wallet-card/wallet-card.component';
import { WalletFormComponent } from '../wallet-form/wallet-form.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'sb-wallet-list',
  standalone: true,
  imports: [
    RouterLink, WalletCardComponent, WalletFormComponent,
    SbSpinnerComponent, SbEmptyStateComponent, SbConfirmDialogComponent,
    PageTransitionDirective, DatePipe, DecimalPipe,
  ],
  providers: [FinanceStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-list.component.html',
  styleUrl: './wallet-list.component.scss',
})
export class WalletListComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly titleService = inject(Title);
  protected readonly TransactionType = TransactionType;
  protected readonly txMeta = TRANSACTION_TYPE_META;

  showForm = signal(false);
  editingWallet = signal<WalletDto | null>(null);
  selectedWalletId = signal<string | null>(null);
  walletTransactions = signal<FinancialTransactionDto[]>([]);
  showDeleteConfirm = signal(false);
  deletingWallet = signal<WalletDto | null>(null);

  ngOnInit(): void {
    this.titleService.setTitle('Wallets | Sunbula');
    this.store.loadAll();
  }

  formatCurrency(value: number, currency: string = 'EGP'): string {
    return new Intl.NumberFormat('Engen-Us', { style: 'currency', currency }).format(value);
  }

  openForm(wallet: WalletDto | null = null): void {
    this.editingWallet.set(wallet);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingWallet.set(null);
  }

  async selectWallet(wallet: WalletDto): Promise<void> {
    if (this.selectedWalletId() === wallet.id) {
      this.selectedWalletId.set(null);
      this.walletTransactions.set([]);
      return;
    }
    this.selectedWalletId.set(wallet.id);
    await this.store.loadTransactionsByWallet(wallet.id);
    this.walletTransactions.set(
      this.store.transactions().filter(t => t.walletId === wallet.id)
    );
  }

  onFormSave(event: { dto: CreateWalletDto | UpdateWalletDto; isEdit: boolean }): void {
    if (event.isEdit && this.editingWallet()) {
      this.store.updateWallet(this.editingWallet()!.id, event.dto as UpdateWalletDto);
    } else {
      this.store.createWallet(event.dto as CreateWalletDto);
    }
    this.closeForm();
  }

  requestDelete(wallet: WalletDto): void {
    this.deletingWallet.set(wallet);
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const w = this.deletingWallet();
    if (w) {
      this.store.deleteWallet(w.id);
      if (this.selectedWalletId() === w.id) {
        this.selectedWalletId.set(null);
        this.walletTransactions.set([]);
      }
    }
    this.showDeleteConfirm.set(false);
    this.closeForm();
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
    this.deletingWallet.set(null);
  }

  getTypeColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.Income: return 'var(--color-success)';
      case TransactionType.Expense: return 'var(--color-danger)';
      case TransactionType.Transfer: return 'var(--color-info)';
    }
  }
}
