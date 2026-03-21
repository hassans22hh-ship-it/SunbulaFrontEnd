import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { WalletDto, CreateWalletDto, UpdateWalletDto } from '@features/finance/models/finance.models';
import { WalletType, WALLET_META } from '@shared/models/enums';

const WALLET_COLORS = [
  '#0F172A', // Slate 900 (Dark)
  '#4338CA', // Indigo
  '#0369A1', // Sky
  '#15803D', // Green
  '#B45309', // Amber
  '#BE123C', // Rose
  '#7C3AED', // Violet
];

@Component({
  selector: 'sb-wallet-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sb-modal
      [title]="wallet() ? 'Edit Wallet' : 'New Wallet'"
      maxWidth="450px"
      (closed)="cancelled.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <div class="form-group mb-4">
          <label class="label-text">Wallet Name</label>
          <input class="input-field" type="text" formControlName="name" placeholder="e.g. Main Checking">
          @if (form.get('name')?.touched && form.get('name')?.hasError('required')) {
            <span class="error-text">Name is required</span>
          }
        </div>

        <div class="form-group mb-4">
          <label class="label-text">Wallet Type</label>
          <div class="grid grid-cols-2 gap-2">
            @for (t of typeOptions; track t.value) {
              <button
                type="button"
                class="type-select-btn"
                [class.selected]="form.value.walletType === t.value"
                (click)="form.patchValue({ walletType: t.value })"
              >
                {{ t.meta.emoji }} {{ t.meta.label }}
              </button>
            }
          </div>
        </div>

        @if (!wallet()) {
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="form-group">
              <label class="label-text">Initial Balance</label>
              <input class="input-field" type="number" formControlName="initialBalance" placeholder="0.00">
            </div>
            <div class="form-group">
              <label class="label-text">Currency</label>
              <select class="input-field" formControlName="currency">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SAR">SAR (ر.س)</option>
              </select>
            </div>
          </div>
        }

        <div class="form-group mb-6">
          <label class="label-text">Card Color</label>
          <div class="flex gap-2 flex-wrap">
            @for (color of walletColors; track color) {
              <button
                type="button"
                [style.background]="color"
                [class.selected]="form.value.color === color"
                class="color-btn"
                (click)="form.patchValue({ color: color })"
              ></button>
            }
          </div>
        </div>

        <div class="flex justify-between items-center mt-2">
           @if (wallet()) {
             <button type="button" class="text-danger text-sm font-medium hover:underline" (click)="onDeleteRequest()">
               Delete Wallet
             </button>
           } @else { <span></span> }
           
           <div class="flex gap-3">
             <sb-button variant="ghost" (clicked)="cancelled.emit()">Cancel</sb-button>
             <sb-button type="submit" [disabled]="form.invalid">
               {{ wallet() ? 'Save' : 'Create' }}
             </sb-button>
           </div>
        </div>

      </form>
    </sb-modal>
  `,
  styles: [`
    .type-select-btn {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 0.5rem;
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-text);
      transition: all 0.2s;
    }
    .type-select-btn:hover { background: var(--color-surface-2); }
    .type-select-btn.selected {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 5%, transparent);
      box-shadow: 0 0 0 1px var(--color-primary);
    }
    .color-btn {
      width: 32px; height: 32px; border-radius: 50%;
      border: 2px solid transparent; cursor: pointer; transition: transform 0.1s;
    }
    .color-btn:hover { transform: scale(1.1); }
    .color-btn.selected { border-color: white; outline: 2px solid var(--color-primary); }
    .error-text { color: var(--color-danger); font-size: 0.8rem; margin-top: 0.25rem; display: block; }
    .text-danger { color: var(--color-danger); background: none; border: none; cursor: pointer; }
  `]
})
export class WalletFormComponent implements OnInit {
  wallet = input<WalletDto | null>(null);
  
  saved = output<{ dto: CreateWalletDto | UpdateWalletDto, isEdit: boolean }>();
  cancelled = output<void>();
  deleteRequested = output<WalletDto>();

  private readonly fb = inject(FormBuilder);
  readonly walletColors = WALLET_COLORS;

  readonly typeOptions = [
    WalletType.Cash, WalletType.Bank, WalletType.CreditCard, WalletType.EWallet
  ].map(value => ({ value, meta: WALLET_META[value] }));

  form = this.fb.group({
    name:           ['', Validators.required],
    walletType:     [WalletType.Cash, Validators.required],
    initialBalance: [0],
    currency:       ['USD'],
    color:          ['#0F172A']
  });

  ngOnInit(): void {
    const w = this.wallet();
    if (w) {
      this.form.patchValue({
        name: w.name,
        walletType: w.walletType,
        color: w.color || '#0F172A',
        // currency/balance not editable on update
      });
      // Disable the balance/currency fields via form array or just hide them (hidden in template)
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    const isEdit = !!this.wallet();

    const dto = isEdit 
      ? { name: v.name!, walletType: v.walletType!, color: v.color } as UpdateWalletDto
      : { 
          name: v.name!, 
          walletType: v.walletType!, 
          color: v.color, 
          initialBalance: v.initialBalance, 
          currency: v.currency 
        } as CreateWalletDto;

    this.saved.emit({ dto, isEdit });
  }

  onDeleteRequest(): void {
    const w = this.wallet();
    if (w) this.deleteRequested.emit(w);
  }
}
