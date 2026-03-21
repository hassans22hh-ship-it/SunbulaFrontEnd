import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sb-coin-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 class="font-semibold text-lg text-text justify-between flex items-center mb-4">
        <span>Coin Economy Details</span>
        <span class="text-xl">🪙</span>
      </h3>
      
      <p class="text-sm text-subtle mb-6">
        Sunbula's productivity economy rewards you with virtual coins based on your behavior.
        Here is the current reward mapping applied automatically when you complete tasks and sessions.
      </p>

      <div class="space-y-4">
        
        <div class="flex justify-between items-center py-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">🎯</span>
            <span class="font-medium text-text">Deep Work / Focus</span>
          </div>
          <div class="text-success font-bold">+10 / hr</div>
        </div>

        <div class="flex justify-between items-center py-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded bg-success/10 text-success flex items-center justify-center">✅</span>
            <span class="font-medium text-text">Task Completion</span>
          </div>
          <div class="text-success font-bold">+5 each</div>
        </div>
        
        <div class="flex justify-between items-center py-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded bg-warning/10 text-warning flex items-center justify-center">⚠️</span>
            <span class="font-medium text-text">Procrastination Alert</span>
          </div>
          <div class="text-danger font-bold">-2 each</div>
        </div>

        <div class="flex justify-between items-center py-2 border-b border-border">
          <div class="flex items-center gap-2">
            <span class="w-8 h-8 rounded bg-danger/10 text-danger flex items-center justify-center">🚫</span>
            <span class="font-medium text-text">Distraction Detected</span>
          </div>
          <div class="text-danger font-bold">-5 each</div>
        </div>

      </div>
      
      <div class="mt-6 bg-surface-2 p-4 rounded-xl text-xs text-subtle text-center">
        These rates are fixed and governed by the system economy to maintain balance.
      </div>

    </div>
  `,
  styles: [`
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .bg-surface { background: var(--color-surface); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
    
    .bg-primary\\/10 { background: color-mix(in srgb, var(--color-primary) 10%, transparent); }
    .text-primary { color: var(--color-primary); }
    
    .bg-success\\/10 { background: color-mix(in srgb, var(--color-success) 10%, transparent); }
    .text-success { color: var(--color-success); }
    
    .bg-warning\\/10 { background: color-mix(in srgb, var(--color-warning) 10%, transparent); }
    .text-warning { color: var(--color-warning); }
    
    .bg-danger\\/10 { background: color-mix(in srgb, var(--color-danger) 10%, transparent); }
    .text-danger { color: var(--color-danger); }
  `]
})
export class CoinSettingsComponent {
  // Read-only info component for v1
}
