import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DayNavigatorComponent } from './components/day-navigator/day-navigator.component';
import { TimelineBlockComponent } from './components/timeline-block/timeline-block.component';
import { TimelineEvent, SessionTimelineEvent, TaskTimelineEvent } from './models/timeline.models';
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
  template: `
    <div class="page-container max-w-3xl mx-auto py-6" sbPage>
      
      <div class="mb-8" sbAnimate="fadeUp">
        <h1 class="section-title text-center">Your Timeline</h1>
        <p class="text-subtle mt-1 text-sm text-center">A chronological view of your day's productivity.</p>
      </div>

      <div sbAnimate="fadeUp" style="animation-delay: 0.1s;">
        <sb-day-navigator 
          [date]="currentDate()" 
          (previous)="changeDay(-1)"
          (next)="changeDay(1)"
        />
      </div>

      <div class="timeline-container mt-8" sbAnimate="fadeUp" style="animation-delay: 0.2s;">
        @if (eventsForDay().length === 0) {
          <sb-empty-state 
            icon="📅"
            title="No activity recorded"
            message="You haven't completed any tasks or focus sessions on this day."
          />
        } @else {
          <!-- We skip rendering gaps for V1 complexity, just listing events -->
          @for (evt of eventsForDay(); track evt.id) {
            <sb-timeline-block [event]="evt" />
          }
          
          <!-- Endcap dot -->
          <div class="flex gap-4">
            <div class="w-16 flex-shrink-0"></div>
            <div class="relative flex flex-col items-center">
              <div class="w-3 h-3 rounded-full bg-border mt-1"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .text-subtle { color: var(--color-text-muted); }
    .bg-border { background: var(--color-border); }
  `]
})
export class DayTimelineComponent {
  private readonly tasksStore   = inject(TasksStore);
  private readonly timerStore   = inject(TimerStore);
  private readonly foldersStore = inject(FoldersStore);
  private readonly titleService = inject(Title);

  currentDate = signal<Date>(new Date());

  constructor() {
    this.titleService.setTitle('Timeline | Sunbula');
    // Ensure data exists
    if(this.tasksStore.allTasks().length === 0) this.tasksStore.loadAll();
    if(this.timerStore.allSessions().length === 0) this.timerStore.loadAll();
    if(this.foldersStore.allFolders().length === 0) this.foldersStore.loadAll();
  }

  changeDay(delta: number): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + delta);
    this.currentDate.set(d);
  }

  eventsForDay = computed<TimelineEvent[]>(() => {
    const targetDateStr = this.currentDate().toDateString();
    
    // Process Tasks
    const taskEvents: TaskTimelineEvent[] = this.tasksStore.allTasks()
      .filter(t => t.status === TaskStatus.Done)
      .filter(t => new Date(t.updatedAt || t.createdAt).toDateString() === targetDateStr)
      .map(t => {
        const folder = t.folderId ? this.foldersStore.allFolders().find(f => f.id === t.folderId) : undefined;
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

    // Process Sessions
    const sessionEvents: SessionTimelineEvent[] = this.timerStore.allSessions()
      .filter(s => new Date(s.startTime).toDateString() === targetDateStr)
      .map(s => ({
        id: `s_${s.id}`,
        type: 'session',
        title: s.notes || 'Focus Session',
        time: new Date(s.endTime || s.startTime), // Use endTime to place it in timeline where it finished
        behaviorType: s.behaviorType,
        color: '#8B5CF6', // Purple for sessions
        durationSecs: s.duration,
        coinsEarned: s.coinsEarned
      }));

    // Merge & Sort Chronologically (oldest first, reading downwards)
    return [...taskEvents, ...sessionEvents].sort((a, b) => a.time.getTime() - b.time.getTime());
  });
}
