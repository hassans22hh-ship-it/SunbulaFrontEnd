import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-badge',
  standalone: true,
  templateUrl: './sb-badge.component.html',
  styleUrl: './sb-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbBadgeComponent {
  readonly variant = input<'default' | 'success' | 'danger' | 'warning' | 'info'>('default');
  readonly size    = input<'sm' | 'md'>('sm');
}
