import { Directive, ElementRef, inject, AfterViewInit } from '@angular/core';
import { GsapService } from './gsap.service';

@Directive({ selector: '[sbPageTransition]', standalone: true })
export class PageTransitionDirective implements AfterViewInit {
  private readonly el   = inject(ElementRef);
  private readonly gsap = inject(GsapService);

  ngAfterViewInit(): void {
    this.gsap.pageEnter(this.el.nativeElement);
  }
}
