import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '@shared/ui/toast/toast.component';
import { EmailVerificationBannerComponent } from '@shared/ui/email-verification-banner/email-verification-banner.component';
import { AuthService } from '@core/auth/auth.service';
import { MiniTimerBarComponent } from '../mini-timer-bar/mini-timer-bar.component';

@Component({
  selector: 'sb-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent, EmailVerificationBannerComponent, MiniTimerBarComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
}
