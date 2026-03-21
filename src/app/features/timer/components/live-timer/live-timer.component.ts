import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TimerStore } from '../store/timer.store';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';
import { BehaviorCategory, BEHAVIOR_META } from '@shared/models/enums';
import { calculateCoins } from '@shared/utils/coins.util';
import { GsapService } from '@core/animation/gsap.service';

@Component({
  selector: 'sb-live-timer',
  standalone: true,
  imports: [DurationPipe, DatePipe, SbButtonComponent, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="live-timer-card">
      <div class="timer-display" [class.is-running]="store.activeTimer().isRunning">
        {{ store.activeTimer().elapsedSecs | duration:'hh:mm:ss' }}
      </div>

      <div class="timer-controls mt-6 flex justify-center gap-4">
        @if (!store.activeTimer().isRunning && store.activeTimer().elapsedSecs === 0) {
          <!-- Just started -->
          <button class="circle-btn start" (click)="start()" title="Start">▶</button>
        } @else if (store.activeTimer().isRunning) {
          <!-- Running -->
          <button class="circle-btn pause" (click)="pause()" title="Pause">⏸</button>
          <button class="circle-btn stop" (click)="stop()" title="Stop & Save">⏹</button>
        } @else {
          <!-- Paused -->
          <button class="circle-btn start" (click)="start()" title="Resume">▶</button>
          <button class="circle-btn stop" (click)="stop()" title="Stop & Save">⏹</button>
          <button class="circle-btn discard" (click)="discard()" title="Discard">✕</button>
        }
      </div>

      <div class="mt-8">
        <label class="block text-sm font-medium text-center text-subtle mb-3">
          What are you doing?
        </label>
        <div class="flex justify-center gap-3 flex-wrap">
          @for (b of behaviorOptions; track b.value) {
            <button
              class="behavior-pill"
              [class.active]="store.activeTimer().behaviorType === b.value"
              [style.--pill-color]="b.meta.color"
              (click)="setBehavior(b.value)"
              [disabled]="store.activeTimer().isRunning"
            >
              {{ b.meta.emoji }} {{ b.meta.label }}
            </button>
          }
        </div>
      </div>

      <div class="mt-6 text-center text-sm font-medium">
        <span class="text-subtle">Est. Reward: </span>
        <span class="text-warning font-bold">🪙 {{ projectedCoins() }}</span>
      </div>
    </div>
  `,
  styles: [`
    .live-timer-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      padding: 3rem 2rem;
      box-shadow: var(--shadow-lg);
      max-width: 500px;
      margin: 0 auto;
    }
    .timer-display {
      font-family: var(--font-mono);
      font-size: 5rem;
      font-weight: 700;
      text-align: center;
      line-height: 1;
      color: var(--color-text);
      transition: color 0.3s;
      letter-spacing: -2px;
      font-variant-numeric: tabular-nums;
    }
    .timer-display.is-running {
      color: var(--color-primary);
      text-shadow: 0 0 20px color-mix(in srgb, var(--color-primary) 30%, transparent);
    }
    .circle-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      cursor: pointer;
      transition: transform 0.15s, background 0.15s, box-shadow 0.15s;
      color: white;
    }
    .circle-btn:hover { transform: scale(1.05); }
    .circle-btn:active { transform: scale(0.95); }
    .circle-btn.start { background: var(--color-primary); box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 40%, transparent); }
    .circle-btn.pause { background: var(--color-warning); box-shadow: 0 4px 12px color-mix(in srgb, var(--color-warning) 40%, transparent); }
    .circle-btn.stop { background: var(--color-danger); box-shadow: 0 4px 12px color-mix(in srgb, var(--color-danger) 40%, transparent); }
    .circle-btn.discard { background: var(--color-surface-2); color: var(--color-text); border: 1px solid var(--color-border); }

    .behavior-pill {
      background: var(--color-surface-2);
      border: 1px solid var(--color-border);
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: all 0.2s;
    }
    .behavior-pill:not(:disabled):hover {
      background: color-mix(in srgb, var(--pill-color) 10%, transparent);
      color: var(--pill-color);
      border-color: var(--pill-color);
    }
    .behavior-pill.active {
      background: color-mix(in srgb, var(--pill-color) 15%, transparent);
      color: var(--pill-color);
      border-color: var(--pill-color);
      box-shadow: 0 0 0 1px var(--pill-color);
    }
    .behavior-pill:disabled { opacity: 0.6; cursor: not-allowed; }
    .text-subtle { color: var(--color-text-muted); }
    .text-warning { color: var(--color-warning); }
  `]
})
export class LiveTimerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TimerStore);
  private readonly gsap  = inject(GsapService);
  
  private intervalId: any;

  readonly behaviorOptions = [
    BehaviorCategory.Good,
    BehaviorCategory.Neutral,
    BehaviorCategory.Bad
  ].map(value => ({ value, meta: BEHAVIOR_META[value] }));

  ngOnInit(): void {
    // Start interval loop if timer is already running (from reload)
    // We tick every second locally. Precision might slip slightly compared to Date.now diffing,
    // but for this v1 simulation it provides smooth visual feedback.
    this.intervalId = setInterval(() => {
      this.store.tick();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  start(): void {
    this.store.startTimer();
  }

  pause(): void {
    this.store.pauseTimer();
  }

  stop(): void {
    this.store.stopAndSave();
    this.gsap.coinPop('.live-timer-card');
  }

  discard(): void {
    this.store.discardTimer();
  }

  setBehavior(type: number): void {
    this.store.setBehavior(type);
  }

  protected projectedCoins(): number {
    const s = this.store.activeTimer();
    return calculateCoins(s.elapsedSecs, s.behaviorType);
  }
}
