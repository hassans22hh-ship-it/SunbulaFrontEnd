import { ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { FinancialTransactionDto, CreateFinancialTransactionDto, WalletDto, FinancialCategoryDto, CreateFinancialCategoryDto } from '@shared/models/finance.models';
import { TransactionType } from '@shared/models/enums';
import { EmojiPickerComponent } from '@shared/ui/emoji-picker/emoji-picker.component';
import { FinanceStore } from '../../store/finance.store';

@Component({
  selector: 'sb-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent, EmojiPickerComponent],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFormComponent implements OnInit {
  transaction = input<FinancialTransactionDto | null>(null);
  wallets = input<WalletDto[]>([]);
  categories = input<FinancialCategoryDto[]>([]);
  defaultWalletId = input<string | null>(null);

  saved = output<CreateFinancialTransactionDto>();
  cancelled = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly store = inject(FinanceStore);
  readonly TransactionType = TransactionType;

  readonly activeType = signal<TransactionType>(TransactionType.Expense);
  readonly selectedCategoryId = signal<string | null>(null);
  readonly showAddCategory = signal(false);
  readonly newCatName = signal('');
  readonly newCatIcon = signal('');

  readonly isTransfer = computed(() => this.activeType() === TransactionType.Transfer);

  form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    transactionDate: [new Date().toISOString().split('T')[0]],
    walletId: ['', Validators.required],
    destinationWalletId: [null as string | null],
    description: [''],
  });

  ngOnInit(): void {
    const t = this.transaction();
    if (t) {
      this.activeType.set(t.type);
      this.selectedCategoryId.set(t.financialCategoryId);
      this.form.patchValue({
        amount: t.amount,
        transactionDate: t.transactionDate.split('T')[0],
        walletId: t.walletId,
        destinationWalletId: t.destinationWalletId,
        description: t.description,
      });
    } else {
      if (this.defaultWalletId()) {
        this.form.patchValue({ walletId: this.defaultWalletId() });
      } else if (this.wallets().length > 0) {
        this.form.patchValue({ walletId: this.wallets()[0].id });
      }
    }
  }

  setType(type: TransactionType): void {
    this.activeType.set(type);
    if (type === TransactionType.Transfer) {
      this.selectedCategoryId.set(null);
    }
  }

  selectCategory(id: string): void {
    this.selectedCategoryId.set(id);
  }

  async addCategory(): Promise<void> {
    const name = this.newCatName().trim();
    const icon = this.newCatIcon();
    if (name.length < 2) return;
    await this.store.createCategory({ name, icon } as CreateFinancialCategoryDto);
    this.showAddCategory.set(false);
    this.newCatName.set('');
    this.newCatIcon.set('');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const type = this.activeType();

    const dto: CreateFinancialTransactionDto = {
      walletId: v.walletId!,
      amount: v.amount as number,
      type,
      transactionDate: v.transactionDate ? new Date(v.transactionDate).toISOString() : undefined,
      financialCategoryId: type === TransactionType.Transfer ? undefined : (this.selectedCategoryId() || undefined),
      destinationWalletId: type === TransactionType.Transfer ? (v.destinationWalletId || undefined) : undefined,
      description: v.description || undefined,
    };

    this.saved.emit(dto);
  }
}
