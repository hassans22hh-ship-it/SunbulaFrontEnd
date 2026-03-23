import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { DebtsStore } from './store/debts.store';
import { AuthService } from '@core/auth/auth.service';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbBadgeComponent } from '@shared/ui/badge/sb-badge.component';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DebtDto, DebtType, CreateDebtDto } from '@shared/models/debt.models';
import { DecimalPipe } from '@angular/common';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

const DEBT_TYPE_META: Record<DebtType, { label: string; variant: 'danger' | 'success' }> = {
  'OWED_BY_ME': { label: 'I Owe', variant: 'danger' },
  'OWED_TO_ME': { label: 'Owed To Me', variant: 'success' },
};

@Component({
  selector: 'sb-debts',
  standalone: true,
  imports: [SbCardComponent, SbButtonComponent, SbModalComponent, SbSpinnerComponent, SbEmptyStateComponent, SbBadgeComponent, SbConfirmDialogComponent, ReactiveFormsModule, DecimalPipe, PageTransitionDirective],
  providers: [DebtsStore],
  templateUrl: './debts.component.html',
  styleUrl: './debts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DebtsComponent implements OnInit {
  protected readonly store = inject(DebtsStore);
  protected readonly auth  = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly tab = signal<'active' | 'settled'>('active');
  readonly showCreate = signal(false);
  readonly showPayment = signal(false);
  readonly showDelete = signal(false);
  readonly selectedDebt = signal<DebtDto | null>(null);
  
  readonly debtTypes: DebtType[] = ['OWED_TO_ME', 'OWED_BY_ME'];
  readonly debtMeta = DEBT_TYPE_META;
  
  readonly createForm = this.fb.nonNullable.group({
    personName: ['', Validators.required],
    type: this.fb.nonNullable.control<DebtType>('OWED_TO_ME'),
    amount: [0, [Validators.required, Validators.min(0.01)]],
    description: [''],
    dueDate: ['']
  });
  
  // walletId is required for RecordPaymentDto
  readonly paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    note: [''],
    walletId: ['cash', Validators.required] 
  });

  ngOnInit(): void { this.store.loadAll(); }

  onCreate(): void { 
    if (this.createForm.invalid) return; 
    const val = this.createForm.getRawValue();
    const dto: CreateDebtDto = {
      type: val.type,
      amount: val.amount,
      personEntity: val.personName,
      dueDate: val.dueDate || undefined
    };
    this.store.create(dto); 
    this.showCreate.set(false);
    this.createForm.reset({ personName: '', type: 'OWED_TO_ME', amount: 0, description: '', dueDate: '' });
  }

  openPayment(debt: DebtDto): void { 
    this.selectedDebt.set(debt);
    this.paymentForm.reset({ amount: 0, note: '', walletId: 'cash' }); 
    this.showPayment.set(true); 
  }

  onPayment(): void {
    const d = this.selectedDebt();
    if (!d || this.paymentForm.invalid) return;
    this.store.recordPayment(d.id, this.paymentForm.getRawValue());
    this.showPayment.set(false);
  }

  confirmDelete(debt: DebtDto): void { 
    this.selectedDebt.set(debt); 
    this.showDelete.set(true); 
  }

  onDelete(): void { 
    const d = this.selectedDebt(); 
    if (d) this.store.remove(d.id); 
    this.showDelete.set(false); 
  }
}
