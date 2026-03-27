import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/theme/theme.service';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';

@Component({
  selector: 'sb-topbar',
  standalone: true,
  imports: [CoinsPipe, SbIconCoinComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly auth  = inject(AuthService);
  protected readonly theme = inject(ThemeService);

  protected async logout(): Promise<void> {
    await this.auth.logout();
  }
}
