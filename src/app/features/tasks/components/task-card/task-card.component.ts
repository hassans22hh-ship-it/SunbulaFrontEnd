import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
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
  deleteClicked = output<void>();
  duplicateClicked = output<void>();
  editClicked = output<void>();
  completeClicked = output<void>();
  activateClicked = output<void>();
  archiveClicked = output<void>();
  unarchiveClicked = output<void>();

  showMenu = signal(false);

  readonly isActive = computed(() => this.timer.activeSessions().some((s: any) => s.taskId === this.task().id));
  
  readonly isPaused = computed(() => {
    const session = this.timer.activeSessions().find((s: any) => s.taskId === this.task().id);
    return session ? session.isPaused : false;
  });
  
  readonly displayElapsed = computed(() => {
    const session = this.timer.activeSessions().find((s: any) => s.taskId === this.task().id);
    if (session) {
      return session.durationSeconds || 0;
    }
    return this.task().totalTrackedSeconds ?? 0;
  });

  onIconClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  onDeleteClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    this.deleteClicked.emit();
  }

  onDuplicateClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    this.duplicateClicked.emit();
  }

  onEditClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    this.editClicked.emit();
  }

  onCompleteClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    this.completeClicked.emit();
  }

  onActivateClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    this.activateClicked.emit();
  }

  onArchiveToggleClick(e: MouseEvent): void {
    e.stopPropagation();
    this.showMenu.set(false);
    if (this.task().isArchived) {
      this.unarchiveClicked.emit();
    } else {
      this.archiveClicked.emit();
    }
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  toggleTimer(event: Event): void {
    event.stopPropagation();
    if (this.isActive()) {
      const session = this.timer.activeSessions().find((s: any) => s.taskId === this.task().id);
      if (session) {
        if (!session.isPaused) {
           this.timer.pauseTimer(session.id);
        } else {
           this.timer.resumeTimer(session.id);
        }
      }
    } else {
      this.timer.start(this.task().id);
    }
  }
}
