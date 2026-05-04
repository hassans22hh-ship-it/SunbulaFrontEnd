import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'sb-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);

  protected icon(type: string): string {
    switch (type) {
      case 'success': return '<i class="fa-solid fa-circle-check"></i>';
      case 'error':   return '<i class="fa-solid fa-circle-xmark"></i>';
      case 'warning': return '<i class="fa-solid fa-triangle-exclamation"></i>';
      case 'info':    return '<i class="fa-solid fa-circle-info"></i>';
      default:        return '';
    }
  }
}
