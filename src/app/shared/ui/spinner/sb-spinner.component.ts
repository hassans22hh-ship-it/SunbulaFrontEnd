import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sb-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="sb-spinner"></div>
    </div>
  `,
  styles: [`
    .sb-spinner {
      width: 36px;
      height: 36px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class SbSpinnerComponent {}
