import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-card',
  standalone: true,
  templateUrl: './sb-card.component.html',
  styleUrl: './sb-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbCardComponent {
  readonly hoverable = input(false);
  readonly padding   = input<'none' | 'sm' | 'md' | 'lg'>('md');
}
