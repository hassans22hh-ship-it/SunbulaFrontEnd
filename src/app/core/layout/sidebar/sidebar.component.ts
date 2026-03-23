import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { CoinsPipe } from '@shared/pipes/coins.pipe';

interface NavItem {
  path:  string;
  label: string;
  icon:  string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',  label: 'Dashboard',   icon: '📊' },
  { path: '/tasks',      label: 'Tasks',        icon: '✅' },
  { path: '/folders',    label: 'Folders',      icon: '📁' },
  { path: '/timer',      label: 'Timer',        icon: '⏱️' },
  { path: '/timeline',   label: 'Timeline',     icon: '📅' },
  { path: '/reports',    label: 'Reports',      icon: '📈' },
  { path: '/finance',    label: 'Finance',      icon: '💰' },
  { path: '/debts',      label: 'Debts',        icon: '📋' },
  { path: '/store',      label: 'Plant Store',  icon: '🌱' },
  { path: '/settings',   label: 'Settings',     icon: '⚙️' },
];

@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CoinsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly auth     = inject(AuthService);
  protected readonly navItems = NAV_ITEMS;
  readonly collapsed          = signal(false);

  protected toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }

  protected userInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return (u.firstName[0] ?? '') + (u.lastName[0] ?? '');
  }
}
