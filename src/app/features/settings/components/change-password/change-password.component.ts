import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '@features/auth/services/auth.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule, SbButtonComponent, SbCardComponent, PageTransitionDirective],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordComponent {
  private readonly api = inject(AuthApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword:    ['', Validators.required],
    newPassword:        ['', [Validators.required, Validators.minLength(6)]],
    confirmNewPassword: ['', Validators.required],
  });

  submit(): void {
    if (this.passwordForm.invalid) return;
    const val = this.passwordForm.getRawValue();
    if (val.newPassword !== val.confirmNewPassword) {
      this.toast.error('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.api.changePassword(val).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Password changed successfully');
        this.passwordForm.reset();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
