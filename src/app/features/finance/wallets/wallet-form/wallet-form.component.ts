import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { WalletDto, CreateWalletDto, UpdateWalletDto } from '@shared/models/finance.models';
import { WalletType, WALLET_TYPE_META } from '@shared/models/enums';

@Component({
  selector: 'sb-wallet-form',
  standalone: true,
  imports: [ReactiveFormsModule, SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wallet-form.component.html',
  styleUrl: './wallet-form.component.scss',
})
export class WalletFormComponent implements OnInit {
  wallet = input<WalletDto | null>(null);

  saved = output<{ dto: CreateWalletDto | UpdateWalletDto; isEdit: boolean }>();
  cancelled = output<void>();
  deleteRequested = output<WalletDto>();

  private readonly fb = inject(FormBuilder);

  readonly typeOptions = [
    WalletType.Cash, WalletType.Bank, WalletType.Card,
  ].map(value => ({ value, meta: WALLET_TYPE_META[value] }));

  form = this.fb.group({
    name: ['', Validators.required],
    type: [WalletType.Cash, Validators.required],
    initialBalance: [0],
    currency: ['EGP'],
  });

  ngOnInit(): void {
    const w = this.wallet();
    if (w) {
      this.form.patchValue({
        name: w.name,
        type: w.type as unknown as WalletType,
      });
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
      ? { name: v.name!, type: v.type! } as UpdateWalletDto
      : {
        name: v.name!,
        type: v.type!,
        openingBalance: v.initialBalance,
        currency: v.currency,
      } as CreateWalletDto;

    this.saved.emit({ dto, isEdit });
  }

  onDeleteRequest(): void {
    const w = this.wallet();
    if (w) this.deleteRequested.emit(w);
  }
}
