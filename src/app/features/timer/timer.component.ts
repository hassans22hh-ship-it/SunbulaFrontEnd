import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { TimerStore } from './store/timer.store';
import { TasksStore } from '../tasks/store/tasks.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { TimerControlsComponent } from './components/timer-controls/timer-controls.component';

@Component({
  selector: 'sb-timer',
  standalone: true,
  imports: [
    SbCardComponent, SbEmptyStateComponent, SbSpinnerComponent,
    SbBehaviorBadgeComponent, DurationPipe, CoinsPipe, RelativeDatePipe, PageTransitionDirective,
    TimerControlsComponent,
  ],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimerComponent implements OnInit, OnDestroy {
  protected readonly timer = inject(TimerStore);
  protected readonly tasks = inject(TasksStore);

  readonly elapsed = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.timer.initialize();
    this.tasks.load();
    this.timer.loadPaged();
    this.startTick();
  }

  ngOnDestroy(): void {
    this.stopTick();
  }

  private startTick(): void {
    this.intervalId = setInterval(() => {
      if (this.timer.isRunning()) {
        this.elapsed.set(this.timer.elapsedSeconds());
      }
    }, 1000);
  }

  private stopTick(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  startTimer(taskId: string): void {
    this.timer.start(taskId);
  }

  stopTimer(): void {
    this.timer.stop();
    this.elapsed.set(0);
  }

  formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
