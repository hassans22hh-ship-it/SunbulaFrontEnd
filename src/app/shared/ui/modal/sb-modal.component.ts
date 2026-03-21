import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { GsapService } from '../../../core/animation/gsap.service';

@Component({
  selector: 'sb-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);"
      (click)="onBackdropClick($event)"
    >
      <!-- Panel -->
      <div
        #panel
        class="modal-panel relative w-full overflow-hidden"
        [style.max-width]="maxWidth()"
        style="
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
        "
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        @if (title()) {
          <div class="flex items-center justify-between p-6 pb-4"
               style="border-bottom: 1px solid var(--color-border);">
            <h2 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; color: var(--color-text); margin: 0;">
              {{ title() }}
            </h2>
            @if (closable()) {
              <button
                (click)="closed.emit()"
                style="
                  display:flex; align-items:center; justify-content:center;
                  width:32px; height:32px; border:none; border-radius:var(--radius-md);
                  background:var(--color-surface-2); color:var(--color-text-muted);
                  cursor:pointer; font-size:1.1rem; transition:background 0.15s;
                "
              >✕</button>
            }
          </div>
        }
        <!-- Body -->
        <div class="p-6">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class SbModalComponent implements AfterViewInit {
  title    = input<string>('');
  maxWidth = input<string>('480px');
  closable = input<boolean>(true);
  closeOnBackdrop = input<boolean>(true);

  closed = output<void>();

  private readonly gsap  = inject(GsapService);
  private readonly panel = viewChild<ElementRef>('panel');

  ngAfterViewInit(): void {
    const el = this.panel()?.nativeElement;
    if (el) this.gsap.modalIn(el);
  }

  protected onBackdropClick(e: MouseEvent): void {
    e.stopPropagation();
    if (this.closeOnBackdrop()) this.closed.emit();
  }
}
