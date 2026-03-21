import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { GsapService } from '../../animation/gsap.service';
import { CoinsPipe } from '../../../shared/pipes/coins.pipe';

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
  { path: '/store',      label: 'Plant Store',  icon: '🌱' },
  { path: '/settings',   label: 'Settings',     icon: '⚙️' },
];

@Component({
  selector: 'sb-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CoinsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside [class.collapsed]="collapsed()" class="sb-sidebar">
      <!-- Logo -->
      <div class="sb-sidebar-logo">
        <span class="logo-icon">🌻</span>
        @if (!collapsed()) {
          <span class="logo-text">Sunbula</span>
        }
      </div>

      <!-- Coin balance -->
      @if (!collapsed()) {
        <div class="coin-badge mx-3 mb-4 justify-center">
          <span>🪙</span>
          <span>{{ auth.coinBalance() | coins:false }}</span>
          <span style="font-size:0.7rem; font-weight:500; opacity:0.7;">coins</span>
        </div>
      }

      <!-- Navigation -->
      <nav class="sb-nav">
        @for (item of navItems; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="active"
            class="sb-nav-item"
            [title]="collapsed() ? item.label : ''"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            @if (!collapsed()) {
              <span class="nav-label">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Collapse Toggle -->
      <button class="collapse-btn" (click)="toggleCollapse()">
        {{ collapsed() ? '→' : '←' }}
      </button>

      <!-- User -->
      @if (!collapsed()) {
        <div class="sb-sidebar-user">
          <div class="user-avatar">{{ userInitials() }}</div>
          <div>
            <div style="font-weight: 600; font-size: 0.875rem; color: var(--color-text);">
              {{ auth.user()?.fullName }}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">
              🔥 {{ auth.streakDays() }} day streak
            </div>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .sb-sidebar {
      display:        flex;
      flex-direction: column;
      width:          240px;
      min-height:     100vh;
      background:     var(--color-surface);
      border-right:   1px solid var(--color-border);
      padding:        1rem 0.5rem;
      transition:     width 0.3s var(--ease-smooth);
      flex-shrink:    0;
      position:       sticky;
      top:            0;
      height:         100vh;
      overflow-y:     auto;
    }
    .sb-sidebar.collapsed { width: 68px; }

    .sb-sidebar-logo {
      display:         flex;
      align-items:     center;
      gap:             0.5rem;
      padding:         0.5rem 0.75rem 1.25rem;
      font-family:     var(--font-display);
    }
    .logo-icon { font-size: 1.75rem; }
    .logo-text {
      font-size:   1.25rem;
      font-weight: 800;
      color:       var(--color-text);
      letter-spacing: -0.02em;
    }

    .sb-nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }

    .sb-nav-item {
      display:         flex;
      align-items:     center;
      gap:             0.75rem;
      padding:         0.625rem 0.75rem;
      border-radius:   var(--radius-md);
      text-decoration: none;
      color:           var(--color-text-muted);
      font-size:       0.9rem;
      font-weight:     500;
      transition:      background 0.15s, color 0.15s;
    }
    .sb-nav-item:hover {
      background: var(--color-surface-2);
      color:      var(--color-text);
    }
    .sb-nav-item.active {
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color:      var(--color-primary);
      font-weight: 600;
    }
    .nav-icon { font-size: 1.1rem; flex-shrink: 0; }
    .nav-label { white-space: nowrap; overflow: hidden; }

    .collapse-btn {
      background:    none;
      border:        1px solid var(--color-border);
      border-radius: var(--radius-md);
      color:         var(--color-text-muted);
      cursor:        pointer;
      padding:       0.4rem;
      margin:        0.5rem 0.25rem;
      font-size:     0.8rem;
      align-self:    flex-end;
    }
    .collapse-btn:hover { background: var(--color-surface-2); }

    .sb-sidebar-user {
      display:         flex;
      align-items:     center;
      gap:             0.75rem;
      padding:         0.75rem;
      border-top:      1px solid var(--color-border);
      margin-top:      auto;
    }
    .user-avatar {
      width:           36px;
      height:          36px;
      border-radius:   50%;
      background:      var(--color-primary);
      color:           white;
      display:         flex;
      align-items:     center;
      justify-content: center;
      font-weight:     700;
      font-size:       0.875rem;
      flex-shrink:     0;
    }
  `],
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
