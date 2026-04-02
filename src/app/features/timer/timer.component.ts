import { DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { TimerStore } from './store/timer.store';
import { TasksStore } from '../tasks/store/tasks.store';
import { SbCardComponent } from '@shared/ui/card/sb-card.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbModalComponent } from '@shared/ui/modal/sb-modal.component';
import { TimerControlsComponent } from './components/timer-controls/timer-controls.component';
import { SbButtonComponent } from '@shared/ui/button/sb-button.component';

@Component({
  selector: 'sb-timer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, 
    SbCardComponent, SbEmptyStateComponent, SbSpinnerComponent, SbModalComponent, SbButtonComponent,
    SbBehaviorBadgeComponent, DurationPipe, DecimalPipe, RelativeDatePipe, PageTransitionDirective,
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
  readonly isEditModalOpen = signal(false);
  readonly sessionToEdit = signal<any>(null);
  
  // Modal Form State
  readonly editStartTime = signal('');
  readonly editEndTime = signal('');
  readonly editTaskId = signal('');

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
        this.timer.updateTicker();
        this.elapsed.set(this.timer.elapsedSeconds() ?? 0);
      }
    }, 1000);
  }

  private stopTick(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  deleteSession(id: string): void {
    this.timer.deleteSession(id);
  }

  editSession(session: any): void {
    this.sessionToEdit.set(session);
    // Format dates for datetime-local input
    this.editStartTime.set(new Date(session.startTime).toISOString().slice(0, 16));
    this.editEndTime.set(session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '');
    this.editTaskId.set(session.taskId);
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.sessionToEdit.set(null);
  }

  async saveEdit(): Promise<void> {
    const session = this.sessionToEdit();
    if (!session) return;

    await this.timer.updateSession(session.id, {
      ...session,
      startTime: new Date(this.editStartTime()).toISOString(),
      endTime: this.editEndTime() ? new Date(this.editEndTime()).toISOString() : null,
      taskId: this.editTaskId()
    });
    this.closeEditModal();
  }

  startTimer(taskId: string): void {
    this.timer.start(taskId);
  }

  stopTimer(): void {
    this.timer.stop();
    this.elapsed.set(0);
  }

  calculateOffset(seconds: number): number {
    const circumference = 565.48;
    const progress = (seconds % 3600) / 3600;
    return circumference * (1 - progress);
  }

  formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}
