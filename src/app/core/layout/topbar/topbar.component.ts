import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GsapService } from '../../animation/gsap.service';
import { CoinsPipe } from '../../../shared/pipes/coins.pipe';

@Component({
  selector: 'sb-topbar',
  standalone: true,
  imports: [CoinsPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sb-topbar">
      <!-- Left: page title slot -->
      <div class="topbar-left">
        <ng-content />
      </div>

      <!-- Right: Coins + Theme + User -->
      <div class="topbar-right">
        <!-- Coin Balance -->
        <div #coinEl class="coin-badge">
          <span>🪙</span>
          <span>{{ auth.coinBalance() | coins:false }}</span>
        </div>

        <!-- Streak -->
        <div class="streak-badge">
          🔥 <span>{{ auth.streakDays() }}</span>
        </div>

        <!-- Theme Toggle -->
        <button class="icon-btn" (click)="toggleTheme()" [title]="isDark() ? 'Switch to Light' : 'Switch to Dark'">
          {{ isDark() ? '☀️' : '🌙' }}
        </button>

        <!-- Logout -->
        <button class="icon-btn" (click)="logout()" title="Logout">
          🚪
        </button>
      </div>
    </header>
  `,
  styles: [`
    .sb-topbar {
      display:         flex;
      align-items:     center;
      justify-content: space-between;
      padding:         0 1.5rem;
      height:          60px;
      background:      var(--color-surface);
      border-bottom:   1px solid var(--color-border);
      position:        sticky;
      top:             0;
      z-index:         40;
    }

    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .topbar-right { display: flex; align-items: center; gap: 0.75rem; }

    .streak-badge {
      display:       inline-flex;
      align-items:   center;
      gap:           0.25rem;
      font-size:     0.875rem;
      font-weight:   700;
      color:         var(--color-warning);
      font-family:   var(--font-mono);
    }

    .icon-btn {
      background:    none;
      border:        none;
      cursor:        pointer;
      font-size:     1.1rem;
      padding:       0.375rem;
      border-radius: var(--radius-md);
      display:       flex;
      align-items:   center;
      transition:    background 0.15s;
    }
    .icon-btn:hover { background: var(--color-surface-2); }
  `],
})
export class TopbarComponent {
  protected readonly auth   = inject(AuthService);
  private readonly router   = inject(Router);
  private readonly gsap     = inject(GsapService);
  private readonly coinEl   = viewChild<ElementRef>('coinEl');

  isDark = signal(document.documentElement.getAttribute('data-theme') === 'dark');

  protected toggleTheme(): void {
    const next = this.isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sb_theme', next);
    this.isDark.set(next === 'dark');
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
  }
}
