import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AuthService } from '@core/auth/auth.service';
import { ThemeService } from '@core/theme/theme.service';
import { SidebarService } from '../sidebar/sidebar.service';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';
import { effect } from '@angular/core';

@Component({
  selector: 'sb-topbar',
  standalone: true,
  imports: [CoinsPipe, SbIconCoinComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  protected readonly auth  = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly sidebarService = inject(SidebarService);

  protected coinAnimating = false;
  private prevCoinBalance = 0;
  private dateInterval: any;

  readonly todayLabel = this.buildDateLabel();

  private buildDateLabel(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  ngOnInit(): void {
    this.prevCoinBalance = this.auth.coinBalance();
    this.dateInterval = setInterval(() => {
      const current = this.auth.coinBalance();
      if (current !== this.prevCoinBalance) {
        this.coinAnimating = true;
        this.prevCoinBalance = current;
        setTimeout(() => { this.coinAnimating = false; }, 500);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.dateInterval) clearInterval(this.dateInterval);
  }

  protected getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  protected getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
  }
}
