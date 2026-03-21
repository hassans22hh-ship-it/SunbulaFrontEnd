import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'sb-theme-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 class="font-semibold text-lg text-text mb-4">Appearance</h3>
      
      <div class="space-y-6">
        
        <div>
          <div class="font-medium text-text mb-3">Color Scheme</div>
          <div class="flex gap-4">
            <!-- Light -->
            <button 
              class="theme-btn" 
              [class.active]="currentTheme() === 'light'"
              (click)="setTheme('light')"
            >
              <div class="w-full h-16 bg-[#f8fafc] rounded-t-lg border-b border-gray-200">
                <div class="h-2 w-1/3 bg-gray-300 rounded m-2"></div>
                <div class="h-8 w-2/3 bg-white border border-gray-200 shadow-sm rounded mx-2"></div>
              </div>
              <div class="py-2 text-sm font-medium text-gray-800">Light</div>
            </button>

            <!-- Dark -->
            <button 
              class="theme-btn" 
              [class.active]="currentTheme() === 'dark'"
              (click)="setTheme('dark')"
            >
              <div class="w-full h-16 bg-[#0f172a] rounded-t-lg border-b border-[#1e293b]">
                <div class="h-2 w-1/3 bg-[#334155] rounded m-2"></div>
                <div class="h-8 w-2/3 bg-[#1e293b] border border-[#334155] shadow-sm rounded mx-2"></div>
              </div>
              <div class="py-2 text-sm font-medium text-gray-200 bg-[#1e293b] rounded-b-lg">Dark</div>
            </button>
          </div>
          <p class="text-xs text-subtle mt-2">Choose how Sunbula looks to you. This affects all pages but not your avatar.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface { background: var(--color-surface); }
    .border-border { border-color: var(--color-border); }

    .theme-btn {
      width: 120px;
      border: 2px solid transparent;
      border-radius: 0.75rem;
      background: transparent;
      padding: 0;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .theme-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .theme-btn.active {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
  `]
})
export class ThemeSettingsComponent {
  
  // Real implementation connects this to a dark mode service/signal
  // For the SPA prototype, let's grab the actual DOM state
  currentTheme = signal<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    
    // Direct DOM manipulation for simplicity in Tailwind v4 dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
}
