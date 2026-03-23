import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'sb-modal',
  standalone: true,
  templateUrl: './sb-modal.component.html',
  styleUrl: './sb-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SbModalComponent {
  readonly title = input<string>('');
  readonly size  = input<'sm' | 'md' | 'lg'>('md');
  readonly close = output<void>();

  protected onBackdropClick(): void {
    this.close.emit();
  }

  protected onContentClick(event: Event): void {
    event.stopPropagation();
  }
}
