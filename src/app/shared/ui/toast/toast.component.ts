import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { GsapService } from '../../../core/animation/gsap.service';
import { Toast, ToastService } from './toast.service';

const TOAST_ICONS: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

const TOAST_COLORS: Record<string, string> = {
  success: 'var(--color-success)',
  error:   'var(--color-danger)',
  warning: 'var(--color-warning)',
  info:    'var(--color-info)',
};

@Component({
  selector: 'sb-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
      style="max-width: 360px; width: 100%;"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast-item flex items-start gap-3 p-4 rounded-xl shadow-lg"
          style="
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            box-shadow: var(--shadow-lg);
            animation: toastSlideIn 0.3s var(--ease-smooth) both;
          "
        >
          <span
            class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
            [style.background]="toastColor(toast)"
          >{{ toastIcon(toast) }}</span>
          <p style="margin: 0; font-size: 0.875rem; color: var(--color-text); line-height: 1.4; flex: 1;">
            {{ toast.message }}
          </p>
          <button
            (click)="toastService.remove(toast.id)"
            style="
              background: none; border: none; cursor: pointer;
              color: var(--color-text-muted); font-size: 1rem; padding: 0;
              line-height: 1; flex-shrink: 0;
            "
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected toastIcon(toast: Toast): string {
    return TOAST_ICONS[toast.type] ?? 'ℹ';
  }

  protected toastColor(toast: Toast): string {
    return TOAST_COLORS[toast.type] ?? 'var(--color-info)';
  }
}
