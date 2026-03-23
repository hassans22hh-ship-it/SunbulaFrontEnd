import { Directive, ElementRef, inject, input, AfterViewInit } from '@angular/core';
import { GsapService } from '@core/animation/gsap.service';

@Directive({ selector: '[sbAnimate]', standalone: true })
export class AnimateDirective implements AfterViewInit {
  private readonly el   = inject(ElementRef);
  private readonly gsap = inject(GsapService);

  readonly sbAnimate = input<'fadeInUp' | 'slideIn' | 'scaleIn' | 'staggerIn'>('fadeInUp');
  readonly animateDelay = input<number>(0);

  ngAfterViewInit(): void {
    const el = this.el.nativeElement;
    const delay = this.animateDelay();

    switch (this.sbAnimate()) {
      case 'fadeInUp':
        this.gsap.slideIn(el, 'up');
        break;
      case 'slideIn':
        this.gsap.slideIn(el);
        break;
      case 'scaleIn':
        this.gsap.scaleIn(el);
        break;
      case 'staggerIn':
        this.gsap.staggerIn(el);
        break;
    }
  }
}
