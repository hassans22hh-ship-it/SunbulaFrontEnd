import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthApiService } from '@features/auth/services/auth.api.service';
import { ToastService } from '@shared/ui/toast/toast.service';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbConfirmDialogComponent } from '@shared/ui/confirm-dialog/sb-confirm-dialog.component';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-reset-coins',
  standalone: true,
  imports: [SbButtonComponent, SbCardComponent, PageTransitionDirective, SbConfirmDialogComponent],
  templateUrl: './reset-coins.component.html',
  styleUrl: './reset-coins.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetCoinsComponent {
  private readonly api = inject(AuthApiService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly showConfirm = signal(false);
  readonly isResetting = signal(false);

  confirmReset(): void {
    this.isResetting.set(true);
    this.api.resetCoins().subscribe({
      next: () => {
        this.isResetting.set(false);
        this.showConfirm.set(false);
        this.toast.success('Coins reset successfully');
        this.auth.refreshUserProfile();
      },
      error: () => {
        this.isResetting.set(false);
        this.showConfirm.set(false);
      }
    });
  }
}
