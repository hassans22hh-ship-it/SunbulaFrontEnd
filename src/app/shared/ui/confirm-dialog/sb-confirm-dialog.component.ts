import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { SbModalComponent } from '../modal/sb-modal.component';
import { SbButtonComponent } from '../button/sb-button.component';

@Component({
  selector: 'sb-confirm-dialog',
  standalone: true,
  imports: [SbModalComponent, SbButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sb-modal [title]="title()" maxWidth="400px" (closed)="cancelled.emit()">
      <p style="color: var(--color-text-muted); margin: 0 0 1.5rem; font-size: 0.9375rem;">
        {{ message() }}
      </p>
      <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
        <sb-button variant="ghost" (clicked)="cancelled.emit()">Cancel</sb-button>
        <sb-button [variant]="destructive() ? 'danger' : 'primary'" (clicked)="confirmed.emit()">
          {{ confirmLabel() }}
        </sb-button>
      </div>
    </sb-modal>
  `,
})
export class SbConfirmDialogComponent {
  title        = input<string>('Confirm Action');
  message      = input<string>('Are you sure you want to proceed?');
  confirmLabel = input<string>('Confirm');
  destructive  = input<boolean>(false);

  confirmed = output<void>();
  cancelled = output<void>();
}
