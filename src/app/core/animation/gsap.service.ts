/* core/animation/gsap.service.ts */
import { Injectable, inject, NgZone } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, Flip, TextPlugin);

@Injectable({ providedIn: 'root' })
export class GsapService {
  private readonly zone = inject(NgZone);

  // All GSAP runs outside NgZone — no unnecessary change detection
  run<T>(fn: () => T): T {
    return this.zone.runOutsideAngular(fn);
  }

  staggerIn(targets: string | Element[], from: { y?: number; x?: number; scale?: number } = { y: 24 }) {
    return this.run(() => gsap.from(targets, {
      opacity: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', ...from,
    }));
  }

  slideIn(target: string | Element, dir: 'up' | 'down' | 'left' | 'right' = 'up') {
    const map = { up: { y: 28 }, down: { y: -28 }, left: { x: 28 }, right: { x: -28 } };
    return this.run(() => gsap.from(target, { opacity: 0, duration: 0.4, ease: 'power3.out', ...map[dir] }));
  }

  scaleIn(target: string | Element) {
    return this.run(() => gsap.from(target, { scale: 0.88, opacity: 0, duration: 0.35, ease: 'back.out(2)' }));
  }

  countTo(element: HTMLElement, end: number, duration = 1.2) {
    return this.run(() => {
      const obj = { val: 0 };
      return gsap.to(obj, {
        val: end, duration, ease: 'power2.out',
        onUpdate: () => { element.textContent = Math.round(obj.val).toLocaleString('en-US'); },
      });
    });
  }

  coinPop(target: string | Element) {
    return this.run(() => gsap.timeline()
      .to(target, { scale: 1.45, duration: 0.14, ease: 'back.out(3)' })
      .to(target, { scale: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' })
    );
  }

  pulseRing(target: string | Element) {
    return this.run(() => gsap.to(target, {
      scale: 1.8, opacity: 0, duration: 1.2, ease: 'power1.out', repeat: -1, transformOrigin: 'center',
    }));
  }

  modalIn(target: string | Element) {
    return this.run(() => gsap.from(target, { scale: 0.9, opacity: 0, y: 16, duration: 0.35, ease: 'back.out(1.5)' }));
  }

  scrollReveal(trigger: string) {
    return this.run(() => gsap.from(trigger, {
      opacity: 0, y: 40, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger, start: 'top 85%', toggleActions: 'play none none none' },
    }));
  }

  pageEnter(el: Element) {
    return this.run(() => gsap.from(el, { opacity: 0, y: 14, duration: 0.38, ease: 'power3.out' }));
  }
}
