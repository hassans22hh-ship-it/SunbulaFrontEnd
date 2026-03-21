import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { ToastComponent } from '../../../shared/ui/toast/toast.component';

@Component({
  selector: 'sb-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="shell-layout">
      <sb-sidebar />
      <div class="shell-main">
        <sb-topbar />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
    <!-- Global toast stack -->
    <sb-toast />
  `,
  styles: [`
    .shell-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg);
    }
    .shell-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }
    .shell-content {
      flex: 1;
      overflow-y: auto;
      background: var(--color-bg);
    }
  `],
})
export class ShellComponent {}
