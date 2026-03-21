import {
  Directive,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';

/**
 * Emits when a click event occurs outside the host element.
 * Usage: <div (clickOutside)="close()">
 */
@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective implements OnInit, OnDestroy {
  clickOutside = output<void>();

  private readonly el   = inject(ElementRef);
  private readonly zone = inject(NgZone);

  private listener!: (e: MouseEvent) => void;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.listener = (e: MouseEvent) => {
        if (!this.el.nativeElement.contains(e.target)) {
          this.zone.run(() => this.clickOutside.emit());
        }
      };
      document.addEventListener('click', this.listener, true);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.listener, true);
  }
}
