import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  NgZone,
} from '@angular/core';
import { GsapService } from '../../core/animation/gsap.service';

export type AnimateType = 'fadeUp' | 'scaleIn' | 'slideIn' | 'slideLeft';

/**
 * Directive to trigger GSAP animations on element after view init.
 * Usage: <div sbAnimate="fadeUp">
 */
@Directive({
  selector: '[sbAnimate]',
  standalone: true,
})
export class AnimateDirective implements AfterViewInit {
  sbAnimate = input<AnimateType>('fadeUp');
  delay     = input<number>(0);

  private readonly el   = inject(ElementRef);
  private readonly gsap = inject(GsapService);

  ngAfterViewInit(): void {
    const type = this.sbAnimate();
    const el   = this.el.nativeElement as HTMLElement;

    setTimeout(() => {
      switch (type) {
        case 'fadeUp':   this.gsap.slideIn(el, 'up');    break;
        case 'scaleIn':  this.gsap.scaleIn(el);          break;
        case 'slideIn':  this.gsap.slideIn(el, 'right'); break;
        case 'slideLeft': this.gsap.slideIn(el, 'left'); break;
      }
    }, this.delay());
  }
}
