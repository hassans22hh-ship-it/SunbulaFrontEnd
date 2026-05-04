import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { AuthApiService } from '../services/auth.api.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sb-verify-email',
  standalone: true,
  imports: [CommonModule, SbButtonComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailComponent {
  private readonly auth = inject(AuthService);
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly loading = signal(false);
  readonly message = signal<{ text: string, type: 'success' | 'error' } | null>(null);

  onResendEmail(): void {
    this.loading.set(true);
    this.message.set(null);

    this.api.resendConfirmationEmail().subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set({ text: 'Confirmation email sent! Please check your inbox.', type: 'success' });
      },
      error: (err) => {
        this.loading.set(false);
        this.message.set({ text: err.message || 'Failed to resend email. Please try again later.', type: 'error' });
      }
    });
  }

  async onRefreshStatus(): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.refreshUserProfile();
      if (this.auth.isEmailConfirmed()) {
        this.router.navigate(['/tasks']);
      } else {
        this.message.set({ text: 'Email not yet confirmed. Please check your email.', type: 'error' });
      }
    } catch {
      this.message.set({ text: 'Failed to refresh profile. Please try again.', type: 'error' });
    } finally {
      this.loading.set(false);
    }
  }

  async onLogout(): Promise<void> {
    await this.auth.logout();
  }
}
