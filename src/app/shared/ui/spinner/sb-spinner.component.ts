import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-spinner',
  standalone: true,
  templateUrl: './sb-spinner.component.html',
  styleUrl: './sb-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbSpinnerComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
}
