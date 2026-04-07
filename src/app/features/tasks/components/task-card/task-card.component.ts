import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TaskDto } from '@shared/models/task.models';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { TimerStore } from '@features/timer/store/timer.store';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';

@Component({
  selector: 'sb-task-card',
  standalone: true,
  imports: [RelativeDatePipe, SbBehaviorBadgeComponent, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  protected readonly timer = inject(TimerStore);

  task = input.required<TaskDto>();
  cardClicked = output<TaskDto>();
  menuClicked = output<void>();
  duplicateClicked = output<void>();
  editClicked = output<void>();

  readonly isActive = computed(() => this.timer.activeTaskId() === this.task().id);
  
  readonly displayElapsed = computed(() => {
    if (this.isActive()) {
      return this.timer.elapsedSeconds();
    }
    return this.task().totalTrackedSeconds ?? 0;
  });

  onIconClick(e: MouseEvent): void {
    e.stopPropagation();
    this.menuClicked.emit();
  }

  onDuplicateClick(e: MouseEvent): void {
    e.stopPropagation();
    this.duplicateClicked.emit();
  }

  onEditClick(e: MouseEvent): void {
    e.stopPropagation();
    this.editClicked.emit();
  }

  toggleTimer(event: Event): void {
    event.stopPropagation();
    if (this.isActive()) {
      if (this.timer.isRunning() && !this.timer.isPaused()) {
         this.timer.pauseTimer();
      } else {
         this.timer.resumeTimer();
      }
    } else {
      this.timer.start(this.task().id);
    }
  }
}
