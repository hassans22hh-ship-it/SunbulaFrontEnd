import { Directive, ElementRef, inject, output } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({ selector: '[sbClickOutside]', standalone: true })
export class ClickOutsideDirective {
  private readonly el  = inject(ElementRef);
  private readonly doc = inject(DOCUMENT);

  readonly sbClickOutside = output<void>();

  constructor() {
    this.doc.addEventListener('click', (event: Event) => {
      if (!this.el.nativeElement.contains(event.target)) {
        this.sbClickOutside.emit();
      }
    });
  }
}
