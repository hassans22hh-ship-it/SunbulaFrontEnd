/* core/layout/shell/shell.component.ts */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'sb-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex h-screen bg-bg text-text">
      <!-- Sidebar Placeholder -->
      <aside class="w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div class="p-6 border-b border-border">
          <h1 class="text-2xl font-display font-bold text-primary">Sunbula</h1>
        </div>
        <nav class="flex-1 p-4">
          <ul class="space-y-2">
            <li><a class="flex items-center gap-3 p-3 rounded-md hover:bg-surface-2 transition-colors">Dashboard</a></li>
            <li><a class="flex items-center gap-3 p-3 rounded-md hover:bg-surface-2 transition-colors">Tasks</a></li>
            <li><a class="flex items-center gap-3 p-3 rounded-md hover:bg-surface-2 transition-colors">Timer</a></li>
          </ul>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar Placeholder -->
        <header class="h-16 border-b border-border bg-surface flex items-center justify-between px-6">
          <div class="md:hidden">
             <h1 class="text-xl font-display font-bold text-primary">Sunbula</h1>
          </div>
          <div></div>
          <div class="flex items-center gap-4">
             <div class="coin-badge">0 🪙</div>
             <div class="w-8 h-8 rounded-full bg-primary-light"></div>
          </div>
        </header>

        <!-- Route Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {}
