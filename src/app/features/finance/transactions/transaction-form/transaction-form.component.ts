import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { TransactionDto, CreateTransactionDto, WalletDto, FinancialCategoryDto } from '@features/finance/models/finance.models';
import { TransactionType } from '@shared/models/enums';

@Component({
  selector: 'sb-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sb-modal
      [title]="transaction() ? 'Edit Transaction' : 'New Transaction'"
      maxWidth="500px"
      (closed)="cancelled.emit()"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
        
        <!-- Transaction Type -->
        <div class="flex gap-2 mb-6 bg-surface-2 p-1 rounded-lg border border-border">
           <button type="button" class="flex-1 py-1.5 text-sm font-medium rounded-md transition-colors"
                   [class.bg-surface]="form.value.type === TransactionType.Income"
                   [class.text-success]="form.value.type === TransactionType.Income"
                   [class.shadow-sm]="form.value.type === TransactionType.Income"
                   (click)="form.patchValue({ type: TransactionType.Income })">
             Income
           </button>
           <button type="button" class="flex-1 py-1.5 text-sm font-medium rounded-md transition-colors"
                   [class.bg-surface]="form.value.type === TransactionType.Expense"
                   [class.text-danger]="form.value.type === TransactionType.Expense"
                   [class.shadow-sm]="form.value.type === TransactionType.Expense"
                   (click)="form.patchValue({ type: TransactionType.Expense })">
             Expense
           </button>
           <button type="button" class="flex-1 py-1.5 text-sm font-medium rounded-md transition-colors"
                   [class.bg-surface]="form.value.type === TransactionType.Transfer"
                   [class.text-primary]="form.value.type === TransactionType.Transfer"
                   [class.shadow-sm]="form.value.type === TransactionType.Transfer"
                   (click)="form.patchValue({ type: TransactionType.Transfer })">
             Transfer
           </button>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- Amount -->
          <div class="form-group col-span-1">
            <label class="label-text">Amount</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-subtle font-medium">$</span>
              <input class="input-field pl-8 font-display text-lg" type="number" formControlName="amount" placeholder="0.00" step="0.01">
            </div>
          </div>
          
          <!-- Date -->
          <div class="form-group col-span-1">
            <label class="label-text">Date</label>
            <input class="input-field" type="date" formControlName="transactionDate">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- Wallet (From) -->
          <div class="form-group col-span-1">
            <label class="label-text">{{ form.value.type === TransactionType.Transfer ? 'From Wallet' : 'Wallet' }}</label>
            <select class="input-field" formControlName="walletId">
              @for (w of wallets(); track w.id) {
                <option [value]="w.id">{{ w.name }} ({{ w.balance }})</option>
              }
            </select>
          </div>

          <!-- Category OR To Wallet -->
          <div class="form-group col-span-1">
            @if (form.value.type === TransactionType.Transfer) {
              <label class="label-text">To Wallet</label>
              <select class="input-field" formControlName="toWalletId">
                @for (w of wallets(); track w.id) {
                  <option [value]="w.id" [disabled]="w.id === form.value.walletId">{{ w.name }}</option>
                }
              </select>
            } @else {
              <label class="label-text">Category</label>
              <select class="input-field" formControlName="categoryId">
                <option [value]="null">Select Category...</option>
                @for (c of categoriesForType(); track c.id) {
                  <option [value]="c.id">{{ c.icon }} {{ c.name }}</option>
                }
              </select>
            }
          </div>
        </div>
        
        <!-- Notes -->
        <div class="form-group mb-6">
          <label class="label-text">Notes / Description (Optional)</label>
          <input class="input-field" type="text" formControlName="notes" placeholder="What was this for?">
        </div>

        <div class="flex justify-end gap-3">
           <sb-button variant="ghost" (clicked)="cancelled.emit()">Cancel</sb-button>
           <sb-button type="submit" [disabled]="form.invalid">
             {{ transaction() ? 'Save Changes' : 'Record Transaction' }}
           </sb-button>
        </div>

      </form>
    </sb-modal>
  `,
  styles: [`
    .text-success { color: var(--color-success); }
    .text-danger  { color: var(--color-danger); }
    .text-primary { color: var(--color-primary); }
    .text-subtle  { color: var(--color-text-muted); }
    .bg-surface   { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
    .font-display { font-family: var(--font-display); }
  `]
})
export class TransactionFormComponent implements OnInit {
  transaction = input<TransactionDto | null>(null);
  wallets     = input<WalletDto[]>([]);
  categories  = input<FinancialCategoryDto[]>([]);
  defaultWalletId = input<string | null>(null);

  saved = output<CreateTransactionDto>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);
  readonly TransactionType = TransactionType;

  form = this.fb.group({
    amount:          [null as number | null, [Validators.required, Validators.min(0.01)]],
    type:            [TransactionType.Expense, Validators.required],
    transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
    walletId:        ['', Validators.required],
    categoryId:      [null as string | null],
    toWalletId:      [null as string | null],
    notes:           ['']
  });

  ngOnInit(): void {
    const t = this.transaction();
    if (t) {
      // Logic for editing (typically only notes or category can be edited easily depending on backend)
      // We will allow full edit here assuming backend handles reverse balancing
      this.form.patchValue({
        amount: t.amount,
        type: t.type,
        transactionDate: t.transactionDate.split('T')[0],
        walletId: t.walletId,
        categoryId: t.categoryId,
        notes: t.notes
      });
    } else {
      // Default creation state
      if (this.defaultWalletId()) {
        this.form.patchValue({ walletId: this.defaultWalletId() });
      } else if (this.wallets().length > 0) {
        this.form.patchValue({ walletId: this.wallets()[0].id });
      }
    }
    
    // Cross validation logic (e.g. required toWalletId if transfer) could be added here
  }

  categoriesForType(): FinancialCategoryDto[] {
    const t = this.form.value.type;
    return this.categories().filter(c => c.type === t);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const v = this.form.getRawValue();
    
    const dto: CreateTransactionDto = {
      walletId:        v.walletId!,
      amount:          v.amount as number,
      type:            v.type!,
      transactionDate: new Date(v.transactionDate!).toISOString(),
      categoryId:      v.type === TransactionType.Transfer ? null : v.categoryId,
      toWalletId:      v.type === TransactionType.Transfer ? v.toWalletId : null,
      notes:           v.notes
    };

    this.saved.emit(dto);
  }
}
