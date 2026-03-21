import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
} from '@angular/core';
import { GsapService } from './gsap.service';

/**
 * Apply this to every page container element for consistent page-enter animation.
 * Usage: <div sbPage>...</div>
 */
@Directive({
  selector: '[sbPage]',
  standalone: true,
})
export class PageTransitionDirective implements AfterViewInit {
  private readonly el   = inject(ElementRef);
  private readonly gsap = inject(GsapService);

  ngAfterViewInit(): void {
    this.gsap.pageEnter(this.el.nativeElement);
  }
}
