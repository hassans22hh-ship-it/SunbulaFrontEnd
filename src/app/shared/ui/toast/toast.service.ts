import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id:       string;
  type:     ToastType;
  message:  string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private show(type: ToastType, message: string, duration = 4000): void {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { id, type, message, duration }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(message: string, duration?: number): void { this.show('success', message, duration); }
  error(message: string, duration?: number): void   { this.show('error', message, duration ?? 5000); }
  warning(message: string, duration?: number): void { this.show('warning', message, duration); }
  info(message: string, duration?: number): void    { this.show('info', message, duration); }

  remove(id: string): void {
    this.toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
