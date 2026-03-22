import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { TimerStore } from '../../store/timer.store';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { BehaviorCategory, BEHAVIOR_META } from '@shared/models/enums';
import { calculateCoins } from '@shared/utils/coins.util';
import { GsapService } from '@core/animation/gsap.service';

@Component({
  selector: 'sb-live-timer',
  standalone: true,
  imports: [DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './live-timer.component.html',
  styleUrl: './live-timer.component.css',
})
export class LiveTimerComponent implements OnInit, OnDestroy {
  protected readonly store = inject(TimerStore);
  private readonly gsap  = inject(GsapService);

  private intervalId: ReturnType<typeof setInterval> | undefined;

  /** For the SVG ring: total circumference = 2π × 88 ≈ 553 */
  private readonly RING_CIRCUMFERENCE = 553;
  private readonly MAX_SECS = 90 * 60; // 90 min max

  readonly behaviorOptions = [
    BehaviorCategory.Good,
    BehaviorCategory.Neutral,
    BehaviorCategory.Negative
  ].map(value => ({ value, meta: BEHAVIOR_META[value] }));

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.store.tick();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  ringDashoffset(): number {
    const elapsed = this.store.activeTimer().elapsedSecs;
    const progress = Math.min(elapsed / this.MAX_SECS, 1);
    return this.RING_CIRCUMFERENCE * (1 - progress);
  }

  start(): void  { this.store.startTimer(); }
  pause(): void  { this.store.pauseTimer(); }

  stop(): void {
    this.store.stopAndSave();
    this.gsap.coinPop('#live-timer-card');
  }

  discard(): void  { this.store.discardTimer(); }

  setBehavior(type: BehaviorCategory): void {
    this.store.setBehavior(type);
  }

  protected projectedCoins(): number {
    const s = this.store.activeTimer();
    return calculateCoins(s.elapsedSecs, s.behaviorType);
  }
}
