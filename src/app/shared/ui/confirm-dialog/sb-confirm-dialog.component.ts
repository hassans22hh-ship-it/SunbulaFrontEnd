import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SbButtonComponent } from '../button/sb-button.component';

@Component({
  selector: 'sb-confirm-dialog',
  standalone: true,
  imports: [SbButtonComponent],
  templateUrl: './sb-confirm-dialog.component.html',
  styleUrl: './sb-confirm-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbConfirmDialogComponent {
  readonly title       = input('Are you sure?');
  readonly message     = input('');
  readonly confirmText = input('Confirm');
  readonly cancelText  = input('Cancel');
  readonly variant     = input<'danger' | 'primary'>('danger');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();
}
