import { Component, ChangeDetectionStrategy, computed, inject, Input, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TasksStore } from '../store/tasks.store';
import { FoldersStore } from '../../folders/store/folders.store';
import { TasksApiService } from '../services/tasks.api.service';
import { TimeSessionApiService } from '../../timer/services/time-session.api.service';
import { TimeSessionDto } from '@shared/models/timer.models';
import { TimerStore } from '../../timer/store/timer.store';
import { TaskDto } from '@shared/models/task.models';
import { SbBehaviorBadgeComponent } from '@shared/ui/behavior-badge/sb-behavior-badge.component';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { CoinsPipe } from '@shared/pipes/coins.pipe';
import { SbSpinnerComponent } from '@shared/ui/spinner/sb-spinner.component';
import { SbEmptyStateComponent } from '@shared/ui/empty-state/sb-empty-state.component';
import { PageTransitionDirective } from '@core/animation/page-transition.directive';
import { SbIconCoinComponent } from '@shared/ui/icons/coin-icon.component';

import { SbHeatmapComponent } from '@shared/ui/heatmap/sb-heatmap.component';
import { ReportsApiService } from '../../reports/services/reports.api.service';
import { DailyTrendDto } from '@shared/models/reports.models';
import { SbBehaviorDonutComponent } from '../../timer/components/behavior-donut/behavior-donut.component';

@Component({
  selector: 'sb-task-detail',
  standalone: true,
  imports: [
    DatePipe, SbBehaviorBadgeComponent, 
    DurationPipe, CoinsPipe, SbSpinnerComponent, 
    SbEmptyStateComponent, PageTransitionDirective,
    SbIconCoinComponent, SbBehaviorDonutComponent
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailComponent implements OnInit {
  protected readonly tasksStore = inject(TasksStore);
  protected readonly tasksApi = inject(TasksApiService);
  protected readonly timerApi = inject(TimeSessionApiService);
  protected readonly timerStore = inject(TimerStore);
  protected readonly reportsApi = inject(ReportsApiService);
  protected readonly foldersStore = inject(FoldersStore);
  protected readonly router = inject(Router);

  // Input bound from route parameter
  @Input() set id(value: string) {
    this.taskId.set(value);
    this.loadTask(value);
    this.loadSessions(value);
  }

  readonly taskId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly sessions = signal<TimeSessionDto[]>([]);
  readonly detailedTask = signal<TaskDto | null>(null);

  readonly task = computed(() => {
    const id = this.taskId();
    if (!id) return null;
    // Try store first (instant if already loaded)
    const fromStore = this.tasksStore.tasks().find(t => t.id === id);
    if (fromStore) return fromStore;
    // Fallback to detailed task fetched from API
    return this.detailedTask();
  });

  readonly folder = computed(() => {
    const t = this.task();
    if (!t) return null;
    return t.folder || this.foldersStore.folders().find(f => f.id === t.folderId) || null;
  });

  readonly activeSession = computed(() => {
    const id = this.taskId();
    if (!id) return null;
    return this.timerStore.activeSessions().find(s => s.taskId === id) || null;
  });

  readonly totalTrackedSeconds = computed(() => {
    return this.sessions().reduce((acc, s) => acc + (s.durationSeconds ?? s.duration ?? 0), 0);
  });

  readonly totalCoinsEarned = computed(() => {
    return this.sessions().reduce((acc, s) => acc + (s.coinsEarned ?? 0), 0);
  });

  readonly dailyTrend = computed<DailyTrendDto[]>(() => {
    const map = new Map<string, number>();
    this.sessions().forEach(s => {
      const date = new Date(s.startTime!).toISOString().split('T')[0];
      map.set(date, (map.get(date) || 0) + (s.durationSeconds ?? s.duration ?? 0));
    });

    return Array.from(map.entries()).map(([date, totalSeconds]) => ({
      date,
      totalSeconds,
      positiveSeconds: 0,
      negativeSeconds: 0,
      neutralSeconds: 0,
      restSeconds: 0,
      coinsEarned: 0
    }));
  });

  readonly dailyTrendTable = computed(() => {
    return [...this.dailyTrend()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  readonly behaviorBreakdown = computed(() => {
    const map = new Map<number, number>();
    this.sessions().forEach(s => {
       const type = (s as any).behaviorType ?? this.task()?.behaviorType ?? 1;
       const sec = s.durationSeconds ?? s.duration ?? ((s as any).durationMinutes ? (s as any).durationMinutes * 60 : 0);
       map.set(type, (map.get(type) || 0) + sec);
    });
    return Array.from(map.entries()).map(([type, totalSeconds]) => ({
       behaviorType: Number(type),
       totalSeconds
    })).sort((a, b) => b.totalSeconds - a.totalSeconds);
  });

  ngOnInit() {
    if (this.tasksStore.tasks().length === 0) {
      this.tasksStore.load();
    }
  }

  /** Fetch task details via dedicated endpoint (fallback for deep links) */
  private loadTask(taskId: string) {
    // Only fetch if not already in store
    const existing = this.tasksStore.tasks().find(t => t.id === taskId);
    if (!existing) {
      this.tasksApi.getDetails(taskId).subscribe({
        next: (task) => this.detailedTask.set(task),
        error: () => {
          // Try the simpler endpoint as a second fallback
          this.tasksApi.getById(taskId).subscribe({
            next: (task) => this.detailedTask.set(task),
            error: () => this.router.navigate(['/tasks']),
          });
        },
      });
    }
  }

  private loadSessions(taskId: string) {
    this.isLoading.set(true);
    // Fetch all history and filter by id, as backend doesn't take taskId query param directly in swagger
    this.timerApi.getHistory().subscribe({
      next: (res: any) => {
        const rawSessions: TimeSessionDto[] = Array.isArray(res) ? res : (res.data ?? res.items ?? []);
        const filtered = rawSessions.filter(s => s.taskId === taskId).map(s => {
           let startTime = s.startTime;
           if (typeof startTime === 'string' && !startTime.endsWith('Z') && !startTime.includes('+')) {
             startTime += 'Z';
           }
           let endTime = s.endTime;
           if (typeof endTime === 'string' && !endTime.endsWith('Z') && !endTime.includes('+')) {
             endTime += 'Z';
           }
           const sAny = s as any;
           let durationSeconds = s.durationSeconds ?? s.duration ?? (sAny.durationMinutes ? sAny.durationMinutes * 60 : 0);
           
           // Fallback to frontend calculation if duration is 0 but we have valid start and end times
           if (!durationSeconds && startTime && endTime) {
             const startTs = new Date(startTime).getTime();
             const endTs = new Date(endTime).getTime();
             if (!isNaN(startTs) && !isNaN(endTs) && endTs > startTs) {
                durationSeconds = Math.floor((endTs - startTs) / 1000);
             }
           }
           
           // Re-calculate coins for frontend display if duration > 0 and coins is 0
           let coinsEarned = s.coinsEarned ?? s.coins ?? 0;
           if (!coinsEarned && durationSeconds > 0) {
             const durationHours = durationSeconds / 3600;
             let rate = 0;
             switch (sAny.behaviorType) {
               case 0: rate = 2; break; // Positive
               case 1: rate = 1; break; // Neutral
               case 2: rate = -1; break; // Negative
               case 3: rate = 1; break; // Rest
             }
             coinsEarned = durationHours * rate;
           }

           return { ...s, startTime, endTime, durationSeconds, coinsEarned };
        }).sort((a, b) => {
           return new Date(b.startTime!).getTime() - new Date(a.startTime!).getTime();
        });
        this.sessions.set(filtered);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }

  startTimer() {
    const id = this.taskId();
    if (id) {
      this.timerStore.start(id);
    }
  }

  pauseTimer(sessionId: string) {
    this.timerStore.pauseTimer(sessionId);
  }

  resumeTimer(sessionId: string) {
    this.timerStore.resumeTimer(sessionId);
  }

  stopTimer(sessionId: string) {
    this.timerStore.stop(sessionId);
    // Reload local sessions history to reflect the stopped session
    const id = this.taskId();
    if (id) {
      setTimeout(() => this.loadSessions(id), 500); // Reload after stopping
    }
  }
}
