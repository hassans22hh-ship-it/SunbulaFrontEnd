import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize     = 'sm' | 'md' | 'lg';

@Component({
  selector: 'sb-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [class]="buttonClass()"
      [disabled]="disabled() || loading()"
      [type]="type()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span class="sb-spinner-xs"></span>
      }
      <ng-content />
    </button>
  `,
  styles: [`
    :host { display: contents; }
    .sb-spinner-xs {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    button:disabled { opacity: 0.55; cursor: not-allowed; pointer-events: none; }
  `],
})
export class SbButtonComponent {
  variant  = input<ButtonVariant>('primary');
  size     = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  loading  = input<boolean>(false);
  type     = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  protected buttonClass(): string {
    const v = this.variant();
    const s = this.size();
    const fw = this.fullWidth() ? 'w-full' : '';

    const variantMap: Record<ButtonVariant, string> = {
      primary:   'btn-primary',
      secondary: 'btn-secondary',
      ghost:     'btn-ghost',
      danger:    'btn-danger',
    };

    const sizeMap: Record<ButtonSize, string> = {
      sm:  'text-xs px-3 py-1.5',
      md:  '',
      lg:  'text-base px-6 py-3',
    };

    return [variantMap[v], sizeMap[s], fw].filter(Boolean).join(' ');
  }
}
