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
  template: `
    <div class="summary-card h-full flex flex-col">
      <h3 class="font-semibold text-text mb-4">Daily Summary</h3>

      <!-- Mini timeline of today's activities -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        @if (activities().length === 0) {
          <div class="text-center text-subtle text-sm py-8">
            No activities recorded today yet.
          </div>
        } @else {
          <div class="relative timeline-line">
            @for (act of activities(); track act.id) {
              <div class="timeline-item flex gap-4 mb-4 relative">
                
                <!-- Timeline Dot -->
                <div class="mt-1 flex flex-col items-center">
                  <div class="w-3 h-3 rounded-full z-10" [style.background]="act.color || 'var(--color-primary)'"></div>
                </div>

                <!-- Content -->
                <div class="flex-1 pb-4 border-b border-border/50">
                  <div class="flex justify-between items-start gap-2">
                    <span class="font-medium text-sm text-text">
                      {{ act.title }}
                    </span>
                    <span class="text-xs text-subtle whitespace-nowrap font-mono">
                      {{ act.time | date:'shortTime' }}
                    </span>
                  </div>
                  
                  @if (act.type === 'session') {
                    <div class="text-xs text-subtle mt-1 font-mono bg-surface-2 inline-block px-1.5 py-0.5 rounded">
                      ⏱️ {{ act.durationSecs | duration:'words' }}
                    </div>
                  } @else if (act.type === 'task') {
                    <div class="text-xs text-success mt-1 inline-block bg-success/10 px-1.5 py-0.5 rounded">
                      ✅ Completed
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .summary-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .text-text { color: var(--color-text); }
    .text-subtle { color: var(--color-text-muted); }
    .text-success { color: var(--color-success); }
    .bg-surface-2 { background: var(--color-surface-2); }
    .border-border { border-color: var(--color-border); }
    
    .timeline-line::before {
      content: '';
      position: absolute;
      top: 0; bottom: 0; left: 5px;
      width: 2px;
      background: var(--color-border);
      z-index: 0;
    }
    .timeline-item:last-child .border-b { border-bottom: none; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  `]
})
export class DailySummaryComponent {
  tasks    = input<TaskDto[]>([]);
  sessions = input<TimerSessionDto[]>([]);

  // Derived signal computed for the view
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
