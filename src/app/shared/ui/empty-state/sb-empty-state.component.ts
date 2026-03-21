import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { SbButtonComponent } from '../button/sb-button.component';

@Component({
  selector: 'sb-empty-state',
  standalone: true,
  imports: [SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
      @if (icon()) {
        <span style="font-size: 3rem; margin-bottom: 1rem; display: block;">{{ icon() }}</span>
      }
      <h3 style="
        font-family: var(--font-display);
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 0.5rem;
      ">{{ title() }}</h3>
      @if (message()) {
        <p style="font-size: 0.9rem; color: var(--color-text-muted); margin: 0 0 1.5rem; max-width: 280px;">
          {{ message() }}
        </p>
      }
      @if (showRetry()) {
        <sb-button variant="secondary" (clicked)="retry.emit()">
          Try Again
        </sb-button>
      }
      <ng-content />
    </div>
  `,
})
export class SbEmptyStateComponent {
  icon      = input<string>('🌿');
  title     = input<string>('Nothing here yet');
  message   = input<string>('');
  showRetry = input<boolean>(false);

  retry = output<void>();
}
