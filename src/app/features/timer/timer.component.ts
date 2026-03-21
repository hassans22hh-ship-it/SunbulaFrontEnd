import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LiveTimerComponent } from './components/live-timer/live-timer.component';
import { SessionListComponent } from './components/session-list/session-list.component';
import { AnimateDirective } from '@shared/directives/animate.directive';

@Component({
  selector: 'sb-timer-page',
  standalone: true,
  imports: [LiveTimerComponent, SessionListComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container" sbPage>
      <div class="mb-8" sbAnimate="slideLeft">
        <h1 class="section-title">Focus Timer</h1>
        <p class="text-subtle mt-1 text-sm">Track your deep work and earn coins.</p>
      </div>

      <div class="max-w-2xl mx-auto" sbAnimate="scaleIn">
        <sb-live-timer />
        <sb-session-list />
      </div>
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
  `]
})
export class TimerPageComponent {}
