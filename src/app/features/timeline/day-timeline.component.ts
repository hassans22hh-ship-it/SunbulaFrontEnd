import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DayNavigatorComponent } from './components/day-navigator/day-navigator.component';
import { TimelineBlockComponent } from './components/timeline-block/timeline-block.component';
import { LocalTimelineEvent } from './components/timeline-block/timeline-block.component';
import { TasksStore } from '@features/tasks/store/tasks.store';
import { TimerStore } from '@features/timer/store/timer.store';
import { FoldersStore } from '@features/folders/store/folders.store';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { AnimateDirective } from '@shared/directives/animate.directive';
import { TaskStatus } from '@shared/models/enums';

@Component({
  selector: 'sb-day-timeline',
  standalone: true,
  imports: [DayNavigatorComponent, TimelineBlockComponent, SbEmptyStateComponent, AnimateDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './day-timeline.component.html',
  styleUrl: './day-timeline.component.css',
})
export class DayTimelineComponent {
  private readonly tasksStore = inject(TasksStore);
  private readonly timerStore = inject(TimerStore);
  private readonly foldersStore = inject(FoldersStore);
  private readonly titleService = inject(Title);

  currentDate = signal<Date>(new Date());

  constructor() {
    this.titleService.setTitle('Timeline | Sunbula');
    if (this.tasksStore.tasks().length === 0) this.tasksStore.load();
    if (this.timerStore.sessions().length === 0) this.timerStore.loadAll();
    if (this.foldersStore.folders().length === 0) this.foldersStore.load();
  }

  changeDay(delta: number): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + delta);
    this.currentDate.set(d);
  }

  eventsForDay = computed<LocalTimelineEvent[]>(() => {
    const targetDateStr = this.currentDate().toDateString();

    const taskEvents: LocalTimelineEvent[] = this.tasksStore.tasks()
      .filter(t => t.status === TaskStatus.Completed)
      .filter(t => new Date(t.updatedAt || t.createdAt).toDateString() === targetDateStr)
      .map(t => {
        const folder = t.folderId ? this.foldersStore.folders().find(f => f.id === t.folderId) : undefined;
        return {
          id: `t_${t.id}`,
          type: 'task',
          title: t.title,
          time: new Date(t.updatedAt || t.createdAt),
          behaviorType: t.behaviorType,
          color: t.color || '#3B82F6',
          folderName: folder?.name
        };
      });

    const sessionEvents: LocalTimelineEvent[] = this.timerStore.sessions()
      .filter(s => new Date(s.startTime).toDateString() === targetDateStr)
      .map(s => ({
        id: `s_${s.id}`,
        type: 'session',
        title: s.taskTitle || 'Focus Session',
        time: new Date(s.endTime || s.startTime),
        behaviorType: s.taskBehavior,
        color: s.taskColor || '#8B5CF6',
        durationSecs: s.durationSeconds ?? 0,
        coinsEarned: s.coinsEarned ?? 0
      }));

    return [...taskEvents, ...sessionEvents].sort((a, b) => a.time.getTime() - b.time.getTime());
  });
}
