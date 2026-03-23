import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-empty-state',
  standalone: true,
  templateUrl: './sb-empty-state.component.html',
  styleUrl: './sb-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbEmptyStateComponent {
  readonly icon    = input<string>('📭');
  readonly heading = input<string>('Nothing here yet');
  readonly message = input<string>('');
}
