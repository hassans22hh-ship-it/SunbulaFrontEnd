import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FinanceStore } from '@features/finance/store/finance.store';
import { WalletDto, CreateWalletDto, UpdateWalletDto } from '@features/finance/models/finance.models';
import { WalletCardComponent } from './wallet-card/wallet-card.component';
import { WalletFormComponent } from './wallet-form/wallet-form.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-wallet-list',
  standalone: true,
  imports: [WalletCardComponent, WalletFormComponent, SbButtonComponent, SbSpinnerComponent, SbEmptyStateComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col pt-6 pb-2" sbPage>
      
      <!-- Header Area -->
      <div class="flex justify-between items-end mb-6" sbAnimate="slideLeft">
        <div>
          <h2 class="section-title">My Wallets</h2>
          <div class="mt-2 text-2xl font-bold text-text font-display tracking-tight">
            <span class="text-sm font-medium text-subtle mr-2 tracking-normal uppercase relative -top-1">Total Balance</span>
            {{ formatCurrency(store.totalBalance()) }}
          </div>
        </div>
        
        <sb-button variant="secondary" (clicked)="openForm()">+ Add Wallet</sb-button>
      </div>

      <!-- List Area -->
      <div class="flex-1 overflow-y-auto pb-4 custom-scrollbar" sbAnimate="fadeUp">
        @if (store.isLoading() && store.allWallets().length === 0) {
          <div class="py-12 flex justify-center"><sb-spinner /></div>
        } @else if (store.allWallets().length === 0) {
          <sb-empty-state 
            title="No Wallets" 
            message="Create a wallet to start tracking your finances." 
            icon="💳" 
          />
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (w of store.allWallets(); track w.id) {
              <sb-wallet-card 
                [wallet]="w" 
                [selected]="w.id === store.selectedWalletId()"
                (clicked)="store.selectWallet(w.id)"
                (editClicked)="openForm(w)"
              />
            }
          </div>
        }
      </div>

      <!-- Form logic -->
      @if (showForm()) {
        <sb-wallet-form
          [wallet]="editingWallet()"
          (saved)="onFormSave($event)"
          (cancelled)="closeForm()"
          (deleteRequested)="onDeleteRequest($event)"
        />
      }

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .font-display { font-family: var(--font-display); }
  `]
})
export class WalletListComponent implements OnInit {
  protected readonly store = inject(FinanceStore);
  private readonly titleService = inject(Title);

  showForm = signal(false);
  editingWallet = signal<WalletDto | null>(null);

  ngOnInit(): void {
    this.titleService.setTitle('Wallets | Sunbula');
    if (this.store.allWallets().length === 0) {
      this.store.loadAll();
    }
  }

  formatCurrency(value: number): string {
    // Assuming a global base currency for the aggregate view initially
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  openForm(wallet: WalletDto | null = null): void {
    this.editingWallet.set(wallet);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editingWallet.set(null);
  }

  onFormSave(event: { dto: CreateWalletDto | UpdateWalletDto, isEdit: boolean }): void {
    if (event.isEdit && this.editingWallet()) {
      this.store.editWallet({ id: this.editingWallet()!.id, dto: event.dto as UpdateWalletDto });
    } else {
      this.store.addWallet(event.dto as CreateWalletDto);
    }
    this.closeForm();
  }

  onDeleteRequest(wallet: WalletDto): void {
    if (confirm(`Are you sure you want to delete ${wallet.name}? This might remove associated transactions.`)) {
      this.store.deleteWallet(wallet.id);
      this.closeForm();
    }
  }
}
