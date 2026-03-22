import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GsapService } from '../../animation/gsap.service';
import { CoinsPipe } from '../../../shared/pipes/coins.pipe';

@Component({
  selector: 'sb-topbar',
  standalone: true,
  imports: [CoinsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css',
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
