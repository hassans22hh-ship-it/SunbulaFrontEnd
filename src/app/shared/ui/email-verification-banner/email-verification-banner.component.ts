import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthApiService } from '@features/auth/services/auth.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';

@Component({
  selector: 'app-email-verification-banner',
  standalone: true,
  imports: [SbButtonComponent, SbCardComponent],
  templateUrl: './email-verification-banner.component.html',
  styleUrl: './email-verification-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailVerificationBannerComponent {
  private readonly api = inject(AuthApiService);
  private readonly toast = inject(ToastService);

  readonly isSending = signal(false);
  readonly sent = signal(false);

  resend(): void {
    this.isSending.set(true);
    this.api.resendConfirmationEmail().subscribe({
      next: () => {
        this.isSending.set(false);
        this.sent.set(true);
        this.toast.success('Verification email sent! Check your inbox.');
      },
      error: () => {
        this.isSending.set(false);
        // Toast handled by interceptor
      }
    });
  }
}
