import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskDto } from '@shared/models/task.models';
import { TaskStatus, BEHAVIOR_META } from '@shared/models/enums';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';

@Component({
  selector: 'sb-task-card',
  standalone: true,
  imports: [RelativeDatePipe, SbBehaviorBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css',
})
export class TaskCardComponent {
  task        = input.required<TaskDto>();
  cardClicked = output<TaskDto>();
  menuClicked = output<TaskDto>();

  onIconClick(e: MouseEvent): void {
    e.stopPropagation();
    this.menuClicked.emit(this.task());
  }
}
