import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

interface NavItem {
  path:  string;
  label: string;
  icon:  string; // This will now correspond to a case in the SVG switch
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',  label: 'Dashboard',   icon: 'dashboard' },
  { path: '/tasks',      label: 'Tasks',        icon: 'tasks' },
  { path: '/timer',      label: 'Timer',        icon: 'timer' },
  { path: '/library',    label: 'Library',      icon: 'library' },
  { path: '/settings',   label: 'Settings',     icon: 'settings' },
];

@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly auth     = inject(AuthService);
  private readonly router     = inject(Router);
  protected readonly navItems = NAV_ITEMS;
  readonly collapsed          = signal(false);

  protected toggleCollapse(): void {
    this.collapsed.update(v => !v);
  }

  protected onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  protected userInitials(): string {
    const u = this.auth.user();
    if (!u) return '?';
    return (u.firstName[0] ?? '') + (u.lastName[0] ?? '');
  }
}
