import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'sb-button',
  standalone: true,
  templateUrl: './sb-button.component.html',
  styleUrl: './sb-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbButtonComponent {
  readonly variant  = input<'primary' | 'outline' | 'danger' | 'ghost'>('primary');
  readonly size     = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);
  readonly loading  = input(false);
  readonly type     = input<'button' | 'submit'>('button');
  readonly fullWidth = input(false);
}
