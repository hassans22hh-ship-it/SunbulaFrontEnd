import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskDto } from '@features/tasks/models/task.models';
import { TimerSessionDto } from '@features/timer/models/timer.models';
import { TaskStatus } from '@shared/models/enums';
import { DurationPipe } from '@shared/pipes/duration.pipe';

@Component({
  selector: 'sb-daily-summary',
  standalone: true,
  imports: [DatePipe, DurationPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './daily-summary.component.html',
  styleUrl: './daily-summary.component.css',
})
export class DailySummaryComponent {
  tasks    = input<TaskDto[]>([]);
  sessions = input<TimerSessionDto[]>([]);

  activities = computed(() => {
    const today = new Date().toDateString();
    const tasks = this.tasks();
    const sessions = this.sessions();

    const doneTasks = tasks
      .filter(t => t.status === TaskStatus.Done)
      .filter(t => new Date(t.updatedAt || t.createdAt).toDateString() === today)
      .map(t => ({
        id: `task_${t.id}`,
        type: 'task',
        title: t.title,
        time: new Date(t.updatedAt || t.createdAt),
        color: t.color,
        durationSecs: 0
      }));

    const todaySessions = sessions
      .filter(s => new Date(s.startTime).toDateString() === today)
      .map(s => ({
        id: `session_${s.id}`,
        type: 'session',
        title: s.notes || 'Focus Session',
        time: new Date(s.endTime || s.startTime),
        color: 'var(--color-primary)',
        durationSecs: s.duration
      }));

    return [...doneTasks, ...todaySessions].sort((a, b) => b.time.getTime() - a.time.getTime());
  });
}
