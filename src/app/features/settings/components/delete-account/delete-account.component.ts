import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '@features/auth/services/auth.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [ReactiveFormsModule, SbButtonComponent, SbCardComponent, PageTransitionDirective, SbConfirmDialogComponent],
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteAccountComponent {
  private readonly api = inject(AuthApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly showConfirm = signal(false);
  readonly isDeleting = signal(false);

  readonly deleteForm = this.fb.nonNullable.group({
    password: ['', Validators.required],
  });

  confirmDelete(): void {
    if (this.deleteForm.invalid) return;
    this.isDeleting.set(true);
    this.api.deleteAccount(this.deleteForm.getRawValue().password).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.toast.success('Account deleted successfully');
        this.auth.logout();
      },
      error: () => {
        this.isDeleting.set(false);
        this.showConfirm.set(false);
      }
    });
  }
}
