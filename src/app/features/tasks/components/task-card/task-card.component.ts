import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TaskDto } from '../../models/task.models';
import { TaskStatus, BEHAVIOR_META } from '@shared/models/enums';
import { RelativeDatePipe } from '@shared/pipes/relative-date.pipe';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';

@Component({
  selector: 'sb-task-card',
  standalone: true,
  imports: [RelativeDatePipe, SbBehaviorBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="task-card p-3 flex flex-col gap-3" 
      [style.border-left-color]="task().color"
      (click)="cardClicked.emit(task())"
    >
      <!-- Title & Emoji -->
      <div class="flex items-start justify-between gap-2">
        <h4 class="font-medium text-sm leading-tight m-0" style="color: var(--color-text);">
          @if (task().emoji) {
            <span class="mr-1">{{ task().emoji }}</span>
          }
          {{ task().title }}
        </h4>
        
        <!-- Actions Dropdown Trigger (Optional, simplified for now) -->
        <button class="icon-btn text-subtle" (click)="onIconClick($event)" title="Options">•••</button>
      </div>

      <!-- Footer: Metadata -->
      <div class="flex items-center justify-between text-xs mt-auto">
        <div class="flex gap-2 items-center">
          <sb-behavior-badge [behavior]="task().behaviorType" />
          
          @if (task().folder) {
            <div class="flex items-center gap-1 text-subtle" [title]="task().folder!.name">
              <span class="w-2 h-2 rounded-full" [style.background]="task().folder!.color"></span>
              <span class="max-w-[70px] truncate">{{ task().folder!.name }}</span>
            </div>
          }
        </div>
        
        <div class="text-subtle" title="Created {{ task().createdAt | relativeDate }}">
          {{ task().createdAt | relativeDate }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-left-width: 4px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      min-height: 100px;
      transition: box-shadow 0.2s, transform 0.2s, border-color 0.2s;
    }
    .task-card:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
      border-color: var(--color-primary);
    }
    .text-subtle { color: var(--color-text-muted); }
    .icon-btn {
      background: none; border: none; cursor: pointer;
      padding: 0 4px; border-radius: var(--radius-sm);
      transition: background 0.15s;
    }
    .icon-btn:hover { background: var(--color-surface-2); color: var(--color-text); }
  `]
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
